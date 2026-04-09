export * from './execution-consensus';
export * from './binance/base-url';

export function helloCore() {
  return 'btcmarketscanner-core is working 🚀. Test';
}

export function formatText(symbol: string) {
  return `[core] scanning ${symbol}`;
}
