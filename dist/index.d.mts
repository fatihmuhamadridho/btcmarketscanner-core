type TrendDirection = 'bullish' | 'bearish' | 'sideways';
type SupportResistance = {
    averageResistance: number;
    averageSupport: number;
    resistance: number;
    support: number;
};
type TrendCandle = {
    close: number;
    high: number;
    low: number;
    openTime: number;
    volume: number;
};
type TrendInsight = {
    changePercent: number;
    color: 'teal' | 'red' | 'gray';
    direction: TrendDirection;
    endPrice: number | null;
    atr14: number | null;
    ema100: number | null;
    ema20: number | null;
    ema200: number | null;
    ema50: number | null;
    label: string;
    ma20: number | null;
    ma50: number | null;
    ma200: number | null;
    rsi14: number | null;
    reasons: string[];
    rangePercent: number;
    score: number;
    startPrice: number | null;
    structurePattern: 'HH/HL' | 'LH/LL' | 'Mixed';
    structure: string;
    volumeRatio: number | null;
};
type SetupPathStep = {
    label: string;
    status: 'done' | 'current' | 'pending';
};
type SetupCandle = TrendCandle;
type SetupInsight = {
    direction: 'long' | 'short';
    entryMid: number | null;
    entryZone: {
        high: number | null;
        low: number | null;
    };
    grade: 'A+' | 'A' | 'B' | 'C';
    gradeRank: number;
    label: string;
    marketCondition: string;
    pathMode: 'breakout' | 'continuation';
    path: SetupPathStep[];
    atr14: number | null;
    rsi14: number | null;
    takeProfits: Array<{
        label: 'TP1' | 'TP2' | 'TP3';
        price: number | null;
    }>;
    reasons: string[];
    riskReward: number | null;
    stopLoss: number | null;
    takeProfit: number | null;
};

type CoinSetupSide = 'long' | 'short';
type CoinSetupPathStatus = {
    break: boolean;
    rejection: boolean;
    retest: boolean;
};
type CoinSetupAnalysisContext = {
    atr: number | null;
    atr14: number | null;
    breakdownShort: boolean;
    breakoutLong: boolean;
    bullishStructure: boolean;
    bearishStructure: boolean;
    candles: SetupCandle[];
    continuationMode: boolean;
    lastPrice: number;
    emaScore: number;
    nearResistance: boolean;
    nearSupport: boolean;
    orderedCandles: SetupCandle[];
    pathMode: SetupInsight['pathMode'];
    pathStatus: CoinSetupPathStatus;
    range: number;
    rsi14: number | null;
    side: CoinSetupSide;
    scoreBase: number;
    structureScore: number;
    stopBuffer: number;
    supportResistance: SupportResistance;
    targetBuffer: number;
    trendBiasScore: number;
    trendSummary: TrendInsight;
    volumeScore: number;
    zoneBuffer: number;
};

declare function buildZone(low: number, high: number): {
    low: number;
    high: number;
};
declare function buildSetupPathStep(label: string, status: SetupPathStep['status']): SetupPathStep;
declare function getGradeFromScore(score: number): 'A+' | 'A' | 'B' | 'C';
declare function buildTakeProfitSteps(direction: 'long' | 'short', entryMid: number, risk: number, supportResistance: {
    resistance: number;
    support: number;
}, targetBuffer: number): ({
    label: "TP1";
    price: number;
} | {
    label: "TP2";
    price: number;
} | {
    label: "TP3";
    price: number;
})[];

declare function analyzeSetupSide(side: 'long' | 'short', candles: SetupCandle[], trendSummary: TrendInsight, supportResistance: SupportResistance | null): SetupInsight;

declare function getAverageTrueRange(candles: Array<{
    close: number;
    high: number;
    low: number;
}>, period?: number): number | null;
declare function getExponentialMovingAverage(values: number[], period: number, endIndex: number): number | null;
declare function getRelativeStrengthIndex(candles: Array<{
    close: number;
}>, period?: number): number | null;
declare function getSupportResistance(candles: TrendCandle[], windowSize: number): SupportResistance | null;
declare function analyzeTrend(candles: TrendCandle[], supportResistance: SupportResistance | null): TrendInsight;

declare function getBinanceFuturesBaseUrl(baseUrl?: string | null): string;
declare function getBinanceFuturesApiLabel(baseUrl?: string | null): "Binance demo futures API" | "Binance live futures API" | "Configured Binance futures API";

declare function helloCore(): string;
declare function formatText(symbol: string): string;

export { type CoinSetupAnalysisContext, type CoinSetupPathStatus, type CoinSetupSide, type SetupCandle, type SetupInsight, type SetupPathStep, type SupportResistance, type TrendCandle, type TrendDirection, type TrendInsight, analyzeSetupSide, analyzeTrend, buildSetupPathStep, buildTakeProfitSteps, buildZone, formatText, getAverageTrueRange, getBinanceFuturesApiLabel, getBinanceFuturesBaseUrl, getExponentialMovingAverage, getGradeFromScore, getRelativeStrengthIndex, getSupportResistance, helloCore };
