import type { CoinSetupAnalysisContext } from './setup.interface';
import type { SetupInsight } from './types';
import { buildTakeProfitSteps, buildZone, getGradeFromScore } from './setup-shared.logic';

export function analyzeShortSetup(context: CoinSetupAnalysisContext): SetupInsight {
  const entryMid = context.supportResistance.resistance - context.zoneBuffer * 0.4;
  const stopLoss = entryMid + context.stopBuffer;
  const risk = stopLoss - entryMid;
  const takeProfit = entryMid - risk * 2;
  const grade = getGradeFromScore(context.scoreBase);

  return {
    direction: 'short',
    entryMid,
    entryZone: buildZone(context.supportResistance.support - context.zoneBuffer * 0.8, context.supportResistance.support - context.zoneBuffer * 0.2),
    atr14: context.atr14,
    grade,
    gradeRank: context.scoreBase,
    label: `${grade} Short Setup`,
    marketCondition: 'Range-bound setup',
    pathMode: context.pathMode,
    path: [{ label: 'Break', status: 'pending' }, { label: 'Retest', status: 'pending' }, { label: 'Rejection', status: 'pending' }],
    takeProfits: buildTakeProfitSteps('short', entryMid, risk, context.supportResistance, context.targetBuffer),
    reasons: ['Trend bias is bearish'],
    riskReward: risk > 0 ? (entryMid - takeProfit) / risk : null,
    stopLoss,
    takeProfit,
    rsi14: context.rsi14,
  };
}
