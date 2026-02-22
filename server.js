/* ===============================
   🌱 ENV SETUP
================================ */
require('dotenv').config({ path: __dirname + '/services/payment.env' });

if (!process.env.PRIVATE_KEY || !process.env.PUBLIC_KEY) {
  throw new Error("❌ PRIVATE_KEY oder PUBLIC_KEY fehlt");
}

/* ===============================
   ⚙️ IMPORTS
================================ */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Connection, PublicKey } = require('@solana/web3.js');
const crypto = require('crypto');
const path = require('path');

/* ===============================
   🚀 APP
================================ */
const app = express();
app.use(cors());
app.use(bodyParser.json());

// pay.html ausliefern
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pay.html'));
});

/* ===============================
   🌐 SOLANA
================================ */
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);

/* ===============================
   📦 ORDERS (IN MEMORY)
================================ */
const orders = new Map();

/* ===============================
   🟢 CREATE ORDER
================================ */
app.post('/api/order/create', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: "Ungültiger Betrag" });

    const orderId = crypto.randomBytes(8).toString("hex");

    orders.set(orderId, {
      amount: Number(amount),
      wallet: process.env.PUBLIC_KEY,
      createdAt: Date.now(),
      paid: false
    });

    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=solana:${process.env.PUBLIC_KEY}?amount=${amount.toFixed(2)}`;

    res.json({
      orderId,
      publicKey: process.env.PUBLIC_KEY,
      qrCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order Fehler" });
  }
});

/* ===============================
   🔍 CHECK PAYMENT
================================ */
app.post('/api/order/check', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = orders.get(orderId);

    if (!order) return res.json({ paid: false });
    if (order.paid) return res.json({ paid: true });

    const balance = await connection.getBalance(new PublicKey(order.wallet));

    if (balance > 0) {
      order.paid = true;
      orders.set(orderId, order);
      return res.json({ paid: true });
    }

    res.json({ paid: false });

  } catch (err) {
    console.error(err);
    res.status(500).json({ paid: false });
  }
});

/* ===============================
   🔌 SERVER START
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});