const solana = require('./solana');
const ethereum = require('./ethereum');

console.log('--- SOLANA TESTS ---');
console.log('FARTCOIN 100$', '-> effective:', solana.getEffectiveAmount(100, 'FARTCOIN'));
console.log('USDC 100$', '-> effective:', solana.getEffectiveAmount(100, 'USDC'));
console.log('SOL 100$', '-> effective:', solana.getEffectiveAmount(100, 'SOL'));

console.log('\n--- ETHEREUM TESTS ---');
console.log('PEPE 100$', '-> effective:', ethereum.getEffectiveAmount(100, 'PEPE'));
console.log('USDC 100$', '-> effective:', ethereum.getEffectiveAmount(100, 'USDC'));
console.log('ETH 100$', '-> effective:', ethereum.getEffectiveAmount(100, 'ETH'));
