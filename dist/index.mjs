// src/execution-consensus/shared.logic.ts
function buildZone(low, high) {
  return { low: Math.min(low, high), high: Math.max(low, high) };
}
function buildSetupPathStep(label, status) {
  return { label, status };
}
function getGradeFromScore(score) {
  if (score >= 12) return "A+";
  if (score >= 9) return "A";
  if (score >= 6) return "B";
  return "C";
}
function buildTakeProfitSteps(direction, entryMid, risk, supportResistance, targetBuffer) {
  if (direction === "long") {
    return [
      { label: "TP1", price: Math.max(entryMid + risk, supportResistance.resistance + targetBuffer * 0.25) },
      {
        label: "TP2",
        price: Math.max(entryMid + risk * 2, supportResistance.resistance + targetBuffer * 0.75)
      },
      {
        label: "TP3",
        price: Math.max(entryMid + risk * 3, supportResistance.resistance + targetBuffer * 1.5)
      }
    ];
  }
  return [
    { label: "TP1", price: Math.min(entryMid - risk, supportResistance.support - targetBuffer * 0.25) },
    { label: "TP2", price: Math.min(entryMid - risk * 2, supportResistance.support - targetBuffer * 0.75) },
    { label: "TP3", price: Math.min(entryMid - risk * 3, supportResistance.support - targetBuffer * 1.5) }
  ];
}

// src/execution-consensus/setup-shared.logic.ts
function buildZone2(low, high) {
  return { low: Math.min(low, high), high: Math.max(low, high) };
}
function buildSetupPathStep2(label, status) {
  return { label, status };
}
function getGradeFromScore2(score) {
  if (score >= 12) return "A+";
  if (score >= 9) return "A";
  if (score >= 6) return "B";
  return "C";
}
function buildTakeProfitSteps2(direction, entryMid, risk, supportResistance, targetBuffer) {
  if (direction === "long") {
    return [
      { label: "TP1", price: Math.max(entryMid + risk, supportResistance.resistance + targetBuffer * 0.25) },
      { label: "TP2", price: Math.max(entryMid + risk * 2, supportResistance.resistance + targetBuffer * 0.75) },
      { label: "TP3", price: Math.max(entryMid + risk * 3, supportResistance.resistance + targetBuffer * 1.5) }
    ];
  }
  return [
    { label: "TP1", price: Math.min(entryMid - risk, supportResistance.support - targetBuffer * 0.25) },
    { label: "TP2", price: Math.min(entryMid - risk * 2, supportResistance.support - targetBuffer * 0.75) },
    { label: "TP3", price: Math.min(entryMid - risk * 3, supportResistance.support - targetBuffer * 1.5) }
  ];
}

// src/execution-consensus/setup-default.logic.ts
function buildEmptySetupInsight(side) {
  return {
    direction: side,
    entryMid: null,
    entryZone: { high: null, low: null },
    atr14: null,
    grade: "C",
    gradeRank: 0,
    label: `${side === "long" ? "Long" : "Short"} setup`,
    marketCondition: "Need more market data",
    pathMode: "breakout",
    path: [buildSetupPathStep2("Break", "pending"), buildSetupPathStep2("Retest", "pending"), buildSetupPathStep2("Rejection", "pending")],
    takeProfits: [
      { label: "TP1", price: null },
      { label: "TP2", price: null },
      { label: "TP3", price: null }
    ],
    reasons: ["Need support / resistance data and loaded candles"],
    riskReward: null,
    stopLoss: null,
    takeProfit: null,
    rsi14: null
  };
}

// src/execution-consensus/trend.logic.ts
function getAverageTrueRange(candles, period = 14) {
  if (candles.length < 2) return null;
  const startIndex = Math.max(1, candles.length - period);
  const trueRanges = [];
  for (let index = startIndex; index < candles.length; index += 1) {
    const current = candles[index];
    const previous = candles[index - 1];
    trueRanges.push(Math.max(current.high - current.low, Math.abs(current.high - previous.close), Math.abs(current.low - previous.close)));
  }
  return trueRanges.length ? trueRanges.reduce((sum, value) => sum + value, 0) / trueRanges.length : null;
}
function getExponentialMovingAverage(values, period, endIndex) {
  if (endIndex < 0 || values.length === 0 || period <= 0) return null;
  const cappedEndIndex = Math.min(endIndex, values.length - 1);
  if (cappedEndIndex + 1 < period) return null;
  const seedWindow = values.slice(0, period);
  if (seedWindow.length < period) return null;
  let ema = seedWindow.reduce((sum, value) => sum + value, 0) / period;
  const multiplier = 2 / (period + 1);
  for (let index = period; index <= cappedEndIndex; index += 1) {
    ema = (values[index] - ema) * multiplier + ema;
  }
  return ema;
}
function getRelativeStrengthIndex(candles, period = 14) {
  if (candles.length < period + 1) return null;
  const closes = candles.map((candle) => candle.close);
  let gainSum = 0;
  let lossSum = 0;
  for (let index = closes.length - period; index < closes.length; index += 1) {
    const change = closes[index] - closes[index - 1];
    if (change > 0) gainSum += change;
    else lossSum += Math.abs(change);
  }
  const averageGain = gainSum / period;
  const averageLoss = lossSum / period;
  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}
function getSupportResistance(candles, windowSize) {
  if (candles.length === 0) return null;
  const windowCandles = candles.slice(-windowSize);
  const lows = windowCandles.map((candle) => candle.low);
  const highs = windowCandles.map((candle) => candle.high);
  const averageSupport = lows.reduce((sum, value) => sum + value, 0) / lows.length;
  const averageResistance = highs.reduce((sum, value) => sum + value, 0) / highs.length;
  return {
    averageResistance,
    averageSupport,
    resistance: Math.max(...highs),
    support: Math.min(...lows)
  };
}
function getSimpleMovingAverage(values, period, endIndex) {
  if (endIndex < 0 || values.length === 0) return null;
  const cappedEndIndex = Math.min(endIndex, values.length - 1);
  const startIndex = Math.max(0, cappedEndIndex - period + 1);
  const window = values.slice(startIndex, cappedEndIndex + 1);
  return window.length ? window.reduce((sum, value) => sum + value, 0) / window.length : null;
}
function getPivotCandles(candles, lookback = 3) {
  const pivotsHigh = [];
  const pivotsLow = [];
  for (let index = lookback; index < candles.length - lookback; index += 1) {
    const candle = candles[index];
    const left = candles.slice(index - lookback, index);
    const right = candles.slice(index + 1, index + lookback + 1);
    const isPivotHigh = left.every((item) => item.high < candle.high) && right.every((item) => item.high <= candle.high);
    const isPivotLow = left.every((item) => item.low > candle.low) && right.every((item) => item.low >= candle.low);
    if (isPivotHigh) pivotsHigh.push(candle);
    if (isPivotLow) pivotsLow.push(candle);
  }
  return { pivotsHigh, pivotsLow };
}
function analyzeTrend(candles, supportResistance) {
  if (candles.length < 2) {
    return {
      changePercent: 0,
      color: "gray",
      direction: "sideways",
      endPrice: null,
      atr14: null,
      ema20: null,
      ema50: null,
      ema100: null,
      ema200: null,
      label: "Sideways",
      ma20: null,
      ma50: null,
      ma200: null,
      rsi14: null,
      reasons: ["Not enough candles to determine trend"],
      rangePercent: 0,
      score: 0,
      startPrice: null,
      structurePattern: "Mixed",
      structure: "Insufficient data",
      volumeRatio: null
    };
  }
  const closes = candles.map((candle) => candle.close);
  const volumes = candles.map((candle) => candle.volume);
  const firstPrice = closes[0];
  const lastPrice = closes[closes.length - 1];
  const changePercent = (lastPrice - firstPrice) / firstPrice * 100;
  const direction = changePercent > 0.75 ? "bullish" : changePercent < -0.75 ? "bearish" : "sideways";
  const atr14 = getAverageTrueRange(candles, 14);
  const rsi14 = getRelativeStrengthIndex(candles, 14);
  const ema20 = getExponentialMovingAverage(closes, 20, closes.length - 1);
  const ema50 = getExponentialMovingAverage(closes, 50, closes.length - 1);
  const ema100 = getExponentialMovingAverage(closes, 100, closes.length - 1);
  const ema200 = getExponentialMovingAverage(closes, 200, closes.length - 1);
  const ma20 = getSimpleMovingAverage(closes, 20, closes.length - 1);
  const ma50 = getSimpleMovingAverage(closes, 50, closes.length - 1);
  const ma200 = getSimpleMovingAverage(closes, 200, closes.length - 1);
  const previousCloses = closes.slice(-21, -1);
  const previousVolumes = volumes.slice(-21, -1);
  const averageVolume = previousVolumes.length ? previousVolumes.reduce((sum, value) => sum + value, 0) / previousVolumes.length : null;
  const currentVolume = volumes.at(-1) ?? null;
  const volumeRatio = averageVolume && currentVolume ? currentVolume / averageVolume : null;
  const { pivotsHigh, pivotsLow } = getPivotCandles(candles);
  const recentHighs = pivotsHigh.slice(-2);
  const recentLows = pivotsLow.slice(-2);
  const reasons = [];
  let score = 0;
  let structure = "Mixed structure";
  let structurePattern = "Mixed";
  if (direction === "bullish") score += 2;
  if (direction === "bearish") score -= 2;
  if (ema20 !== null && lastPrice > ema20) {
    score += 1;
    reasons.push("Price is above EMA20");
  } else if (ema20 !== null) {
    score -= 1;
    reasons.push("Price is below EMA20");
  }
  if (ema50 !== null && lastPrice > ema50) score += 1;
  if (ema200 !== null && lastPrice > ema200) score += 1;
  if (ema20 !== null && ema50 !== null && ema100 !== null && ema200 !== null) {
    const bullishStack = ema20 > ema50 && ema50 > ema100 && ema100 > ema200;
    const bearishStack = ema20 < ema50 && ema50 < ema100 && ema100 < ema200;
    if (bullishStack) {
      score += 2;
      reasons.push("EMA stack is bullish");
    } else if (bearishStack) {
      score -= 2;
      reasons.push("EMA stack is bearish");
    }
  }
  if (rsi14 !== null) {
    if (rsi14 >= 70) {
      score -= 1;
      reasons.push(`RSI14 is overbought at ${rsi14.toFixed(2)}`);
    } else if (rsi14 <= 30) {
      score += 1;
      reasons.push(`RSI14 is oversold at ${rsi14.toFixed(2)}`);
    } else if (rsi14 >= 55) {
      score += 1;
      reasons.push(`RSI14 momentum is bullish at ${rsi14.toFixed(2)}`);
    } else if (rsi14 <= 45) {
      score -= 1;
      reasons.push(`RSI14 momentum is bearish at ${rsi14.toFixed(2)}`);
    }
  }
  if (recentHighs.length === 2 && recentLows.length === 2) {
    const [prevHigh, lastHigh] = recentHighs;
    const [prevLow, lastLow] = recentLows;
    if (lastHigh.high > prevHigh.high && lastLow.low > prevLow.low) {
      score += 2;
      structure = "Higher highs and higher lows";
      structurePattern = "HH/HL";
      reasons.push("HH/HL structure is intact");
    } else if (lastHigh.high < prevHigh.high && lastLow.low < prevLow.low) {
      score -= 2;
      structure = "Lower highs and lower lows";
      structurePattern = "LH/LL";
      reasons.push("LH/LL structure is intact");
    } else if (lastHigh.high > prevHigh.high) {
      score += 1;
      structure = "Higher high, mixed low";
    } else if (lastLow.low < prevLow.low) {
      score -= 1;
      structure = "Lower low, mixed high";
    }
  }
  if (volumeRatio !== null) {
    if (volumeRatio > 1.12 && changePercent > 0) score += 1;
    else if (volumeRatio < 0.88 && changePercent < 0) score -= 1;
  }
  if (supportResistance) {
    const supportGapPercent = supportResistance.support !== 0 ? (lastPrice - supportResistance.support) / supportResistance.support * 100 : null;
    const resistanceGapPercent = supportResistance.resistance !== 0 ? (supportResistance.resistance - lastPrice) / supportResistance.resistance * 100 : null;
    if (lastPrice > supportResistance.resistance * 1.01) score += 2;
    else if (lastPrice < supportResistance.support * 0.99) score -= 2;
    else if (supportGapPercent !== null && supportGapPercent >= 0 && supportGapPercent <= 1.5) score += 1;
    else if (resistanceGapPercent !== null && resistanceGapPercent >= 0 && resistanceGapPercent <= 1.5) score -= 1;
  }
  return {
    changePercent,
    color: direction === "bullish" ? "teal" : direction === "bearish" ? "red" : "gray",
    direction,
    endPrice: lastPrice,
    atr14,
    ema20,
    ema50,
    ema100,
    ema200,
    label: direction === "bullish" ? "Bullish" : direction === "bearish" ? "Bearish" : "Sideways",
    ma20,
    ma50,
    ma200,
    rsi14,
    reasons,
    rangePercent: firstPrice !== 0 ? (lastPrice - firstPrice) / firstPrice * 100 : 0,
    score,
    startPrice: firstPrice,
    structurePattern,
    structure,
    volumeRatio
  };
}

// src/execution-consensus/setup-context.logic.ts
function buildCoinSetupAnalysisContext(side, candles, trendSummary, supportResistance) {
  const orderedCandles = [...candles].sort((left, right) => left.openTime - right.openTime);
  const lastPrice = orderedCandles[orderedCandles.length - 1].close;
  const atr = getAverageTrueRange(orderedCandles, 14);
  const rsi14 = getRelativeStrengthIndex(orderedCandles, 14);
  const range = Math.max(supportResistance.resistance - supportResistance.support, Number.EPSILON);
  const zoneBuffer = Math.max(range * 0.18, lastPrice * 15e-4);
  const stopBuffer = Math.max(range * 0.12, lastPrice * 1e-3);
  const targetBuffer = Math.max(range * 0.28, lastPrice * 2e-3);
  const pathStatus = {
    break: side === "long" ? lastPrice >= supportResistance.resistance : lastPrice <= supportResistance.support,
    retest: true,
    rejection: true
  };
  return {
    atr,
    atr14: atr,
    breakdownShort: side === "short" && lastPrice < supportResistance.support,
    breakoutLong: side === "long" && lastPrice > supportResistance.resistance,
    bullishStructure: trendSummary.structurePattern === "HH/HL",
    bearishStructure: trendSummary.structurePattern === "LH/LL",
    candles,
    continuationMode: trendSummary.direction !== "sideways",
    lastPrice,
    emaScore: 0,
    nearResistance: lastPrice >= supportResistance.resistance - zoneBuffer,
    nearSupport: lastPrice <= supportResistance.support + zoneBuffer,
    orderedCandles,
    pathMode: "breakout",
    pathStatus,
    range,
    rsi14,
    side,
    scoreBase: trendSummary.score,
    structureScore: 0,
    stopBuffer,
    supportResistance,
    targetBuffer,
    trendBiasScore: 0,
    trendSummary,
    volumeScore: 0,
    zoneBuffer
  };
}

// src/execution-consensus/setup-long.logic.ts
function analyzeLongSetup(context) {
  const entryMid = context.supportResistance.support + context.zoneBuffer * 0.4;
  const stopLoss = entryMid - context.stopBuffer;
  const risk = entryMid - stopLoss;
  const takeProfit = entryMid + risk * 2;
  const grade = getGradeFromScore2(context.scoreBase);
  return {
    direction: "long",
    entryMid,
    entryZone: buildZone2(context.supportResistance.support + context.zoneBuffer * 0.2, context.supportResistance.support + context.zoneBuffer * 0.8),
    atr14: context.atr14,
    grade,
    gradeRank: context.scoreBase,
    label: `${grade} Long Setup`,
    marketCondition: "Range-bound setup",
    pathMode: context.pathMode,
    path: [{ label: "Break", status: "pending" }, { label: "Retest", status: "pending" }, { label: "Rejection", status: "pending" }],
    takeProfits: buildTakeProfitSteps2("long", entryMid, risk, context.supportResistance, context.targetBuffer),
    reasons: ["Trend bias is bullish"],
    riskReward: risk > 0 ? (takeProfit - entryMid) / risk : null,
    stopLoss,
    takeProfit,
    rsi14: context.rsi14
  };
}

// src/execution-consensus/setup-short.logic.ts
function analyzeShortSetup(context) {
  const entryMid = context.supportResistance.resistance - context.zoneBuffer * 0.4;
  const stopLoss = entryMid + context.stopBuffer;
  const risk = stopLoss - entryMid;
  const takeProfit = entryMid - risk * 2;
  const grade = getGradeFromScore2(context.scoreBase);
  return {
    direction: "short",
    entryMid,
    entryZone: buildZone2(context.supportResistance.support - context.zoneBuffer * 0.8, context.supportResistance.support - context.zoneBuffer * 0.2),
    atr14: context.atr14,
    grade,
    gradeRank: context.scoreBase,
    label: `${grade} Short Setup`,
    marketCondition: "Range-bound setup",
    pathMode: context.pathMode,
    path: [{ label: "Break", status: "pending" }, { label: "Retest", status: "pending" }, { label: "Rejection", status: "pending" }],
    takeProfits: buildTakeProfitSteps2("short", entryMid, risk, context.supportResistance, context.targetBuffer),
    reasons: ["Trend bias is bearish"],
    riskReward: risk > 0 ? (entryMid - takeProfit) / risk : null,
    stopLoss,
    takeProfit,
    rsi14: context.rsi14
  };
}

// src/execution-consensus/consensus.logic.ts
function analyzeSetupSide(side, candles, trendSummary, supportResistance) {
  if (candles.length < 2 || !supportResistance) {
    return buildEmptySetupInsight(side);
  }
  const context = buildCoinSetupAnalysisContext(side, candles, trendSummary, supportResistance);
  return side === "long" ? analyzeLongSetup(context) : analyzeShortSetup(context);
}

// src/binance/base-url.ts
var DEFAULT_DEMO_FUTURES_BASE_URL = "https://demo-fapi.binance.com/fapi/v1";
var DEFAULT_LIVE_FUTURES_BASE_URL = "https://fapi.binance.com/fapi/v1";
function normalizeBaseUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.includes("demo-api.binance.com/api/v3")) {
    return DEFAULT_DEMO_FUTURES_BASE_URL;
  }
  if (trimmed.includes("api.binance.com/api/v3")) {
    return DEFAULT_LIVE_FUTURES_BASE_URL;
  }
  if (trimmed.includes("demo-fapi.binance.com")) {
    return trimmed.includes("/fapi/v1") ? trimmed : `${trimmed}/fapi/v1`;
  }
  if (trimmed.includes("fapi.binance.com")) {
    return trimmed.includes("/fapi/v1") ? trimmed : `${trimmed}/fapi/v1`;
  }
  return trimmed;
}
function getBinanceFuturesBaseUrl(baseUrl) {
  if (!baseUrl || baseUrl.trim().length === 0) {
    return DEFAULT_DEMO_FUTURES_BASE_URL;
  }
  return normalizeBaseUrl(baseUrl);
}
function getBinanceFuturesApiLabel(baseUrl) {
  const resolvedBaseUrl = getBinanceFuturesBaseUrl(baseUrl);
  if (resolvedBaseUrl.includes("demo-fapi.binance.com")) {
    return "Binance demo futures API";
  }
  if (resolvedBaseUrl.includes("fapi.binance.com")) {
    return "Binance live futures API";
  }
  return "Configured Binance futures API";
}

// src/index.ts
function helloCore() {
  return "btcmarketscanner-core is working \u{1F680}. Test";
}
function formatText(symbol) {
  return `[core] scanning ${symbol}`;
}
export {
  analyzeSetupSide,
  analyzeTrend,
  buildSetupPathStep,
  buildTakeProfitSteps,
  buildZone,
  formatText,
  getAverageTrueRange,
  getBinanceFuturesApiLabel,
  getBinanceFuturesBaseUrl,
  getExponentialMovingAverage,
  getGradeFromScore,
  getRelativeStrengthIndex,
  getSupportResistance,
  helloCore
};
