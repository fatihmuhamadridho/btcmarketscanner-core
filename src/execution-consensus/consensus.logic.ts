import type { SetupCandle, SetupInsight, SupportResistance, TrendInsight } from './types';
import { buildEmptySetupInsight } from './setup-default.logic';
import { buildCoinSetupAnalysisContext } from './setup-context.logic';
import { analyzeLongSetup } from './setup-long.logic';
import { analyzeShortSetup } from './setup-short.logic';

export function analyzeSetupSide(
  side: 'long' | 'short',
  candles: SetupCandle[],
  trendSummary: TrendInsight,
  supportResistance: SupportResistance | null
): SetupInsight {
  if (candles.length < 2 || !supportResistance) {
    return buildEmptySetupInsight(side);
  }

  const context = buildCoinSetupAnalysisContext(side, candles, trendSummary, supportResistance);
  return side === 'long' ? analyzeLongSetup(context) : analyzeShortSetup(context);
}
