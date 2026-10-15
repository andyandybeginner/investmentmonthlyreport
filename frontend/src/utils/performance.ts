import { TimeSeriesPoint, FundHolding, PerformanceEvent } from '../types';

// ==============================================================================
// Complete Master Historical Time Series (Inception: 2023-07 to 2026-10)
// ==============================================================================

const MASTER_DATES = [
  "2023-07", "2023-08", "2023-09", "2023-10", "2023-11", "2023-12",
  "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
  "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
  "2026-07", "2026-08", "2026-09", "2026-10"
];

const MASTER_CURRENT = [
  1.0, 1.0056, 1.0001, 0.9343, 0.9634, 1.0137,
  1.04, 1.0654, 1.0978, 1.1422, 1.1379, 1.1715,
  1.1846, 1.1181, 1.2018, 1.2186, 1.2319, 1.2701,
  1.2227, 1.3052, 1.2742, 1.2227, 1.2661, 1.3315,
  1.4004, 1.4367, 1.4668, 1.5493, 1.5852, 1.5879,
  1.6171, 1.6651, 1.6653, 1.572, 1.7403, 1.8709,
  1.9094, 1.8274, 1.8338, 1.8116
];

const MASTER_PAST = [
  1.0, 1.0056, 1.0001, 0.9343, 0.9634, 1.0137,
  1.04, 1.0654, 1.0978, 1.1422, 1.1379, 1.1715,
  1.1846, 1.1181, 1.2018, 1.2186, 1.2319, 1.2701,
  1.2227, 1.3052, 1.2742, 1.2227, 1.2661, 1.3315,
  1.4004, 1.4082, 1.4788, 1.5949, 1.6312, 1.635,
  1.6643, 1.6789, 1.6582, 1.5948, 1.7618, 1.8755,
  1.9043, 1.8965, 1.8653, 1.8908
];

const MASTER_SP500 = [
  1.0, 1.0129, 1.0138, 0.9583, 0.981, 1.0304,
  1.0579, 1.1115, 1.1445, 1.1721, 1.1538, 1.2066,
  1.2445, 1.1676, 1.2433, 1.2814, 1.3014, 1.3713,
  1.3358, 1.3635, 1.3158, 1.2112, 1.2717, 1.3448,
  1.4112, 1.4171, 1.4527, 1.5102, 1.5291, 1.5433,
  1.552, 1.5485, 1.5461, 1.4434, 1.615, 1.6662,
  1.6391, 1.6915, 1.695, 1.7146
];

const MASTER_MSCI = [
  1.0, 1.0224, 1.012, 0.9665, 0.9923, 1.0343,
  1.0579, 1.0997, 1.1371, 1.1409, 1.1414, 1.1847,
  1.2002, 1.1366, 1.2027, 1.2578, 1.2661, 1.2945,
  1.2473, 1.2875, 1.2495, 1.1103, 1.241, 1.3072,
  1.3595, 1.3698, 1.403, 1.4612, 1.4595, 1.487,
  1.512, 1.5, 1.5012, 1.4532, 1.6196, 1.6584,
  1.6274, 1.6685, 1.6872, 1.6867
];

const MASTER_EVENTS: PerformanceEvent[] = [
  { date: "2023-07", fullDate: "2023-07-05", status: "Reconstitute", type: "restructure" },
  { date: "2025-07", fullDate: "2025-07-03", status: "Reconstitute", type: "restructure" },
  { date: "2026-01", fullDate: "2026-01-05", status: "Reconstitute", type: "restructure" }
];

export const MASTER_TIME_SERIES: TimeSeriesPoint[] = MASTER_DATES.map((date, idx) => {
  const ev = MASTER_EVENTS.find(e => e.date === date);
  return {
    date,
    current: MASTER_CURRENT[idx],
    past: MASTER_PAST[idx],
    sp500: MASTER_SP500[idx],
    msci: MASTER_MSCI[idx],
    event: ev
  };
});

// ==============================================================================
// Month Calculation & Dynamic Slicing Utilities
// ==============================================================================

/**
 * Computes the target valuation cutoff date based on report month and settle date.
 * e.g., report month "2026-08" -> settled in Sep -> target "2026-09"
 *       report month "2026-09" -> settled in Oct -> target "2026-10"
 */
export function getValuationTargetDate(reportMonth: string, settleDate?: string): string {
  if (settleDate && settleDate.length >= 7) {
    return settleDate.slice(0, 7);
  }
  try {
    const [yStr, mStr] = reportMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const nextY = m === 12 ? y + 1 : y;
    const nextM = m === 12 ? 1 : m + 1;
    return `${nextY}-${nextM.toString().padStart(2, '0')}`;
  } catch {
    return reportMonth;
  }
}

export interface MetricRow {
  r1m: number;
  r3m: number;
  r1y: number;
  r3y: number;
  cum: number;
}

export interface MultiPeriodMatrix {
  current: MetricRow;
  past: MetricRow;
  msci: MetricRow;
  sp500: MetricRow;
  alpha_acwi: MetricRow;
  alpha_sp: MetricRow;
}

export interface SlicedResult {
  sliced: TimeSeriesPoint[];
  periodsCount: number;
  startDate: string;
  endDate: string;
  targetChartDate: string;
  matrix: MultiPeriodMatrix;
  cumCurrent: number;
  cumPast: number;
  cumSp500: number;
  cumMsci: number;
  alphaVsMsci: number;
  monthlyReturn1m: number;
  monthlyAlpha1m: number;
}

export function sliceTimeSeriesByReportMonth(
  reportMonth: string,
  settleDate?: string,
  customSeries?: TimeSeriesPoint[]
): SlicedResult {
  const allSeries = customSeries && customSeries.length > 0 ? customSeries : MASTER_TIME_SERIES;
  const targetChartDate = getValuationTargetDate(reportMonth, settleDate);

  let targetIdx = allSeries.findIndex((p) => p.date === targetChartDate);
  if (targetIdx === -1) {
    // If exact target month is not yet in series, find the latest month <= targetChartDate
    targetIdx = allSeries.length - 1;
    for (let j = allSeries.length - 1; j >= 0; j--) {
      if (allSeries[j].date <= targetChartDate) {
        targetIdx = j;
        break;
      }
    }
  }

  const sliced = allSeries.slice(0, targetIdx + 1);
  const periodsCount = sliced.length;
  const startDate = sliced[0]?.date || '2023-07';
  const endDate = sliced[sliced.length - 1]?.date || targetChartDate;

  // Calculate multi-period matrix
  const i = sliced.length - 1;
  const i_prev = Math.max(0, i - 1);
  const i_3m = Math.max(0, i - 3);
  const i_1y = Math.max(0, i - 12);
  const years = Math.max(1.0, i / 12.0);

  const calc = (key: 'current' | 'past' | 'sp500' | 'msci'): MetricRow => {
    const v = sliced[i][key];
    const v_prev = sliced[i_prev][key];
    const v_3m = sliced[i_3m][key];
    const v_1y = sliced[i_1y][key];
    const v_start = sliced[0][key];

    const r1m = v_prev ? ((v / v_prev) - 1) * 100 : 0;
    const r3m = v_3m ? ((v / v_3m) - 1) * 100 : 0;
    const r1y = v_1y ? ((v / v_1y) - 1) * 100 : 0;
    const r3y = v_start ? (Math.pow(v / v_start, 1.0 / years) - 1) * 100 : 0;
    const cum = (v - 1.0) * 100;

    return { r1m, r3m, r1y, r3y, cum };
  };

  const current = calc('current');
  const past = calc('past');
  const msci = calc('msci');
  const sp500 = calc('sp500');

  const alpha_acwi: MetricRow = {
    r1m: current.r1m - msci.r1m,
    r3m: current.r3m - msci.r3m,
    r1y: current.r1y - msci.r1y,
    r3y: current.r3y - msci.r3y,
    cum: current.cum - msci.cum,
  };

  const alpha_sp: MetricRow = {
    r1m: current.r1m - sp500.r1m,
    r3m: current.r3m - sp500.r3m,
    r1y: current.r1y - sp500.r1y,
    r3y: current.r3y - sp500.r3y,
    cum: current.cum - sp500.cum,
  };

  return {
    sliced,
    periodsCount,
    startDate,
    endDate,
    targetChartDate,
    matrix: { current, past, msci, sp500, alpha_acwi, alpha_sp },
    cumCurrent: current.cum,
    cumPast: past.cum,
    cumSp500: sp500.cum,
    cumMsci: msci.cum,
    alphaVsMsci: alpha_acwi.cum,
    monthlyReturn1m: current.r1m,
    monthlyAlpha1m: alpha_acwi.r1m,
  };
}

// ==============================================================================
// Dynamic Date Labels and Month Titles
// ==============================================================================

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function getMonthDisplay(reportMonth: string, lang: 'zh' | 'en') {
  try {
    const [yStr, mStr] = reportMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const mIdx = Math.max(0, Math.min(11, m - 1));

    if (lang === 'zh') {
      return {
        memoTitle: `HR 模板投资组合 · ${m}月备忘录`,
        colHeader1m: `当月 (${y}年${m}月)`,
        monthTag: `${m}月底层透析`,
        chartTitle: (count: number, start: string, end: string) =>
          `${count}个月真实净值走势 (${start.replace('-', '.')} - ${end.replace('-', '.')})`,
      };
    } else {
      return {
        memoTitle: `HR Model Portfolio · ${MONTH_NAMES_EN[mIdx]} Memo`,
        colHeader1m: `Current Month (${MONTH_SHORT_EN[mIdx]} ${y})`,
        monthTag: `${MONTH_NAMES_EN[mIdx]} Look-Through`,
        chartTitle: (count: number, start: string, end: string) =>
          `${count}-Month Real NAV Track Record (${start.replace('-', '.')} - ${end.replace('-', '.')})`,
      };
    }
  } catch {
    return {
      memoTitle: lang === 'zh' ? 'HR 模板投资组合 · 月度备忘录' : 'HR Model Portfolio · Monthly Memo',
      colHeader1m: lang === 'zh' ? '当月' : 'Current Month',
      monthTag: lang === 'zh' ? '底层透析' : 'Look-Through',
      chartTitle: (count: number, start: string, end: string) =>
        `${count} Months (${start} - ${end})`,
    };
  }
}

export interface MonthPreset {
  month: string;
  settle_date: string;
  valuation_date_zh: string;
  valuation_date_en: string;
  ref_pdf_name: string;
  slide3_topic_title_zh: string;
  slide3_topic_title_en: string;
  qualitative_view: string;
  qualitative_view_en: string;
  rebalance_verdict: string;
  rebalance_note: string;
  rebalance_note_en: string;
  holdings_returns: { [fundId: string]: { return_1m: number; contrib_1m: number } };
}

export const MONTH_PRESETS: { [month: string]: MonthPreset } = {
  "2026-08": {
    month: "2026-08",
    settle_date: "2026-09-03",
    valuation_date_zh: "2026年9月3日 (2026年8月结算)",
    valuation_date_en: "3 September 2026 (August 2026 Valuation)",
    ref_pdf_name: "iFAST Monthly Investment Update Sep 2026.pdf",
    slide3_topic_title_zh: "超越银行主导核心——主动布局“新新加坡”高成长机遇",
    slide3_topic_title_en: "Transcending Bank-Centric Anchors: Active Positioning for \"New Singapore\" High-Growth Opportunities",
    qualitative_view: "8月受长端美债收益率攀升至5.3%创2007年新高影响，全球科技成长股出现估值分母端短期压制，组合科技板块回调；然而大华黄金单月暴涨+24.00%（穿透真实纯黄金敞口10.46%），发挥了极其卓越的非对称抗通胀与避险压舱石效应，驱动组合全月实现+0.35%正收益，跑赢标普500同期表现。",
    qualitative_view_en: "In August, the 30-year US Treasury yield surged past 5.3% to a post-2007 peak, exerting denominator valuation pressure on global tech equities. However, United Gold rallied +24.00% (delivering a 10.46% look-through pure gold hedge), serving as an extraordinary asymmetric inflation defense and driving the portfolio to a +0.35% monthly gain.",
    rebalance_verdict: "持有",
    rebalance_note: "实际权重漂移均在安全阈值内，大华黄金避险收益强劲平滑科技波动，8月维持既有 7 只标的目标配比不变，不触发被动赎回。",
    rebalance_note_en: "Weighting drifts remain safely bounded; United Gold gains offset tech drawdowns. Existing target allocations remain unchanged.",
    holdings_returns: {
      "fund-gold": { return_1m: 24.00, contrib_1m: 1.94 },
      "fund-eastspring": { return_1m: -5.64, contrib_1m: -0.99 },
      "fund-china": { return_1m: -3.09, contrib_1m: -0.46 },
      "fund-fullerton": { return_1m: 0.36, contrib_1m: 0.05 },
      "fund-janus": { return_1m: 1.20, contrib_1m: 0.17 },
      "fund-fssa": { return_1m: -1.20, contrib_1m: -0.05 },
      "fund-nikko": { return_1m: 2.10, contrib_1m: 0.08 }
    }
  },
  "2026-09": {
    month: "2026-09",
    settle_date: "2026-10-05",
    valuation_date_zh: "2026年10月5日 (2026年9月结算)",
    valuation_date_en: "5 October 2026 (September 2026 Valuation)",
    ref_pdf_name: "20261005 iFAST Monthly Investment Update.pdf",
    slide3_topic_title_zh: "当债券不再扮演债券：60/40股债平衡组合是否已死？",
    slide3_topic_title_en: "When Bonds Stop Behaving Like Bonds: Is 60/40 Dead?",
    qualitative_view: "9月美联储开启超预期50基点降息，中国央行推出强力刺激组合拳，全球流动性与风险偏好急剧抬升。在股债正相关新常态下，组合坚守‘纯股票成长引擎+富敦绝对收益对冲底仓+大华黄金逆周期防守’三支柱架构，底层基本面支撑扎实，建议保持全员持有定力。",
    qualitative_view_en: "In September, aggressive central bank policy easing sparked a global liquidity inflection. Amid persistent positive stock-bond correlations, the portfolio adheres to its three pillars: all-equity growth engine + Fullerton market-neutral core + United Gold counter-cyclical hedge. Solid underlying fundamentals justify an unwavering HOLD verdict across all 7 funds.",
    rebalance_verdict: "持有",
    rebalance_note: "全员保持持有，各支柱运作良好，无须被动调仓",
    rebalance_note_en: "Maintain all holdings; pillars operate smoothly with no forced rebalancing required.",
    holdings_returns: {
      "fund-fullerton": { return_1m: 0.21, contrib_1m: 0.07 },
      "fund-eastspring": { return_1m: -1.85, contrib_1m: -0.32 },
      "fund-janus": { return_1m: -0.42, contrib_1m: -0.06 },
      "fund-gold": { return_1m: -0.80, contrib_1m: -0.11 },
      "fund-china": { return_1m: -1.95, contrib_1m: -0.24 },
      "fund-fssa": { return_1m: -0.65, contrib_1m: -0.03 },
      "fund-nikko": { return_1m: 0.85, contrib_1m: 0.03 }
    }
  }
};

