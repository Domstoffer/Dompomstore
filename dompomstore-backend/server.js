require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Keypair } = require('@solana/web3.js');
const db = require('./database');
const solana = require('./solana');
const ethereum = require('./ethereum');
const path = require('path');
const { body, validationResult, param } = require('express-validator');
const fs = require('fs');

// Import secure end-to-end communication services
const pgpService = require('./pgpService');
const mailService = require('./mailService');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// 1. SECURITY MIDDLEWARE ENHANCEMENTS
// ==========================================

// Enable strict Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com", "https://www.paypal.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://picsum.photos", "https://upload.wikimedia.org", "https://raw.githubusercontent.com"],
      connectSrc: ["'self'", "https://api.mainnet-beta.solana.com", "https://api.coingecko.com", "https://api-m.sandbox.paypal.com", "https://api-m.paypal.com"]
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Apply flexible CORS policy for local network testing
app.use(cors({
  origin: function (origin, callback) {
    // Allow local development and mobile network IPs
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked cross-origin request.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE']
}));

app.use(express.json({ limit: '10kb' })); // Mitigate Large Payload DoS
app.use(cookieParser());

// Serve Static Frontend securely preventing Directory Traversal
app.use(express.static(path.join(__dirname, '../'), {
  dotfiles: 'ignore', // Prevent serving hidden files like .env
  index: false
}));

// Rate Limiting strategies
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests from this IP, please try again later." });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many login attempts." });
const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many checkout attempts." });

app.use('/api/', globalLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/create-order', paymentLimiter);

// ==========================================
// 2. SECURE AUTHENTICATION (JWT)
// ==========================================

function authenticateToken(req, res, next) {
  const token = req.cookies.adminToken;
  if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Access Denied: Invalid Token" });
    req.user = user;
    next();
  });
}

// ==========================================
// 3. CHECKOUT & PAYMENT API (SECURED)
// ==========================================

// Helper to escape simple HTML string to prevent XSS in DB storage
const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
};

app.post('/api/create-order', [
  // Validate order payload schema strictly
  body('cart').isArray().notEmpty(),
  body('shipping.firstname').isString().notEmpty().trim(),
  body('shipping.lastname').isString().notEmpty().trim(),
  body('shipping.email').isEmail().normalizeEmail(),
  body('shipping.street').isString().notEmpty().trim(),
  body('source').optional().isIn(['public', 'private'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid Input Validation", details: errors.array() });

  const { cart, shipping, source } = req.body;
  const orderSource = source === 'private' ? 'private' : 'public';

  // Sanitize shipping fields against XSS
  const safeShipping = {
    firstname: sanitizeHtml(shipping.firstname),
    lastname: sanitizeHtml(shipping.lastname),
    email: shipping.email, // Normalized 
    street: sanitizeHtml(shipping.street),
    city: sanitizeHtml(shipping.city),
    zip: sanitizeHtml(shipping.zip),
    country: sanitizeHtml(shipping.country)
  };

  const names = cart.map(item => item.name);
  const placeholders = names.map(() => '?').join(',');

  // SQL INJECTION PROTECTION: Using parameterized arrays strictly
  db.all(`SELECT name, price FROM products WHERE name IN (${placeholders})`, names, async (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });

    let calculatedTotal = 0;
    const validCart = [];

    cart.forEach(cartItem => {
      const product = rows.find(r => r.name === cartItem.name); // STRICT MATCHING
      if (product) {
        const qty = parseInt(cartItem.quantity, 10) || 1;
        if (qty > 0 && qty < 100) { // Limit absurd quantities
          calculatedTotal += product.price * qty;
          validCart.push({ name: sanitizeHtml(product.name), price: product.price, quantity: qty });
        }
      }
    });

    if (validCart.length === 0) return res.status(400).json({ error: "Invalid cart items detected." });

    const referenceKeypair = Keypair.generate();
    const referencePubKey = referenceKeypair.publicKey.toString();
    const orderId = Date.now().toString() + Math.floor(Math.random() * 1000);

    let encryptedShipping;
    try {
      encryptedShipping = await pgpService.encryptOrderData(safeShipping);
    } catch (e) {
      console.error('Failed to encrypt shipping data:', e);
      return res.status(500).json({ error: "Encryption failure. Order aborted." });
    }

    db.run(`INSERT INTO orders (id, items, total, shipping, wallet, status, reference, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        JSON.stringify(validCart),
        calculatedTotal,
        encryptedShipping, // Replace JSON.stringify(safeShipping) with the Ascii Armored PGP String
        solana.MERCHANT_WALLET.toString(),
        'pending',
        referencePubKey,
        orderSource
      ],
      function (err) {
        if (err) return res.status(500).json({ error: "Failed to create order securely" });

        res.json({
          orderId: orderId,
          wallets: { solana: solana.MERCHANT_WALLET.toString(), evm: ethereum.MERCHANT_EVM_WALLET },
          amount: calculatedTotal,
          reference: referencePubKey,
          source: orderSource
        });
      }
    );
  });
});

app.get('/api/check-payment/:id', param('id').isAlphanumeric(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid Order ID" });

  db.get(`SELECT status, reference FROM orders WHERE id = ?`, [req.params.id], (err, order) => {
    if (err || !order) return res.status(404).json({ error: "Order not found" });
    res.json({ status: order.status, reference: order.reference });
  });
});

app.post('/api/verify-payment', [
  body('orderId').isAlphanumeric(),
  body('signature').isString().notEmpty().trim(),
  body('token').optional().isString().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid Request payload" });

  const { orderId, signature, token } = req.body;
  const supportedTokens = Object.keys(solana.SUPPORTED_TOKENS);
  const tokenSymbol = supportedTokens.includes((token || '').toUpperCase()) ? token.toUpperCase() : 'USDC';

  db.get(`SELECT total, status, reference FROM orders WHERE id = ?`, [orderId], async (err, order) => {
    if (err || !order) return res.status(404).json({ error: "Order not found" });
    if (order.status === 'paid') return res.status(400).json({ error: "Already marked as paid" });

    // SERVER-SIDE CRYPTO VERIFICATION PREVENTS SPOOFING
    const { isValid, sender } = await solana.verifyTransaction(signature, order.total, order.reference, tokenSymbol);

    if (isValid) {
      const effectiveAmount = solana.getEffectiveAmount(order.total, tokenSymbol);
      db.run(`UPDATE orders SET status = 'paid', reference = ?, txHash = ?, network = ?, token = ?, walletSender = ? WHERE id = ?`,
        [`${tokenSymbol}:${signature}`, signature, 'Solana', tokenSymbol, sender, orderId], async (err) => {
          if (err) return res.status(500).json({ error: "Database commit failed" });

          // --- PGP SECURE NOTIFICATION TRIGGER ---
          try {
            db.get('SELECT * FROM orders WHERE id = ?', [orderId], async (err, fullOrder) => {
              if (!err && fullOrder) {
                const orderPayload = { ...fullOrder, items: JSON.parse(fullOrder.items || '[]'), shipping: JSON.parse(fullOrder.shipping || '{}') };
                const encryptedAscii = await pgpService.encryptOrderData(orderPayload);
                mailService.sendSecureOrderEmail(orderId, encryptedAscii); // Fire and forget async mail sending
              }
            });
          } catch (e) { console.error('PGP Mailer Exception:', e); }

          res.json({ success: true, status: 'paid', token: tokenSymbol, discountApplied: effectiveAmount < order.total });
        });
    } else {
      res.status(400).json({ error: "On-Chain Payment verification failed. Signature invalid or amount mismatch." });
    }
  });
});

app.post('/api/verify-evm-payment', [
  body('orderId').isAlphanumeric(),
  body('txHash').isString().notEmpty().trim(),
  body('sender').isString().notEmpty().trim(),
  body('token').optional().isString().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid Request payload" });

  const { orderId, txHash, sender, token } = req.body;
  const allowedTokens = Object.keys(ethereum.EVM_TOKENS);
  const tokenSymbol = allowedTokens.includes((token || '').toUpperCase()) ? token.toUpperCase() : 'USDC';

  // ANTI-REPLAY PROTECTION
  db.get(`SELECT id FROM orders WHERE txHash = ? AND status = 'paid'`, [txHash], async (err, existing) => {
    if (existing && existing.id !== orderId) {
      return res.status(400).json({ error: "Transaction Hash already redeemed" });
    }

    db.get(`SELECT total, status FROM orders WHERE id = ?`, [orderId], async (err, order) => {
      if (err || !order) return res.status(404).json({ error: "Order not found" });
      if (order.status === 'paid') return res.status(400).json({ error: "Already marked as paid" });

      const effectiveAmount = ethereum.getEffectiveAmount(order.total, tokenSymbol);

      // SERVER-SIDE EVM CRYPTO VERIFICATION
      const isValid = await ethereum.verifyEVMPayment(txHash, order.total, sender, tokenSymbol);

      if (isValid) {
        db.run(`UPDATE orders SET status = 'paid', reference = ?, txHash = ?, network = ?, token = ?, walletSender = ? WHERE id = ?`,
          [`${tokenSymbol}:${txHash}`, txHash, 'Ethereum', tokenSymbol, sender, orderId], async (err) => {
            if (err) return res.status(500).json({ error: "Database commit failed" });

            // --- PGP SECURE NOTIFICATION TRIGGER ---
            try {
              db.get('SELECT * FROM orders WHERE id = ?', [orderId], async (err, fullOrder) => {
                if (!err && fullOrder) {
                  const orderPayload = { ...fullOrder, items: JSON.parse(fullOrder.items || '[]'), shipping: JSON.parse(fullOrder.shipping || '{}') };
                  const encryptedAscii = await pgpService.encryptOrderData(orderPayload);
                  mailService.sendSecureOrderEmail(orderId, encryptedAscii);
                }
              });
            } catch (e) { console.error('PGP Mailer Exception:', e); }

            res.json({ success: true, status: 'paid', token: tokenSymbol, discountApplied: effectiveAmount < order.total });
          });
      } else {
        res.status(400).json({ error: "EVM Payment verification failed. Transaction invalid or amount mismatch." });
      }
    });
  });
});

// ==========================================
// 4. ADMIN DASHBOARD API (SECURED)
// ==========================================

app.post('/api/admin/login', [
  body('username').isString().trim().escape(),
  body('password').isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid credentials format" });

  const { username, password } = req.body;

  // SQL Injection protected by prepared statements
  db.get(`SELECT * FROM admins WHERE username = ?`, [username], (err, admin) => {
    if (err || !admin) {
      // Generic error response to prevent user enumeration
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Secure bcrypt comparison
    if (bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1h' });

      // Secure HttpOnly Cookie creation (Lax to allow cross-port localhost)
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Allow port differences between frondend and backend
        maxAge: 3600000
      });

      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  });
});

app.get('/api/admin/me', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminToken', { httpOnly: true, sameSite: 'strict' });
  res.json({ success: true });
});

app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY createdAt DESC`, [], async (err, rows) => {
    if (err) return res.status(500).json({ error: "Database extraction error" });
    try {
      const ordersPromises = rows.map(async r => {
        let parsedItems = [];
        let parsedShipping = {};

        try { parsedItems = JSON.parse(r.items); } catch (e) { parsedItems = r.items || []; }

        try {
          parsedShipping = JSON.parse(r.shipping);
        } catch (e) {
          if (typeof r.shipping === 'string' && r.shipping.includes('BEGIN PGP MESSAGE')) {
            try {
              const decryptedStr = await pgpService.decryptOrderData(r.shipping);
              parsedShipping = JSON.parse(decryptedStr);
            } catch (decErr) {
              console.error(`Failed to decrypt shipping for order ${r.id}:`, decErr);
              parsedShipping = { error: 'PGP Decryption failed or Corrupted Payload' };
            }
          } else {
            parsedShipping = r.shipping || {};
          }
        }

        return { ...r, items: parsedItems, shipping: parsedShipping };
      });

      const orders = await Promise.all(ordersPromises);
      res.json(orders);
    } catch (processErr) {
      console.error("Critical error mapping orders array:", processErr);
      res.status(500).json({ error: "Order parsing error" });
    }
  });
});

app.delete('/api/admin/orders/:id', authenticateToken, param('id').isAlphanumeric(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid Order ID" });

  db.run(`DELETE FROM orders WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Failed to delete" });
    res.json({ success: true });
  });
});

// ==========================================
// 5. SECURE PGP MANAGEMENT API (ADMIN)
// ==========================================

app.get('/api/admin/pgp/status', authenticateToken, (req, res) => {
  res.json({
    active: true,
    fingerprint: pgpService.getFingerprint(),
    publicKey: pgpService.getPublicKey()
  });
});

app.post('/api/admin/pgp/generate', authenticateToken, async (req, res) => {
  try {
    await pgpService.generateKeys();
    await pgpService.init(); // Refresh fingerprint context
    res.json({ success: true, fingerprint: pgpService.getFingerprint() });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate new PGP keys securely" });
  }
});

app.post('/api/admin/pgp/decrypt', authenticateToken, [
  body('encryptedPayload').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid Encrypted Payload" });

  try {
    const { encryptedPayload } = req.body;
    const decryptedJsonString = await pgpService.decryptOrderData(encryptedPayload);
    res.json({ success: true, decryptedData: JSON.parse(decryptedJsonString) });
  } catch (err) {
    res.status(400).json({ error: "Entschlüsselung fehlgeschlagen. Ungültiger Payload oder Key." });
  }
});

// START SERVER (Harden boot sequence to wait for PGP generation)
app.post('/api/admin/products', authenticateToken, [
  body('id').isString().notEmpty().trim().escape(),
  body('name').isString().notEmpty().trim().escape(),
  body('price').isNumeric(),
  body('currency').isString().notEmpty().trim(),
  body('sizes').isArray(),
  body('stock').isNumeric(),
  body('image').isString().notEmpty().trim(),
  body('description').isString().trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid Input Validation", details: errors.array() });

  const newProduct = req.body;
  const productsFilePath = path.join(__dirname, '../products.js');

  try {
    let fileContent = fs.readFileSync(productsFilePath, 'utf8');

    // Find where the array closes
    const closeBracketIndex = fileContent.lastIndexOf('];');
    if (closeBracketIndex === -1) {
      return res.status(500).json({ error: "Failed to parse products.js structure" });
    }

    // Format new product to inject
    const newProductString = `,\n    {\n        id: "${newProduct.id}",\n        name: "${newProduct.name}",\n        price: ${newProduct.price},\n        currency: "${newProduct.currency}",\n        image: "${newProduct.image}",\n        sizes: ${JSON.stringify(newProduct.sizes)},\n        stock: ${newProduct.stock},\n        description: "${newProduct.description}"\n    }`;

    // Stitch it into the array
    const updatedContent = fileContent.slice(0, closeBracketIndex) + newProductString + '\n' + fileContent.slice(closeBracketIndex);

    fs.writeFileSync(productsFilePath, updatedContent, 'utf8');

    res.json({ success: true, message: "Product added securely to products.js" });
  } catch (e) {
    console.error('Error writing to products.js', e);
    res.status(500).json({ error: "Filesystem write failed." });
  }
});

pgpService.init().then(() => {
  app.listen(PORT, () => {
    console.log(`SECURE Server running on port ${PORT} with Enterprise Protections and PGP Engine Active.`);
  });
}).catch(err => {
  console.error("CRITICAL BOOT FAILURE: Failed to initialize PGP cryptographic service. Terminating.", err);
  process.exit(1);
});