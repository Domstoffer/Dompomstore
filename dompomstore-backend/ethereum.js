const { ethers } = require('ethers');

const RPC_ENDPOINT = process.env.ETH_RPC_ENDPOINT || "https://cloudflare-eth.com";
const ethProvider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

const LINEA_RPC = process.env.LINEA_RPC_ENDPOINT || "https://rpc.linea.build";
const lineaProvider = new ethers.JsonRpcProvider(LINEA_RPC);

const BSC_RPC = process.env.BSC_RPC_ENDPOINT || "https://bsc-dataseed.binance.org/";
const bscProvider = new ethers.JsonRpcProvider(BSC_RPC);

// Ethereum Merchant Wallet
const MERCHANT_EVM_WALLET = process.env.MERCHANT_EVM_WALLET || "0x8fc73bf2168af15395037efb692eda6375f54a1e";

// Supported EVM Tokens
const EVM_TOKENS = {
    ETH: {
        address: null, // native
        decimals: 18,
        symbol: 'ETH',
        provider: ethProvider,
        discount: 0,
        getRate: async () => {
            try {
                const fetch = require('node-fetch');
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const data = await res.json();
                return data?.ethereum?.usd ?? null;
            } catch (e) { return null; }
        }
    },
    USDC: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
        symbol: 'USDC',
        provider: ethProvider,
        discount: 0,
        getRate: async () => 1.0 // 1:1 USD
    },
    PEPE: {
        address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        decimals: 18,
        symbol: 'PEPE',
        provider: ethProvider,
        discount: 0.10, // 10% discount
        getRate: async () => {
            try {
                const fetch = require('node-fetch');
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pepe&vs_currencies=usd');
                const data = await res.json();
                return data?.pepe?.usd ?? null;
            } catch (e) { return null; }
        }
    },
    LINEA_USDC: {
        address: "0x176211869cA2b568f2A4D4E1bEbdC6B46224c538",
        decimals: 6,
        symbol: 'LINEA_USDC',
        provider: lineaProvider,
        discount: 0,
        getRate: async () => 1.0 // 1:1 USD
    },
    BNB_USDC: {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC USDC
        decimals: 18,
        symbol: 'BNB_USDC',
        provider: bscProvider,
        discount: 0,
        getRate: async () => 1.0
    },
    BNB: {
        address: null, // native BNB on BSC
        decimals: 18,
        symbol: 'BNB',
        provider: bscProvider,
        discount: 0,
        getRate: async () => {
            try {
                const fetch = require('node-fetch');
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
                const data = await res.json();
                return data?.binancecoin?.usd ?? null;
            } catch (e) { return null; }
        }
    }
};

// Tokens that offer a discount
const DISCOUNT_TOKENS = Object.keys(EVM_TOKENS).filter(symbol => EVM_TOKENS[symbol].discount > 0);

// Helper to calculate effective amount after discount
function getEffectiveAmount(amount, tokenSymbol) {
    const token = EVM_TOKENS[tokenSymbol];
    if (!token) {
        throw new Error(`Token ${tokenSymbol} not supported`);
    }
    return amount * (1 - token.discount);
}

async function verifyEVMPayment(txHash, expectedAmountUSD, expectedSender, tokenSymbol) {
    const token = EVM_TOKENS[tokenSymbol];
    if (!token) {
        console.error(`Token ${tokenSymbol} not supported`);
        return false;
    }

    const { provider, symbol, address, decimals } = token;
    const iface = new ethers.Interface(["function transfer(address to, uint256 amount)"]);

    try {
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            console.error("Transaction not found");
            return false;
        }

        if (tx.from.toLowerCase() !== expectedSender.toLowerCase()) {
            console.error("Invalid sender");
            return false;
        }

        if (!tx.blockNumber) {
            console.error("Transaction not yet confirmed");
            return false;
        }

        const effectiveUSD = getEffectiveAmount(expectedAmountUSD, tokenSymbol);

        if (symbol === 'ETH' || symbol === 'BNB') {
            // Native token transfer
            if (tx.to?.toLowerCase() !== MERCHANT_EVM_WALLET.toLowerCase()) {
                console.error("Transaction not sent to merchant wallet");
                return false;
            }

            const rate = await token.getRate();
            if (!rate) { console.error(`Could not fetch ${symbol} rate`); return false; }

            const requiredEth = effectiveUSD / rate;
            const sentEth = parseFloat(ethers.formatUnits(tx.value, decimals));

            console.log(`Expected ${symbol}: ${requiredEth}, Received: ${sentEth}`);
            // Allow 2% slippage tolerance
            if (sentEth >= requiredEth * 0.98) {
                return { valid: true, amount: sentEth };
            } else {
                return { valid: false, error: `Insufficient amount. Expected: ${requiredEth}, Received: ${sentEth}` };
            }
        } else {
            // ERC-20 token transfer
            if (tx.to?.toLowerCase() !== token.address.toLowerCase()) {
                console.error(`Transaction not sent to ${symbol} contract`);
                return false;
            }

            const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
            if (!decoded || decoded.name !== 'transfer') {
                console.error("Not a transfer call");
                return false;
            }

            const recipient = decoded.args[0];
            const amountBN = decoded.args[1];

            if (recipient.toLowerCase() !== MERCHANT_EVM_WALLET.toLowerCase()) {
                console.error("Invalid recipient");
                return false;
            }

            const rate = await token.getRate();
            if (!rate) { console.error(`Could not fetch ${symbol} rate`); return false; }

            const expectedTokenAmount = effectiveUSD / rate;
            const expectedWei = ethers.parseUnits(expectedTokenAmount.toFixed(token.decimals > 6 ? 6 : token.decimals), token.decimals);

            // Allow 5% slippage for volatile tokens, 0 for USDC
            const slippage = symbol === 'USDC' ? 1.0 : 0.95;
            if (amountBN < (expectedWei * BigInt(Math.floor(slippage * 100))) / 100n) {
                console.error(`${symbol} amount too low`);
                return false;
            }
        }

        return true;

    } catch (e) {
        console.error(`Error verifying EVM transaction (${symbol})`, e);
        return false;
    }
}

// Legacy export for backward compatibility
async function verifyERC20Transfer(txHash, expectedAmount, expectedSender) {
    return verifyEVMPayment(txHash, expectedAmount, expectedSender, 'USDC');
}

module.exports = {
    ethProvider,
    lineaProvider,
    bscProvider,
    verifyEVMPayment,
    verifyERC20Transfer,
    MERCHANT_EVM_WALLET,
    EVM_TOKENS,
    DISCOUNT_TOKENS,
    getEffectiveAmount
};
