import type { SupportResistance, TrendCandle, TrendInsight } from './types';

export function getAverageTrueRange(candles: Array<{ close: number; high: number; low: number }>, period = 14) {
  if (candles.length < 2) return null;
  const startIndex = Math.max(1, candles.length - period);
  const trueRanges: number[] = [];

  for (let index = startIndex; index < candles.length; index += 1) {
    const current = candles[index];
    const previous = candles[index - 1];
    trueRanges.push(Math.max(current.high - current.low, Math.abs(current.high - previous.close), Math.abs(current.low - previous.close)));
  }

  return trueRanges.length ? trueRanges.reduce((sum, value) => sum + value, 0) / trueRanges.length : null;
}

export function getExponentialMovingAverage(values: number[], period: number, endIndex: number) {
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

export function getRelativeStrengthIndex(candles: Array<{ close: number }>, period = 14) {
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

export function getSupportResistance(candles: TrendCandle[], windowSize: number): SupportResistance | null {
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
    support: Math.min(...lows),
  };
}

function getSimpleMovingAverage(values: number[], period: number, endIndex: number) {
  if (endIndex < 0 || values.length === 0) return null;
  const cappedEndIndex = Math.min(endIndex, values.length - 1);
  const startIndex = Math.max(0, cappedEndIndex - period + 1);
  const window = values.slice(startIndex, cappedEndIndex + 1);
  return window.length ? window.reduce((sum, value) => sum + value, 0) / window.length : null;
}

function getPivotCandles(candles: Array<{ close: number; openTime: number; high: number; low: number }>, lookback = 3) {
  const pivotsHigh: typeof candles = [];
  const pivotsLow: typeof candles = [];

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

export function analyzeTrend(candles: TrendCandle[], supportResistance: SupportResistance | null): TrendInsight {
  if (candles.length < 2) {
    return {
      changePercent: 0,
      color: 'gray',
      direction: 'sideways',
      endPrice: null,
      atr14: null,
      ema20: null,
      ema50: null,
      ema100: null,
      ema200: null,
      label: 'Sideways',
      ma20: null,
      ma50: null,
      ma200: null,
      rsi14: null,
      reasons: ['Not enough candles to determine trend'],
      rangePercent: 0,
      score: 0,
      startPrice: null,
      structurePattern: 'Mixed',
      structure: 'Insufficient data',
      volumeRatio: null,
    };
  }

  const closes = candles.map((candle) => candle.close);
  const volumes = candles.map((candle) => candle.volume);
  const firstPrice = closes[0];
  const lastPrice = closes[closes.length - 1];
  const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
  const direction = changePercent > 0.75 ? 'bullish' : changePercent < -0.75 ? 'bearish' : 'sideways';
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
  const reasons: string[] = [];
  let score = 0;
  let structure = 'Mixed structure';
  let structurePattern: TrendInsight['structurePattern'] = 'Mixed';

  if (direction === 'bullish') score += 2;
  if (direction === 'bearish') score -= 2;

  if (ema20 !== null && lastPrice > ema20) {
    score += 1;
    reasons.push('Price is above EMA20');
  } else if (ema20 !== null) {
    score -= 1;
    reasons.push('Price is below EMA20');
  }

  if (ema50 !== null && lastPrice > ema50) score += 1;
  if (ema200 !== null && lastPrice > ema200) score += 1;

  if (ema20 !== null && ema50 !== null && ema100 !== null && ema200 !== null) {
    const bullishStack = ema20 > ema50 && ema50 > ema100 && ema100 > ema200;
    const bearishStack = ema20 < ema50 && ema50 < ema100 && ema100 < ema200;
    if (bullishStack) {
      score += 2;
      reasons.push('EMA stack is bullish');
    } else if (bearishStack) {
      score -= 2;
      reasons.push('EMA stack is bearish');
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
      structure = 'Higher highs and higher lows';
      structurePattern = 'HH/HL';
      reasons.push('HH/HL structure is intact');
    } else if (lastHigh.high < prevHigh.high && lastLow.low < prevLow.low) {
      score -= 2;
      structure = 'Lower highs and lower lows';
      structurePattern = 'LH/LL';
      reasons.push('LH/LL structure is intact');
    } else if (lastHigh.high > prevHigh.high) {
      score += 1;
      structure = 'Higher high, mixed low';
    } else if (lastLow.low < prevLow.low) {
      score -= 1;
      structure = 'Lower low, mixed high';
    }
  }

  if (volumeRatio !== null) {
    if (volumeRatio > 1.12 && changePercent > 0) score += 1;
    else if (volumeRatio < 0.88 && changePercent < 0) score -= 1;
  }

  if (supportResistance) {
    const supportGapPercent = supportResistance.support !== 0 ? ((lastPrice - supportResistance.support) / supportResistance.support) * 100 : null;
    const resistanceGapPercent =
      supportResistance.resistance !== 0 ? ((supportResistance.resistance - lastPrice) / supportResistance.resistance) * 100 : null;
    if (lastPrice > supportResistance.resistance * 1.01) score += 2;
    else if (lastPrice < supportResistance.support * 0.99) score -= 2;
    else if (supportGapPercent !== null && supportGapPercent >= 0 && supportGapPercent <= 1.5) score += 1;
    else if (resistanceGapPercent !== null && resistanceGapPercent >= 0 && resistanceGapPercent <= 1.5) score -= 1;
  }

  return {
    changePercent,
    color: direction === 'bullish' ? 'teal' : direction === 'bearish' ? 'red' : 'gray',
    direction,
    endPrice: lastPrice,
    atr14,
    ema20,
    ema50,
    ema100,
    ema200,
    label: direction === 'bullish' ? 'Bullish' : direction === 'bearish' ? 'Bearish' : 'Sideways',
    ma20,
    ma50,
    ma200,
    rsi14,
    reasons,
    rangePercent: firstPrice !== 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0,
    score,
    startPrice: firstPrice,
    structurePattern,
    structure,
    volumeRatio,
  };
}
