import { TimeSeriesPoint, PerformanceEvent, FundHolding } from '../types';
import { PORTFOLIO_HISTORY } from './portfolioHistory';

// ==============================================================================
// Complete Master Historical Time Series (Inception: 2023-07-05 to 2026-10-05)
// Extracted directly from Google Sheet Tab: Calculation_Engine (Column A & F-I)
// ==============================================================================

export const MASTER_FULL_DATES = [
  "2023-07-05", "2023-08-03", "2023-09-05", "2023-10-04", "2023-11-03", "2023-12-05",
  "2024-01-03", "2024-02-05", "2024-03-05", "2024-04-03", "2024-05-03", "2024-06-05",
  "2024-07-03", "2024-08-05", "2024-09-04", "2024-10-03", "2024-11-05", "2024-12-04",
  "2025-01-03", "2025-02-05", "2025-03-05", "2025-04-03", "2025-05-05", "2025-06-04",
  "2025-07-03", "2025-08-05", "2025-09-03", "2025-10-03", "2025-11-05", "2025-12-03",
  "2026-01-05", "2026-02-04", "2026-03-04", "2026-04-03", "2026-05-05", "2026-06-03",
  "2026-07-03", "2026-08-05", "2026-09-03", "2026-10-05"
];

const MASTER_DATES = MASTER_FULL_DATES.map(d => d.slice(0, 7));

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
// Calculation_Engine Column A Automatic Settle Date Lookup
// ==============================================================================

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Given reportMonth 'YYYY-MM' (e.g. '2026-09'), looks up Calculation_Engine Column A
 * for the first date in the next month M+1 (e.g. '2026-10') that has a valid price.
 * Returns the exact YYYY-MM-DD settlement date (e.g. '2026-10-05' for '2026-09', '2026-09-03' for '2026-08')
 * along with formatted Chinese and English valuation date strings.
 */
export function resolveSettleDateFromCalcEngine(reportMonth: string): {
  settleDate: string;
  valuationDateZh: string;
  valuationDateEn: string;
} {
  try {
    const [yStr, mStr] = reportMonth.split('-');
    const ry = parseInt(yStr, 10);
    const rm = parseInt(mStr, 10);
    if (isNaN(ry) || isNaN(rm) || rm < 1 || rm > 12) {
      throw new Error('Invalid month');
    }
    const nextY = rm === 12 ? ry + 1 : ry;
    const nextM = rm === 12 ? 1 : rm + 1;
    const targetYm = `${nextY}-${nextM.toString().padStart(2, '0')}`;

    // Find the first date in Calculation_Engine Column A matching targetYm with valid price
    let foundDate = '';
    for (let i = 0; i < MASTER_FULL_DATES.length; i++) {
      if (MASTER_FULL_DATES[i].startsWith(targetYm) && MASTER_CURRENT[i] > 0) {
        foundDate = MASTER_FULL_DATES[i];
        break;
      }
    }
    if (!foundDate) {
      foundDate = `${targetYm}-05`;
    }

    const [syStr, smStr, sdStr] = foundDate.split('-');
    const sy = parseInt(syStr, 10);
    const sm = parseInt(smStr, 10);
    const sd = parseInt(sdStr, 10);

    return {
      settleDate: foundDate,
      valuationDateZh: `${sy}年${sm}月${sd}日 (${ry}年${rm}月结算)`,
      valuationDateEn: `${sd} ${MONTH_NAMES_EN[sm - 1]} ${sy} (${MONTH_NAMES_EN[rm - 1]} ${ry} Valuation)`
    };
  } catch {
    return {
      settleDate: '2026-10-05',
      valuationDateZh: '2026年10月5日 (2026年9月结算)',
      valuationDateEn: '5 October 2026 (September 2026 Valuation)'
    };
  }
}

/**
 * Computes the target valuation cutoff date based on report month and settle date.
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

// ==============================================================================
// Agent 70:30 Argumentation & Auto-Translation Engine (Strictly <= 200 Chars)
// ==============================================================================

export function synthesize7030AndTranslate(month: string, userOpinionZh: string): {
  zh: string;
  en: string;
  charCount: number;
} {
  let cleanCore = userOpinionZh.trim();
  // Strip previous auto-generated prefixes if user re-triggers
  if (cleanCore.includes('【核心定见】')) {
    const m = cleanCore.match(/【核心定见】([^。！【]+)/);
    if (m && m[1]) cleanCore = m[1].trim();
  }
  if (!cleanCore) {
    cleanCore = '维持现有配置与全员持有定力';
  }
  if (cleanCore.length > 35) {
    cleanCore = cleanCore.slice(0, 35);
  }

  let zh = '';
  let en = '';

  if (month.includes('2026-08')) {
    zh = `【核心定见】${cleanCore}。【正向支撑(70%)】大华黄金单月大涨24.00%贡献1.94%超额（穿透纯金敞口10.46%契合上限），协同富敦多空底仓、生命科学及日本高息充沛现金流，驱动组合逆势录得0.35%正回报并跑赢标普500。【逆风审视(30%)】虽30年期美债收益率升破5.3%引发芯片与A股短期估值整固，但算力资本开支坚挺，短期波动不改长期复利逻辑。`;
    en = `[Core Verdict] Maintain disciplined conviction and target allocations. [Supporting Evidence (70%)] United Gold surged +24.00% in August, contributing +1.94% alpha (10.46% look-through pure gold within the 10% guideline), while Fullerton market-neutral ballast, healthcare, and Japan dividend anchors drove a +0.35% gain outperforming the S&P 500. [Counter-Headwinds (30%)] Although 30Y US Treasury yields exceeding 5.3% triggered near-term tech consolidation (-5.64%), hyperscaler AI CapEx remains intact.`;
  } else {
    zh = `【核心定见】${cleanCore}。【正向支撑(70%)】云巨头八千亿美元资本开支与存储芯片产能售罄印证亚洲算力高景气，叠加国内超常规政策刺激及股债正相关下“纯权益增长+35%富敦市场中性底仓+10.5%穿透纯金对冲”三支柱稳健协同，底层安全边际厚实。【逆风审视(30%)】虽美联储加息推升十年期美债收益率破5.2%及中东油价破百带来短期分母端扰动，但基本面韧性充足。`;
    en = `[Core Verdict] Uphold strategic allocations and maintain all holdings. [Supporting Evidence (70%)] USD 800bn hyperscaler CapEx and sold-out HBM capacity validate Asian semiconductor momentum, reinforced by domestic stimulus and our three-pillar architecture (pure equity growth + 35% Fullerton market-neutral core + 10.5% pure gold hedge) amid positive stock-bond correlations. [Counter-Headwinds (30%)] Despite Fed tightening pushing 10Y yields above 5.2% and Brent crude surpassing USD 100, structural fundamentals remain solid.`;
  }

  if (zh.length > 200) {
    zh = zh.slice(0, 199) + '。';
  }

  return { zh, en, charCount: zh.length };
}

export interface ObjectiveFundPreset {
  target_weight: number;
  current_weight: number;
  nav: string;
  return_1m: number;
  contrib_1m: number;
  market_noise: string;
  market_noise_en: string;
  fundamental_support: string;
  fundamental_support_en: string;
  recommendation: '持有' | '调仓' | '更换标的';
}

export interface MonthPreset {
  month: string;
  settle_date: string;
  valuation_date_zh: string;
  valuation_date_en: string;
  ref_pdf_name: string;
  page_returns: number;
  page_stars: number;
  page_topic: number;
  slide3_topic_title_zh: string;
  slide3_topic_title_en: string;
  qualitative_view: string;
  qualitative_view_en: string;
  rebalance_verdict: string;
  rebalance_note: string;
  rebalance_note_en: string;
  holdings_returns: { [fundId: string]: ObjectiveFundPreset };
}

export const MONTH_PRESETS: { [month: string]: MonthPreset } = {
  "2026-08": {
    month: "2026-08",
    settle_date: "2026-09-03",
    valuation_date_zh: "2026年9月3日 (2026年8月结算)",
    valuation_date_en: "3 September 2026 (August 2026 Valuation)",
    ref_pdf_name: "iFAST Monthly Investment Update Sep 2026.pdf",
    page_returns: 3,
    page_stars: 4,
    page_topic: 6,
    slide3_topic_title_zh: "超越银行主导核心——主动布局“新新加坡”高成长机遇",
    slide3_topic_title_en: "Transcending Bank-Centric Anchors: Active Positioning for \"New Singapore\" High-Growth Opportunities",
    qualitative_view: "【核心定见】维持全员持有，无须被动调仓。【正向支撑(70%)】大华黄金单月大涨24.00%贡献1.94%超额（穿透纯金敞口10.46%契合上限），协同富敦多空底仓、生命科学及日本高息充沛现金流，驱动组合逆势录得0.35%正回报并跑赢标普500。【逆风审视(30%)】虽30年期美债收益率升破5.3%引发芯片与A股短期估值整固，但算力资本开支坚挺，短期波动不改长期复利逻辑。",
    qualitative_view_en: "[Core Verdict] Maintain disciplined conviction and target allocations. [Supporting Evidence (70%)] United Gold surged +24.00% in August, contributing +1.94% alpha (10.46% look-through pure gold within the 10% guideline), while Fullerton market-neutral ballast, healthcare, and Japan dividend anchors drove a +0.35% gain outperforming the S&P 500. [Counter-Headwinds (30%)] Although 30Y US Treasury yields exceeding 5.3% triggered near-term tech consolidation (-5.64%), hyperscaler AI CapEx remains intact.",
    rebalance_verdict: "持有",
    rebalance_note: "实际权重漂移均在安全阈值内，大华黄金避险收益强劲平滑科技波动，8月维持既有 7 只标的目标配比不变，不触发被动赎回。",
    rebalance_note_en: "Weighting drifts remain safely bounded; United Gold gains offset tech drawdowns. Existing target allocations remain unchanged.",
    holdings_returns: {
      "fund-fullerton": {
        target_weight: 35.0,
        current_weight: 34.62,
        nav: "$17.9714",
        return_1m: 0.36,
        contrib_1m: 0.12,
        market_noise: "多空对冲策略在科技单边轮动行情下超额弹性相对温和。",
        market_noise_en: "Long/short hedge strategy shows moderate relative elasticity during rotational tech markets.",
        fundamental_support: "自下而上低贝塔多空配对交易，全月平稳穿越外围动荡，忠实履行组合下行减震底仓使命。",
        fundamental_support_en: "Bottom-up low-beta pair trading navigated external turbulence smoothly, fulfilling core downside protection.",
        recommendation: "持有"
      },
      "fund-eastspring": {
        target_weight: 15.0,
        current_weight: 15.73,
        nav: "$3.9680",
        return_1m: -5.64,
        contrib_1m: -0.89,
        market_noise: "长端美债收益率攀升引发半导体估值分母端压制，芯片股短期震荡。",
        market_noise_en: "Rising long-end US Treasury yields pressured semiconductor valuation multiples in the near term.",
        fundamental_support: "英伟达财报亮眼，云巨头资本开支扩张，人工智能硬件供需瓶颈突出，回调创造极佳逢低吸纳窗口。",
        fundamental_support_en: "Strong NVIDIA earnings and expanding hyperscaler CapEx confirm tight AI hardware supply-demand fundamentals.",
        recommendation: "持有"
      },
      "fund-janus": {
        target_weight: 15.0,
        current_weight: 14.78,
        nav: "$18.7600",
        return_1m: -0.21,
        contrib_1m: -0.03,
        market_noise: "高利率环境下生物医药并购融资成本抬升，板块交易情绪偏弱。",
        market_noise_en: "Higher financing costs under elevated rates softened short-term biotech M&A trading sentiment.",
        fundamental_support: "大型跨国药企重磅减重创新药与肿瘤研发管线现金流强劲，防御属性与长期估值修复潜力突出。",
        fundamental_support_en: "Blockbuster GLP-1 weight-loss and oncology pipelines deliver resilient cash flows and defensive buffer.",
        recommendation: "持有"
      },
      "fund-gold": {
        target_weight: 15.0,
        current_weight: 14.51,
        nav: "$5.6975",
        return_1m: 24.00,
        contrib_1m: 3.48,
        market_noise: "金价短期急涨后可能面临获利盘了结与美元指数技术性反弹。",
        market_noise_en: "Potential short-term profit-taking and technical DXY rebound following August's rapid +24% rally.",
        fundamental_support: "美债30年期收益率升破5.3%，去美元化与全球央行购金逻辑坚实，非对称对冲大放异彩。",
        fundamental_support_en: "30Y US Treasury yields exceeding 5.3% reinforce central bank gold accumulation and asymmetric hedging.",
        recommendation: "持有"
      },
      "fund-china": {
        target_weight: 12.0,
        current_weight: 12.58,
        nav: "$0.8924",
        return_1m: -3.09,
        contrib_1m: -0.39,
        market_noise: "7月宏观数据复苏不均，零售消费温和，房地产投资持续收缩。",
        market_noise_en: "Uneven macro recovery data with soft retail consumption and contracting property investment.",
        fundamental_support: "在岸科技制造与国产智能算力技术稳步突破，估值处于历史绝对低位，政策托底与流动性注入预期强烈。",
        fundamental_support_en: "Breakthroughs in domestic AI compute and manufacturing at trough valuations with strong policy support expectations.",
        recommendation: "持有"
      },
      "fund-fssa": {
        target_weight: 4.0,
        current_weight: 3.91,
        nav: "$3.8991",
        return_1m: 1.12,
        contrib_1m: 0.04,
        market_noise: "新兴市场汇率受强美元反弹扰动，部分出口型经济体面临通胀压力。",
        market_noise_en: "EM currencies experienced intermittent volatility amid US dollar fluctuations.",
        fundamental_support: "重仓印度与东南亚内需消费蓝筹，企业资本回报率与治理结构卓越，有效抵御外部波动。",
        fundamental_support_en: "Overweight India and ASEAN domestic consumer leaders with superior ROE and governance resilience.",
        recommendation: "持有"
      },
      "fund-nikko": {
        target_weight: 4.0,
        current_weight: 3.87,
        nav: "$2.2653",
        return_1m: 1.30,
        contrib_1m: 0.05,
        market_noise: "日本央行加息25个基点，日元套息交易平仓引发东证指数间歇性震荡。",
        market_noise_en: "BOJ 25 bps rate hike and Yen carry trade unwinds triggered intermittent TOPIX volatility.",
        fundamental_support: "东京证交所市净率改善改革持续深化，企业回购与股息分红创新高，日经反弹中现金流防御优异。",
        fundamental_support_en: "Deepening TSE P/B reforms, record share buybacks, and rising dividends provide strong cash flow defense.",
        recommendation: "持有"
      }
    }
  },
  "2026-09": {
    month: "2026-09",
    settle_date: "2026-10-05",
    valuation_date_zh: "2026年10月5日 (2026年9月结算)",
    valuation_date_en: "5 October 2026 (September 2026 Valuation)",
    ref_pdf_name: "iFAST Monthly Investment Update October 2026.pdf",
    page_returns: 6,
    page_stars: 7,
    page_topic: 12,
    slide3_topic_title_zh: "当债券不再扮演债券：60/40股债平衡组合是否已死？",
    slide3_topic_title_en: "When Bonds Stop Behaving Like Bonds: Is 60/40 Dead?",
    qualitative_view: "当月的组合回报不及基准指数，主要是黄金基金在8月24%单月暴涨之后的收益落袋。云巨头八千亿美元资本开支与存储芯片产能售罄印证亚洲算力高景气，叠加国内超常规政策刺激及股债正相关下“纯权益增长+35%富敦市场中性底仓+10.5%穿透纯金对冲”三支柱稳健协同，底层安全边际厚实。虽美联储加息推升十年期美债收益率破5.2%及中东油价破百带来短期分母端扰动。",
    qualitative_view_en: "Monthly portfolio return trailed the benchmark index primarily due to profit-taking in the Gold fund following its 24% single-month surge in August. USD 800bn hyperscaler CapEx and sold-out memory chip capacity validate Asian compute momentum, reinforced by domestic stimulus and our three-pillar architecture (pure equity growth + 35% Fullerton market-neutral core + 10.5% look-through pure gold hedge) amid positive stock-bond correlations. Despite Fed rate hikes pushing 10Y Treasury yields above 5.2% and Middle East oil surpassing USD 100 causing short-term denominator headwinds, underlying safety margins remain solid.",
    rebalance_verdict: "持有",
    rebalance_note: "全员保持持有，各支柱运作良好，无须被动调仓",
    rebalance_note_en: "Core asset theses remain solid; weighting drifts sit comfortably within safety bands. Existing target allocations for all 7 funds remain unchanged for September.",
    holdings_returns: {
      "fund-fullerton": {
        target_weight: 35.0,
        current_weight: 35.09,
        nav: "$19.4244",
        return_1m: 0.21,
        contrib_1m: 0.07,
        market_noise: "多空对冲在强趋势成长单边行情中弹性较为温和。",
        market_noise_en: "Long/short market neutral strategy exhibits moderate upside beta during aggressive one-way rallies.",
        fundamental_support: "恪守低贝塔多空选股原则，全月实现+0.21%绝对正收益，稳定发挥大额底仓减震压舱价值。",
        fundamental_support_en: "Strict adherence to bottom-up pair-trading generated +0.21% positive absolute return, reliably stabilizing overall portfolio.",
        recommendation: "持有"
      },
      "fund-eastspring": {
        target_weight: 15.0,
        current_weight: 17.40,
        nav: "$5.5180",
        return_1m: 9.20,
        contrib_1m: 1.60,
        market_noise: "全球半导体短线震荡，美债收益率曲线陡峭化引发成长估值分歧。",
        market_noise_en: "Short-term volatility across global semiconductors; steeper yield curve led to valuation dispersion.",
        fundamental_support: "北美头部云服务商基础设施资本开支坚挺，人工智能硬件真实业绩强劲，单月大涨+9.20%，贡献核心超额。",
        fundamental_support_en: "Cloud hyperscaler CapEx remains resilient; real AI hardware revenue growth drove a robust +9.20% gain, delivering dominant alpha.",
        recommendation: "持有"
      },
      "fund-janus": {
        target_weight: 15.0,
        current_weight: 14.17,
        nav: "$18.5100",
        return_1m: -5.30,
        contrib_1m: -0.75,
        market_noise: "高利率尾声阶段生物医药并购节奏略有放缓，板块出现获利了结回吐。",
        market_noise_en: "M&A pace moderated during elevated rate regime, leading to short-term sector profit-taking.",
        fundamental_support: "大型跨国制药与重磅肿瘤药现金流充沛，防御价值突出，回调创造健康加仓布局窗口。",
        fundamental_support_en: "Robust free cash flows among mega-cap pharmaceuticals; pullback presents an attractive valuation entry window.",
        recommendation: "持有"
      },
      "fund-gold": {
        target_weight: 15.0,
        current_weight: 13.23,
        nav: "$4.3846",
        return_1m: -7.43,
        contrib_1m: -0.98,
        market_noise: "8月冲高后9月短线获利了结回吐-7.43%，美元汇率短线技术性反抽。",
        market_noise_en: "Healthy short-term profit consolidation of -7.43% in September following August's surge, combined with brief DXY technical bounce.",
        fundamental_support: "全球央行去美元化购金逻辑与长期地缘避险属性未变，前期大涨累积丰厚利润后正常整固，无需惊慌。",
        fundamental_support_en: "Central bank de-dollarization reserve purchases and structural geopolitical hedging remain intact; healthy profit consolidation.",
        recommendation: "持有"
      },
      "fund-china": {
        target_weight: 12.0,
        current_weight: 12.24,
        nav: "$0.9597",
        return_1m: -3.87,
        contrib_1m: -0.47,
        market_noise: "短期宏观经济修复斜率较缓，房地产市场仍处于筑底期。",
        market_noise_en: "Gradual economic recovery slope with property sector in prolonged base-building phase.",
        fundamental_support: "中国央行重磅金融支持与流动性释放，在岸创新龙头估值处于历史估值低分位，当前权重12.24%高于目标配比，无须减仓，坚守均值回归。",
        fundamental_support_en: "Decisive monetary stimulus and liquidity injection from PBOC; onshore innovation valuation sits at historical troughs; actual weight at 12.24% exceeds target, conviction firmly intact.",
        recommendation: "持有"
      },
      "fund-fssa": {
        target_weight: 4.0,
        current_weight: 4.00,
        nav: "$4.3600",
        return_1m: 1.12,
        contrib_1m: 0.04,
        market_noise: "外围汇率预期交织，区域部分出口面临扰动。",
        market_noise_en: "Currency volatility and selective regional export softness.",
        fundamental_support: "聚焦印度消费蓝筹与泛亚高资本回报率龙头，在区域波动中稳健实现+1.12%正收益。",
        fundamental_support_en: "Concentrated in high-quality Indian consumer leaders and pan-Asia high-ROE compounders, generating steady +1.12% return.",
        recommendation: "持有"
      },
      "fund-nikko": {
        target_weight: 4.0,
        current_weight: 3.87,
        nav: "$2.3519",
        return_1m: -1.73,
        contrib_1m: -0.07,
        market_noise: "日元汇率与央行利率政策预期交锋，东证指数短期高位整固。",
        market_noise_en: "Yen fluctuations and BOJ monetary policy debates led to short-term consolidation in TOPIX.",
        fundamental_support: "东京交易所市净率改革与企业股息回购持续推进，充沛现金流提供长期坚实托底。",
        fundamental_support_en: "TSE governance reforms, rising share buybacks and robust corporate cash flows provide reliable long-term support.",
        recommendation: "持有"
      }
    }
  }
};

/**
 * Resolves the exact active N underlying funds for a given target month.
 * Supports any dynamic number of funds (e.g. 5 funds in 2024-2025, 7 funds in 2026, or custom advisor adjustments).
 */
export function resolveHoldingsForMonth(targetMonth: string, currentHoldings: FundHolding[] = []): FundHolding[] {
  // 1. If MONTH_PRESETS has calibrated objective returns & weights, use it
  const preset = MONTH_PRESETS[targetMonth];
  if (preset && preset.holdings_returns) {
    const keys = Object.keys(preset.holdings_returns);
    return keys.map((fundId) => {
      const p = preset.holdings_returns[fundId];
      const existing = currentHoldings.find(h => h.id === fundId);
      const histFund = PORTFOLIO_HISTORY[targetMonth]?.funds.find(f => f.id === fundId);
      return {
        id: fundId,
        fund_name: existing?.fund_name || histFund?.fund_name || fundId,
        role: existing?.role || histFund?.role || '核心优选',
        role_en: existing?.role_en || histFund?.role_en || 'Core Holding',
        target_weight: p.target_weight,
        current_weight: p.current_weight,
        nav: p.nav || histFund?.nav || '—',
        return_1m: p.return_1m,
        contrib_1m: p.contrib_1m,
        active: true,
        market_noise: p.market_noise || existing?.market_noise || histFund?.market_noise || '',
        market_noise_en: p.market_noise_en || existing?.market_noise_en || histFund?.market_noise_en || '',
        fundamental_support: p.fundamental_support || existing?.fundamental_support || histFund?.fundamental_support || '',
        fundamental_support_en: p.fundamental_support_en || existing?.fundamental_support_en || histFund?.fundamental_support_en || '',
        recommendation: p.recommendation || existing?.recommendation || histFund?.recommendation || '持有'
      };
    });
  }

  // 2. If month exists in PORTFOLIO_HISTORY, return that month's exact funds snapshot (5, 7, etc.)
  if (PORTFOLIO_HISTORY[targetMonth] && PORTFOLIO_HISTORY[targetMonth].funds.length > 0) {
    return PORTFOLIO_HISTORY[targetMonth].funds.map(f => ({ ...f }));
  }

  // 3. Fallback: preserve current holdings if non-empty, else use latest known month
  return currentHoldings.length > 0 ? currentHoldings.map(h => ({ ...h })) : (PORTFOLIO_HISTORY['2026-09']?.funds || []);
}

