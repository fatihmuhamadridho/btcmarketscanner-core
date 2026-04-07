// src/index.ts
function helloCore() {
  return "btcmarketscanner-core is working \u{1F680}. Test";
}
function formatText(symbol) {
  return `[core] scanning ${symbol}`;
}
export {
  formatText,
  helloCore
};
