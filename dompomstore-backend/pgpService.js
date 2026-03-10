const openpgp = require('openpgp');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const KEYS_DIR = path.join(__dirname, '.keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.key');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.key');
// Fallback passphrase MUST be set in environment
const PASSPHRASE = process.env.PGP_PASSPHRASE;

class PGPService {
    constructor() {
        this.publicKeyStr = null;
        this.privateKeyStr = null;
        this.fingerprint = null;
    }

    async init() {
        // Ensure .keys directory exists and is restricted to owner only
        if (!fs.existsSync(KEYS_DIR)) {
            fs.mkdirSync(KEYS_DIR, { recursive: true, mode: 0o700 });
            console.log('Created secure .keys directory.');
        }

        if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
            console.log('Loading existing PGP keys...');
            this.privateKeyStr = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
            this.publicKeyStr = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
        } else {
            console.log('No PGP keys found. Generating new ECC (Curve25519) key pair server-side...');
            await this.generateKeys();
        }

        // Extract fingerprint for logging and admin dashboard
        const publicKey = await openpgp.readKey({ armoredKey: this.publicKeyStr });
        this.fingerprint = publicKey.getFingerprint();
        console.log(`PGP Service Initialized. Key Fingerprint: ${this.fingerprint}`);
    }

    async generateKeys() {
        try {
            const { privateKey, publicKey } = await openpgp.generateKey({
                type: 'ecc',            // Use Elliptic Curve Cryptography
                curve: 'curve25519',    // Highly secure and fast
                userIDs: [{ name: 'DomPom System', email: 'system@dompomstore.com' }],
                passphrase: PASSPHRASE, // Encrypt the private key with the passphrase
                format: 'armored'
            });

            this.privateKeyStr = privateKey;
            this.publicKeyStr = publicKey;

            // Save keys explicitly out of public webroot with highly restrictive permissions (600)
            fs.writeFileSync(PRIVATE_KEY_PATH, this.privateKeyStr, { mode: 0o600, encoding: 'utf8' });
            fs.writeFileSync(PUBLIC_KEY_PATH, this.publicKeyStr, { mode: 0o600, encoding: 'utf8' });

            console.log('New PGP key pair successfully generated and securely stored.');
        } catch (err) {
            console.error('Failed to generate PGP keys:', err);
            throw err;
        }
    }

    async encryptOrderData(orderData) {
        if (!this.publicKeyStr) throw new Error('PublicKey not loaded. Call init() first.');

        // Convert sensitive order data to a pristine JSON string
        const plaintext = JSON.stringify(orderData, null, 2);

        // Encrypt exclusively using only the Public Key
        const publicKey = await openpgp.readKey({ armoredKey: this.publicKeyStr });
        const encryptedMessage = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: plaintext }),
            encryptionKeys: publicKey
        });

        return encryptedMessage; // This returns the ASCII Armored PGP string
    }

    async decryptOrderData(encryptedAscii) {
        if (!this.privateKeyStr) throw new Error('PrivateKey not loaded. Call init() first.');

        try {
            console.log('[PGP Debug] Reading private key...');
            let privateKey = await openpgp.readPrivateKey({ armoredKey: this.privateKeyStr });

            console.log(`[PGP Debug] Private key is decrypted? ${privateKey.isDecrypted()}`);
            if (!privateKey.isDecrypted()) {
                console.log('[PGP Debug] Decrypting private key with passphrase...');
                privateKey = await openpgp.decryptKey({
                    privateKey,
                    passphrase: PASSPHRASE
                });
                console.log('[PGP Debug] Private key decrypted successfully.');
            }

            console.log('[PGP Debug] Reading encrypted message...');
            const message = await openpgp.readMessage({ armoredMessage: encryptedAscii });

            console.log('[PGP Debug] Decrypting the message payload...');
            const { data: decrypted } = await openpgp.decrypt({
                message,
                decryptionKeys: privateKey
            });

            console.log('[PGP Debug] Payload successfully decrypted.');
            return decrypted;
        } catch (err) {
            console.error('Failed to decrypt PGP payload on server:', err);
            throw new Error('Decryption Failed. Invalid Key or Corrupted Payload.');
        }
    }

    getPublicKey() {
        return this.publicKeyStr;
    }

    getFingerprint() {
        return this.fingerprint;
    }
}

const pgpService = new PGPService();
module.exports = pgpService;
