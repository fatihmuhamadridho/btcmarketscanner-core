import type { CoinSetupAnalysisContext } from './setup.interface';
import type { SetupInsight } from './types';
import { buildTakeProfitSteps, buildZone, getGradeFromScore } from './setup-shared.logic';

export function analyzeLongSetup(context: CoinSetupAnalysisContext): SetupInsight {
  const entryMid = context.supportResistance.support + context.zoneBuffer * 0.4;
  const stopLoss = entryMid - context.stopBuffer;
  const risk = entryMid - stopLoss;
  const takeProfit = entryMid + risk * 2;
  const grade = getGradeFromScore(context.scoreBase);

  return {
    direction: 'long',
    entryMid,
    entryZone: buildZone(context.supportResistance.support + context.zoneBuffer * 0.2, context.supportResistance.support + context.zoneBuffer * 0.8),
    atr14: context.atr14,
    grade,
    gradeRank: context.scoreBase,
    label: `${grade} Long Setup`,
    marketCondition: 'Range-bound setup',
    pathMode: context.pathMode,
    path: [{ label: 'Break', status: 'pending' }, { label: 'Retest', status: 'pending' }, { label: 'Rejection', status: 'pending' }],
    takeProfits: buildTakeProfitSteps('long', entryMid, risk, context.supportResistance, context.targetBuffer),
    reasons: ['Trend bias is bullish'],
    riskReward: risk > 0 ? (takeProfit - entryMid) / risk : null,
    stopLoss,
    takeProfit,
    rsi14: context.rsi14,
  };
}
