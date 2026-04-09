import type { SetupPathStep } from './types';

export function buildZone(low: number, high: number) {
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

export function buildSetupPathStep(label: string, status: SetupPathStep['status']): SetupPathStep {
  return { label, status };
}

export function getGradeFromScore(score: number): 'A+' | 'A' | 'B' | 'C' {
  if (score >= 12) return 'A+';
  if (score >= 9) return 'A';
  if (score >= 6) return 'B';
  return 'C';
}

export function buildTakeProfitSteps(
  direction: 'long' | 'short',
  entryMid: number,
  risk: number,
  supportResistance: { resistance: number; support: number },
  targetBuffer: number
) {
  if (direction === 'long') {
    return [
      { label: 'TP1' as const, price: Math.max(entryMid + risk, supportResistance.resistance + targetBuffer * 0.25) },
      {
        label: 'TP2' as const,
        price: Math.max(entryMid + risk * 2, supportResistance.resistance + targetBuffer * 0.75),
      },
      {
        label: 'TP3' as const,
        price: Math.max(entryMid + risk * 3, supportResistance.resistance + targetBuffer * 1.5),
      },
    ];
  }
  return [
    { label: 'TP1' as const, price: Math.min(entryMid - risk, supportResistance.support - targetBuffer * 0.25) },
    { label: 'TP2' as const, price: Math.min(entryMid - risk * 2, supportResistance.support - targetBuffer * 0.75) },
    { label: 'TP3' as const, price: Math.min(entryMid - risk * 3, supportResistance.support - targetBuffer * 1.5) },
  ];
}
