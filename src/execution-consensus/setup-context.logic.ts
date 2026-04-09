import type { CoinSetupAnalysisContext, CoinSetupPathStatus, CoinSetupSide } from './setup.interface';
import type { SetupCandle, SupportResistance, TrendInsight } from './types';
import { getAverageTrueRange, getRelativeStrengthIndex } from './trend';

export function buildCoinSetupAnalysisContext(
  side: CoinSetupSide,
  candles: SetupCandle[],
  trendSummary: TrendInsight,
  supportResistance: SupportResistance
): CoinSetupAnalysisContext {
  const orderedCandles = [...candles].sort((left, right) => left.openTime - right.openTime);
  const lastPrice = orderedCandles[orderedCandles.length - 1].close;
  const atr = getAverageTrueRange(orderedCandles, 14);
  const rsi14 = getRelativeStrengthIndex(orderedCandles, 14);
  const range = Math.max(supportResistance.resistance - supportResistance.support, Number.EPSILON);
  const zoneBuffer = Math.max(range * 0.18, lastPrice * 0.0015);
  const stopBuffer = Math.max(range * 0.12, lastPrice * 0.001);
  const targetBuffer = Math.max(range * 0.28, lastPrice * 0.002);

  const pathStatus: CoinSetupPathStatus = {
    break: side === 'long' ? lastPrice >= supportResistance.resistance : lastPrice <= supportResistance.support,
    retest: true,
    rejection: true,
  };

  return {
    atr,
    atr14: atr,
    breakdownShort: side === 'short' && lastPrice < supportResistance.support,
    breakoutLong: side === 'long' && lastPrice > supportResistance.resistance,
    bullishStructure: trendSummary.structurePattern === 'HH/HL',
    bearishStructure: trendSummary.structurePattern === 'LH/LL',
    candles,
    continuationMode: trendSummary.direction !== 'sideways',
    lastPrice,
    emaScore: 0,
    nearResistance: lastPrice >= supportResistance.resistance - zoneBuffer,
    nearSupport: lastPrice <= supportResistance.support + zoneBuffer,
    orderedCandles,
    pathMode: 'breakout',
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
    zoneBuffer,
  };
}
