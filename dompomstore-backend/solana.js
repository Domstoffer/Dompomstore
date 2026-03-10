const { Connection, PublicKey } = require('@solana/web3.js');

const MERCHANT_WALLET = new PublicKey("Cx2TAKyUxVZ3xtWZoTpqmnGcnvkUvoghoKafpsK3KuCp");
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Supported SPL Token Mints
const SUPPORTED_TOKENS = {
    USDC: {
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        decimals: 6,
        symbol: "USDC",
        // USDC is pegged 1:1. No API fetch needed.
        getRate: async () => 1.0
    },
    SOL: {
        mint: null, // Native coin – no mint address
        decimals: 9,
        symbol: "SOL",
        getRate: async () => {
            try {
                const fetch = require('node-fetch');
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const data = await res.json();
                return data?.solana?.usd ?? null;
            } catch (e) {
                console.error("Failed to fetch SOL rate", e);
                return null;
            }
        }
    },
    FARTCOIN: {
        mint: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
        decimals: 6,
        symbol: "FARTCOIN",
        // Fetch Fartcoin price from CoinGecko
        getRate: async () => {
            try {
                const fetch = require('node-fetch');
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=fartcoin&vs_currencies=usd');
                const data = await res.json();
                return data?.fartcoin?.usd ?? null;
            } catch (e) {
                console.error("Failed to fetch Fartcoin rate", e);
                return null;
            }
        },
        discount: 0.10 // 10% Meme Discount
    }
    // Add more tokens here as needed:
    // BONK: { mint: "DezXAZ8z7PnrnRJjz3wXboRgixCa6xjnB7YaB1pPB263", decimals: 5, symbol: "BONK", getRate: async () => {...} }
};

/**
 * Get the effective amount after discount (if applicable)
 */
function getEffectiveAmount(usdAmount, tokenSymbol) {
    const token = SUPPORTED_TOKENS[tokenSymbol?.toUpperCase()];
    if (!token) return usdAmount;
    return usdAmount * (1 - (token.discount || 0));
}

/**
 * Convert a USD price to the token amount
 * @param {number} usdAmount - Price in USD (pre-discount)
 * @param {string} tokenSymbol - Token symbol (e.g. 'USDC', 'FARTCOIN')
 * @returns {{ tokenAmount: number, rate: number }} 
 */
async function convertToToken(usdAmount, tokenSymbol = 'USDC') {
    const token = SUPPORTED_TOKENS[tokenSymbol.toUpperCase()];
    if (!token) throw new Error(`Unsupported token: ${tokenSymbol}`);

    const effectiveUsdAmount = getEffectiveAmount(usdAmount, tokenSymbol);

    const rate = await token.getRate();
    if (!rate) throw new Error(`Could not fetch rate for ${tokenSymbol}`);

    // For USDC: 1 USDC = 1 USD → 1:1
    // For FARTCOIN: rate = price per FARTCOIN in USD. Amount = effectiveUsdAmount / rate
    const tokenAmount = effectiveUsdAmount / rate;
    return { tokenAmount: parseFloat(tokenAmount.toFixed(4)), rate };
}

/**
 * Verifies an SPL Token transfer on-chain
 * @param {string} signature - Tx signature
 * @param {number} expectedUsdAmount - Expected amount in USD
 * @param {string} referencePubKey - Unique reference to prevent replay
 * @param {string} tokenSymbol - Which token was used (e.g. 'USDC', 'FARTCOIN')
 */
async function verifyTransaction(signature, expectedUsdAmount, referencePubKey, tokenSymbol = 'USDC') {
    try {
        const token = SUPPORTED_TOKENS[tokenSymbol.toUpperCase()];
        if (!token) {
            console.error(`Unsupported token: ${tokenSymbol}`);
            return { isValid: false, sender: null };
        }

        const tx = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

        if (!tx) {
            console.error("Transaction not found");
            return { isValid: false, sender: null };
        }

        if (tx.meta && tx.meta.err) {
            console.error("Transaction failed on-chain");
            return { isValid: false, sender: null };
        }

        // The first account key is always the fee payer (the sender)
        const accountKeys = tx.transaction.message.accountKeys || tx.transaction.message.staticAccountKeys;
        const senderPubKey = accountKeys[0].toString();
        const staticAccountKeysStrings = accountKeys.map(k => k.toString());

        // Verify reference key to prevent replay attacks
        if (!staticAccountKeysStrings.includes(referencePubKey)) {
            console.error("Reference public key not found in transaction – possible replay attack!");
            return { isValid: false, sender: null };
        }

        let amountReceived = 0;

        if (tokenSymbol.toUpperCase() === 'SOL') {
            // Native SOL transfer – check lamport balance change for merchant wallet
            const merchantIndex = staticAccountKeysStrings.findIndex(k => k === MERCHANT_WALLET.toString());
            if (merchantIndex === -1) {
                console.error("Merchant wallet not found in transaction accounts");
                return { isValid: false, sender: null };
            }
            const preLamports = tx.meta.preBalances[merchantIndex];
            const postLamports = tx.meta.postBalances[merchantIndex];
            amountReceived = (postLamports - preLamports) / 1e9; // lamports → SOL
        } else {
            // SPL Token transfer – check token balance change
            if (tx.meta.postTokenBalances && tx.meta.preTokenBalances) {
                const preBal = tx.meta.preTokenBalances.filter(
                    b => b.mint === token.mint && b.owner === MERCHANT_WALLET.toString()
                );
                const postBal = tx.meta.postTokenBalances.filter(
                    b => b.mint === token.mint && b.owner === MERCHANT_WALLET.toString()
                );

                const pre = preBal.length > 0 ? parseFloat(preBal[0].uiTokenAmount.uiAmount) : 0;
                const post = postBal.length > 0 ? parseFloat(postBal[0].uiTokenAmount.uiAmount) : 0;
                amountReceived = post - pre;
            }
        }

        if (amountReceived <= 0) {
            console.error("No balance change detected for merchant wallet");
            return { isValid: false, sender: null };
        }

        // Convert expected USD to token amount for comparison
        const { tokenAmount: expectedTokenAmount } = await convertToToken(expectedUsdAmount, tokenSymbol);

        // Allow 5% slippage for volatile tokens like Fartcoin
        const slippageBuffer = tokenSymbol.toUpperCase() === 'USDC' ? 0 : 0.05;
        const minimumAccepted = expectedTokenAmount * (1 - slippageBuffer);

        console.log(`[${tokenSymbol}] Expected: ${expectedTokenAmount}, Received: ${amountReceived}, Min: ${minimumAccepted}`);

        if (amountReceived < minimumAccepted) {
            console.error(`Amount received (${amountReceived}) is less than minimum (${minimumAccepted})`);
            return { isValid: false, sender: null };
        }

        return { isValid: true, sender: senderPubKey };
    } catch (e) {
        console.error("Error verifying Solana transaction", e);
        return { isValid: false, sender: null };
    }
}

module.exports = {
    connection,
    verifyTransaction,
    convertToToken,
    getEffectiveAmount,
    MERCHANT_WALLET,
    SUPPORTED_TOKENS
};
