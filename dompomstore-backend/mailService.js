const nodemailer = require('nodemailer');
require('dotenv').config();

// Recipient Mail
const TARGET_EMAIL = 'domimadlindl258@iCloud.com';

class MailService {
    constructor() {
        // Initialize standard SMTP transport using env credentials
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendSecureOrderEmail(orderId, encryptedAsciiPayload, retryCount = 0) {
        if (!process.env.SMTP_USER) {
            console.log(`[MAILER] No SMTP Configured. Skipping secure email for Order ${orderId}.`);
            console.log(`[ENCRYPTED PAYLOAD]\n${encryptedAsciiPayload}`);
            return;
        }

        try {
            const mailOptions = {
                from: `"DomPom System" <${process.env.SMTP_USER}>`,
                to: TARGET_EMAIL,
                subject: `Neue Bestellung – DomPom Store (PGP verschlüsselt) - ID: ${orderId}`,
                text: `Eine neue Bestellung ist eingegangen.\nDie Bestelldaten befinden sich im PGP-verschlüsselten Anhang.\nBitte entschlüssele den Anhang lokal mit deinem Private Key.`,
                attachments: [
                    {
                        filename: `order_${orderId}.pgp`,
                        content: encryptedAsciiPayload, // Direct PGP ASCII data attached as .pgp file
                        contentType: 'application/pgp-encrypted'
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`[MAILER SUCCESS] Secure Email dispatched for order ${orderId}. Message ID: ${info.messageId}`);
        } catch (err) {
            console.error(`[MAILER ERROR] Failed to send email for order ${orderId}. Attempt ${retryCount + 1}.`, err.message);

            // Retry Logic: Maximum 3 attempts
            if (retryCount < 3) {
                console.log(`[MAILER AUTO-RETRY] Retrying in 5 seconds...`);
                setTimeout(() => {
                    this.sendSecureOrderEmail(orderId, encryptedAsciiPayload, retryCount + 1);
                }, 5000 * (retryCount + 1)); // Exponential-ish backoff
            } else {
                console.error(`[MAILER ALERT] Email delivery permanently failed after 3 retries for order ${orderId}.`);
            }
        }
    }
}

const mailService = new MailService();
module.exports = mailService;
