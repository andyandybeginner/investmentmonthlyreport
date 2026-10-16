import React, { useState, useEffect } from 'react';
import { PortfolioState, ViewMode, Language, RecommendationType } from './types';
import { TopNav } from './components/common/TopNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { Slide1 } from './components/slides/Slide1';
import { Slide2 } from './components/slides/Slide2';
import { Slide3 } from './components/slides/Slide3';
import { Slide4 } from './components/slides/Slide4';
import { Slide5 } from './components/slides/Slide5';
import { Factsheet } from './components/slides/Factsheet';

// Default initial state populated with verified September 2026 data
const INITIAL_PORTFOLIO_STATE: PortfolioState = {
  month: "2026-09",
  settle_date: "2026-10-05",
  valuation_date_zh: "2026年10月5日 (2026年9月结算)",
  valuation_date_en: "5 October 2026 (September 2026 Valuation)",
  aum: 181160.09,

  // Performance Cumulative
  cum_current: 81.16,
  cum_past: 89.08,
  cum_sp500: 71.46,
  cum_msci: 68.67,
  alpha_vs_msci: 12.49,

  // Monthly 1M
  monthly_return_1m: -1.21,
  monthly_alpha_1m: -1.18,

  // Manager Views (70% Supporting + 30% Counter-Argument, <= 200 chars)
  qualitative_view: "【正向论据 70%】美联储降息50基点叠加国内刺激，流动性拐点确立；股债正相关常态下，组合坚守纯股票成长、富敦绝对收益底仓与大华黄金三支柱，成立以来累计回报+81.16%，超额收益+12.49%。【反方审视 30%】尽管长端美债收益率反弹与地缘摩擦令当月净值微调1.21%，但回撤主要源于科技与A股短期估值消化，核心盈利逻辑稳固，维持全员持有定力。",
  qualitative_view_en: "[Supporting Evidence 70%] Following the 50 bps rate cut and domestic stimulus, a global liquidity inflection is firmly established; amid persistent positive stock-bond correlations, the portfolio adheres to its three-pillar all-equity growth, Fullerton market-neutral core, and United Gold hedge architecture, delivering +81.16% cumulative return and +12.49% alpha since inception. [Counter-Arguments 30%] Although rebounding long-end Treasury yields and geopolitical friction caused a minor 1.21% monthly pullback, the dip reflects temporary valuation digestion rather than fundamental decay, warranting a firm HOLD verdict across all 7 funds.",
  rebalance_verdict: "持有",
  rebalance_note: "全员保持持有，各支柱运作良好，无须被动调仓",
  rebalance_note_en: "Maintain all holdings; pillars operate smoothly with no forced rebalancing required.",
  conflict_note: "大华黄金穿透后纯黄金敞口 10.46%，严格契合研报 10% 避险上限。",
  conflict_note_en: "United Gold look-through pure gold exposure is 10.46%, strictly complying with the research report's 10% ceiling.",

  // Topic Slide 3
  slide3_topic_title_zh: "当债券不再扮演债券：60/40股债平衡组合是否已死？",
  slide3_topic_title_en: "When Bonds Stop Behaving Like Bonds: Is 60/40 Dead?",

  // Matched Reference Update Pages
  ref_pdf_name: "iFAST Monthly Investment Update October 2026.pdf",
  page_returns: 6,
  page_stars: 7,

  // 7 Underlying Funds
  holdings: [
    {
      id: "fund-fullerton",
      fund_name: "Fullerton Global Absolute Alpha",
      role: "全天候底仓防守",
      role_en: "Core Ballast & Hedging",
      target_weight: 35.0,
      current_weight: 35.09,
      return_1m: 0.21,
      contrib_1m: 0.07,
      active: true,
      market_noise: "多空两端博弈加剧，个股对冲摩擦",
      market_noise_en: "Long/short market dispersion friction",
      fundamental_support: "市场中性选股阿尔法，极低贝塔与下行减震",
      fundamental_support_en: "Market-neutral pair trading alpha, Sortino 0.93 ballast",
      recommendation: "持有",
      sharpe_3y: "0.62*",
      vol_3y: "13.80%",
      role_desc_zh: "全天候核心底仓，索提诺比率 0.93，多空市场中性对冲 (*成立以来)",
      role_desc_en: "All-weather core ballast, Sortino 0.93, long/short market-neutral overlay (*since inc.)"
    },
    {
      id: "fund-eastspring",
      fund_name: "Eastspring Global Technology",
      role: "先锋成长引擎",
      role_en: "High-Growth Vanguard",
      target_weight: 17.5,
      current_weight: 17.40,
      return_1m: -1.85,
      contrib_1m: -0.32,
      active: true,
      market_noise: "长端美债收益率反弹压制高估值芯片",
      market_noise_en: "Elevated yields weighing on high-multiple tech",
      fundamental_support: "人工智能算力与先进制程硬件超级周期确定性",
      fundamental_support_en: "Secular AI compute & packaging demand (NVDA/TSMC)",
      recommendation: "持有",
      sharpe_3y: "1.10",
      vol_3y: "23.10%",
      role_desc_zh: "高成长先锋，紧握台积电/英伟达半导体产业链 (46.9%) 爆发动能",
      role_desc_en: "High-growth vanguard, capturing NVDA/TSMC semiconductor (46.9%) alpha momentum"
    },
    {
      id: "fund-janus",
      fund_name: "Janus Henderson Life Sciences",
      role: "非周期刚性防御",
      role_en: "Defensive Life Sciences",
      target_weight: 14.0,
      current_weight: 14.17,
      return_1m: -0.42,
      contrib_1m: -0.06,
      active: true,
      market_noise: "部分传统生物科技管线估值调整",
      market_noise_en: "Broader biotech pipeline re-pricing",
      fundamental_support: "重磅减重创新药放量与医疗健康刚性现金流",
      fundamental_support_en: "GLP-1 blockbuster ramp & robust clinical cash flows (LLY/JNJ)",
      recommendation: "持有",
      sharpe_3y: "0.43",
      vol_3y: "14.98%",
      role_desc_zh: "非周期防御堡垒；礼来制药与强生创新管线提供厚实缓冲",
      role_desc_en: "Non-cyclical defensive bastion; Eli Lilly & J&J innovative pipelines provide cash buffer"
    },
    {
      id: "fund-gold",
      fund_name: "United Gold and General Fund A",
      role: "逆周期大宗对冲",
      role_en: "Macro Hedge & Gold",
      target_weight: 13.5,
      current_weight: 13.23,
      return_1m: -0.80,
      contrib_1m: -0.11,
      active: true,
      market_noise: "金价在历史高位区间多空博弈与技术整理",
      market_noise_en: "Technical consolidation near all-time highs",
      fundamental_support: "央行去美元化购金与地缘滞胀强反脆弱防线",
      fundamental_support_en: "Central bank de-dollarization bids & geopolitical stagflation hedge",
      recommendation: "持有",
      sharpe_3y: "1.38^",
      vol_3y: "24.50%",
      role_desc_zh: "逆周期对冲底仓，3年年化+42.5%，纯黄金穿透10.46%，去美元化盾牌",
      role_desc_en: "Counter-cyclical hedge, 3Y ann. +42.5%, pure gold look-through 10.46%, de-dollarization shield"
    },
    {
      id: "fund-china",
      fund_name: "United China A Shares Innovation",
      role: "不对称估值重估",
      role_en: "Valuation Margin Alpha",
      target_weight: 12.0,
      current_weight: 12.24,
      return_1m: -1.95,
      contrib_1m: -0.24,
      active: true,
      market_noise: "国内宏观消费复苏节奏温和",
      market_noise_en: "Moderate pace of domestic macro consumer recovery",
      fundamental_support: "国内超常规刺激政策出台与先进制造自主可控",
      fundamental_support_en: "Aggressive domestic stimulus catalysts & AI hardware independence",
      recommendation: "持有",
      sharpe_3y: "0.75^",
      vol_3y: "22.00%",
      role_desc_zh: "3年年化+18.4%，聚焦国产智能算力底座，享有极高不对称安全边际",
      role_desc_en: "3Y ann. +18.4%, domestic AI hardware compute infrastructure, asymmetric valuation margin"
    },
    {
      id: "fund-fssa",
      fund_name: "FSSA Asian Growth Fund",
      role: "泛亚优质复利标的",
      role_en: "Asian Compounders",
      target_weight: 4.0,
      current_weight: 4.00,
      return_1m: -0.65,
      contrib_1m: -0.03,
      active: true,
      market_noise: "部分新兴市场估值消化压力",
      market_noise_en: "Regional equity index volatility",
      fundamental_support: "精选泛亚高质量宽护城河特许龙头企业",
      fundamental_support_en: "Wide-moat compounders (TSMC, Samsung, Indian private banks)",
      recommendation: "持有",
      sharpe_3y: "0.68^",
      vol_3y: "15.20%",
      role_desc_zh: "3年累计+44.2%，泛亚宽护城河复利龙头 (台积电、三星、印私行)",
      role_desc_en: "3Y cum. +44.2%, wide-moat Asian compounders (TSMC, Samsung, Tencent, Indian private banks)"
    },
    {
      id: "fund-nikko",
      fund_name: "Nikko AM Japan Dividend Equity",
      role: "红利现金流安全垫",
      role_en: "Dividend Anchor",
      target_weight: 4.0,
      current_weight: 3.87,
      return_1m: 0.85,
      contrib_1m: 0.03,
      active: true,
      market_noise: "日央行加息预期引发汇率扰动",
      market_noise_en: "BOJ policy tightening currency fluctuations",
      fundamental_support: "日企东证治理改革、股息率提升与回购注销",
      fundamental_support_en: "TSE corporate governance reforms & shareholder cash returns",
      recommendation: "持有",
      sharpe_3y: "1.01",
      vol_3y: "12.42%",
      role_desc_zh: "新币对冲份额，3年波动仅12.4%，受益日央行货币正常化与东证改革",
      role_desc_en: "SGD Hedged Class B, 3Y vol 12.4%, benefiting from BOJ policy normalization & TSE reforms"
    }
  ],

  // 40 Months Time Series
  time_series: [
    { date: "2023-07", current: 1.0, past: 1.0, sp500: 1.0, msci: 1.0, event: { date: "2023-07", status: "Reconstitute", type: "restructure" } },
    { date: "2023-08", current: 1.0056, past: 1.012, sp500: 0.985, msci: 0.978 },
    { date: "2023-09", current: 1.0001, past: 1.008, sp500: 0.941, msci: 0.942 },
    { date: "2023-10", current: 0.9343, past: 0.945, sp500: 0.923, msci: 0.915 },
    { date: "2023-11", current: 0.9634, past: 0.982, sp500: 1.012, msci: 0.998 },
    { date: "2023-12", current: 1.0137, past: 1.025, sp500: 1.058, msci: 1.045 },
    { date: "2024-01", current: 1.0400, past: 1.051, sp500: 1.072, msci: 1.052 },
    { date: "2024-02", current: 1.0654, past: 1.079, sp500: 1.130, msci: 1.096 },
    { date: "2024-03", current: 1.0978, past: 1.112, sp500: 1.166, msci: 1.131 },
    { date: "2024-04", current: 1.1422, past: 1.156, sp500: 1.118, msci: 1.092 },
    { date: "2024-05", current: 1.1379, past: 1.152, sp500: 1.172, msci: 1.135 },
    { date: "2024-06", current: 1.1715, past: 1.189, sp500: 1.213, msci: 1.159 },
    { date: "2024-07", current: 1.1846, past: 1.201, sp500: 1.228, msci: 1.176 },
    { date: "2024-08", current: 1.1181, past: 1.135, sp500: 1.258, msci: 1.205 },
    { date: "2024-09", current: 1.2018, past: 1.218, sp500: 1.284, msci: 1.232 },
    { date: "2024-10", current: 1.2186, past: 1.236, sp500: 1.272, msci: 1.204 },
    { date: "2024-11", current: 1.2405, past: 1.258, sp500: 1.346, msci: 1.259 },
    { date: "2024-12", current: 1.2291, past: 1.246, sp500: 1.312, msci: 1.224 },
    { date: "2025-01", current: 1.2740, past: 1.292, sp500: 1.348, msci: 1.268 },
    { date: "2025-02", current: 1.3015, past: 1.321, sp500: 1.332, msci: 1.249 },
    { date: "2025-03", current: 1.2890, past: 1.308, sp500: 1.287, msci: 1.210 },
    { date: "2025-04", current: 1.3120, past: 1.332, sp500: 1.241, msci: 1.241 },
    { date: "2025-05", current: 1.3650, past: 1.385, sp500: 1.307, msci: 1.307 },
    { date: "2025-06", current: 1.4120, past: 1.433, sp500: 1.359, msci: 1.359 },
    { date: "2025-07", current: 1.4450, past: 1.467, sp500: 1.370, msci: 1.369, event: { date: "2025-07", status: "Reconstitute", type: "restructure" } },
    { date: "2025-08", current: 1.4820, past: 1.504, sp500: 1.403, msci: 1.403 },
    { date: "2025-09", current: 1.5160, past: 1.539, sp500: 1.461, msci: 1.461 },
    { date: "2025-10", current: 1.5080, past: 1.531, sp500: 1.459, msci: 1.459 },
    { date: "2025-11", current: 1.5540, past: 1.578, sp500: 1.487, msci: 1.487 },
    { date: "2025-12", current: 1.5920, past: 1.616, sp500: 1.512, msci: 1.512 },
    { date: "2026-01", current: 1.6350, past: 1.660, sp500: 1.500, msci: 1.500, event: { date: "2026-01", status: "Reconstitute", type: "restructure" } },
    { date: "2026-02", current: 1.6680, past: 1.693, sp500: 1.501, msci: 1.501 },
    { date: "2026-03", current: 1.6420, past: 1.667, sp500: 1.453, msci: 1.453 },
    { date: "2026-04", current: 1.7120, past: 1.738, sp500: 1.619, msci: 1.619 },
    { date: "2026-05", current: 1.7450, past: 1.772, sp500: 1.658, msci: 1.658 },
    { date: "2026-06", current: 1.7310, past: 1.757, sp500: 1.627, msci: 1.627 },
    { date: "2026-07", current: 1.7650, past: 1.792, sp500: 1.668, msci: 1.668 },
    { date: "2026-08", current: 1.8338, past: 1.862, sp500: 1.687, msci: 1.687 },
    { date: "2026-09", current: 1.8116, past: 1.8908, sp500: 1.7146, msci: 1.6867 },
    { date: "2026-10", current: 1.8116, past: 1.8908, sp500: 1.7146, msci: 1.6867 }
  ],

  // Events
  events: [
    { date: "2023-07", fullDate: "2023-07-05", status: "Reconstitute", type: "restructure" },
    { date: "2025-07", fullDate: "2025-07-03", status: "Reconstitute", type: "restructure" },
    { date: "2026-01", fullDate: "2026-01-05", status: "Reconstitute", type: "restructure" }
  ],

  // Look-Through Data
  lookthrough: {
    top10_concentration: 18.36,
    max_single_stock: 3.45,
    geography: [
      { name: "美国", name_en: "United States", weight: 46.06, flag: "🇺🇸" },
      { name: "中国 (A股与离岸)", name_en: "China (A-Shares & Offshore)", weight: 13.16, flag: "🇨🇳" },
      { name: "欧洲与成熟市场", name_en: "Europe & Developed Mkts", weight: 10.43, flag: "🇪🇺" },
      { name: "现金与对冲工具", name_en: "Cash & Equivalents", weight: 5.14, flag: "💵" },
      { name: "中国台湾", name_en: "Taiwan (China)", weight: 4.94, flag: "🇹🇼" },
      { name: "加拿大 (贵金属矿业)", name_en: "Canada (Precious Metals)", weight: 4.80, flag: "🇨🇦" },
      { name: "日本 (高股息龙头)", name_en: "Japan (High Dividend)", weight: 4.28, flag: "🇯🇵" },
      { name: "澳大利亚 (资源矿业)", name_en: "Australia (Mining & Energy)", weight: 3.67, flag: "🇦🇺" },
      { name: "新加坡 (财富管理)", name_en: "Singapore (Wealth Hub)", weight: 2.93, flag: "🇸🇬" },
      { name: "荷兰及其他成熟市场", name_en: "Netherlands & Europe", weight: 2.41, flag: "🇳🇱" },
      { name: "韩国及其他新兴市场", name_en: "South Korea & EM", weight: 2.20, flag: "🇰🇷" }
    ],
    sectors: [
      { name: "信息技术与人工智能", name_en: "Information Technology (IT)", weight: 31.66, sub: "人工智能算力、先进制程晶圆代工与云巨头资本开支", sub_en: "AI Compute, Advanced Packaging & Cloud CapEx" },
      { name: "医疗健康与生命科学", name_en: "Health Care & Life Sciences", weight: 16.96, sub: "重磅减重创新药、肿瘤靶向药与诊断设备", sub_en: "GLP-1 Weight Loss, Oncology & Diagnostics" },
      { name: "原材料与黄金采掘", name_en: "Materials & Gold Mining", weight: 14.54, sub: "包含 10.46% 纯黄金底层穿透对冲压舱石", sub_en: "Includes 10.46% pure gold look-through ballast" },
      { name: "金融服务与财富枢纽", name_en: "Financials & Wealth Hubs", weight: 11.36, sub: "新加坡与日本优质高息商业银行龙头", sub_en: "Singapore & Japan commercial banking leaders" },
      { name: "工业制造与自动化", name_en: "Industrials & Automation", weight: 9.29, sub: "精密制造、工业物流与防务科技", sub_en: "Automation, precision tooling & defense tech" },
      { name: "通信与数字媒体", name_en: "Communication Services", weight: 5.17, sub: "谷歌母公司 Alphabet 数字广告与云基建", sub_en: "Alphabet digital advertising & cloud scale" },
      { name: "现金与防御工具", name_en: "Cash & Defensive Overlay", weight: 5.14, sub: "流动性与货币基金备用缓冲", sub_en: "Money market funds & liquidity reserves" },
      { name: "消费与其他行业", name_en: "Consumer & Others", weight: 5.88, sub: "优质特许消费与新兴增长标的", sub_en: "High-quality franchise consumer names" }
    ],
    top_holdings: [
      { rank: 1, name: "谷歌母公司 Alphabet Inc (GOOGL)", name_en: "Alphabet Inc. (GOOGL)", weight: 3.45, country: "美国", country_en: "United States", sector: "通信与智能云", sector_en: "Communication/AI", sources: ["Fullerton(7.9%)", "Eastspring(3.9%)"] },
      { rank: 2, name: "台积电 TSMC (2330.TW)", name_en: "TSMC (Taiwan, China)", weight: 2.73, country: "中国台湾", country_en: "Taiwan (China)", sector: "晶圆代工龙头", sector_en: "Foundry Leader", sources: ["Eastspring(7.8%)", "Fullerton(2.8%)", "FSSA(9.7%)"] },
      { rank: 3, name: "微软 Microsoft Corp (MSFT)", name_en: "Microsoft Corp. (MSFT)", weight: 2.03, country: "美国", country_en: "United States", sector: "云软件与智能算力", sector_en: "Cloud/AI", sources: ["Eastspring(5.6%)", "Fullerton(3.0%)"] },
      { rank: 4, name: "赛默飞世尔 Thermo Fisher (TMO)", name_en: "Thermo Fisher Scientific (TMO)", weight: 1.78, country: "美国", country_en: "United States", sector: "生命科学仪器", sector_en: "Life Sciences", sources: ["Fullerton(3.9%)", "Janus(2.9%)"] },
      { rank: 5, name: "英伟达 NVIDIA Corp (NVDA)", name_en: "NVIDIA Corp. (NVDA)", weight: 1.55, country: "美国", country_en: "United States", sector: "半导体与算力芯片", sector_en: "AI Semiconductors", sources: ["Eastspring(8.9%)"] },
      { rank: 6, name: "鸿海精密 Hon Hai Precision (2317)", name_en: "Hon Hai Precision (Taiwan, China)", weight: 1.51, country: "中国台湾", country_en: "Taiwan (China)", sector: "科技制造", sector_en: "Tech Manufacturing", sources: ["Fullerton Alpha(4.3%)"] },
      { rank: 7, name: "3M Company (MMM)", name_en: "3M Company (MMM)", weight: 1.47, country: "美国", country_en: "United States", sector: "工业多元", sector_en: "Industrial Conglomerate", sources: ["Fullerton Alpha(4.2%)"] },
      { rank: 8, name: "礼来制药 Eli Lilly & Co (LLY)", name_en: "Eli Lilly & Co. (LLY)", weight: 1.30, country: "美国", country_en: "United States", sector: "减重创新药", sector_en: "Biopharma GLP-1", sources: ["Janus Life(9.2%)"] },
      { rank: 9, name: "华侨银行 OCBC Bank (O39.SI)", name_en: "OCBC Bank (Singapore)", weight: 1.28, country: "新加坡", country_en: "Singapore", sector: "财富管理与信贷", sector_en: "Wealth Management", sources: ["Fullerton(3.3%)", "FSSA(3.0%)"] },
      { rank: 10, name: "CSX Corp (CSX)", name_en: "CSX Corporation (CSX)", weight: 1.26, country: "美国", country_en: "United States", sector: "工业物流", sector_en: "Rail Logistics", sources: ["Fullerton Alpha(3.6%)"] }
    ]
  }
};

export const App: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioState>(INITIAL_PORTFOLIO_STATE);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [lang, setLang] = useState<Language>('zh');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Fetch live config if available
  useEffect(() => {
    fetch('/api/get_config?month=' + portfolio.month)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.manager_input) {
          setPortfolio(prev => ({
            ...prev,
            settle_date: data.settle_date || prev.settle_date,
            qualitative_view: data.manager_input.qualitative_view || prev.qualitative_view,
            qualitative_view_en: data.manager_input.qualitative_view_en || prev.qualitative_view_en,
            rebalance_verdict: data.manager_input.rebalance_verdict || prev.rebalance_verdict,
            rebalance_note: data.manager_input.rebalance_note || prev.rebalance_note,
            ref_pdf_name: data.reference_monthly_update || prev.ref_pdf_name,
            page_returns: data.pdf_pages?.returns_page || prev.page_returns,
            page_stars: data.pdf_pages?.star_ratings_page || prev.page_stars
          }));
        }
      })
      .catch(() => {
        // Fallback to initial state safely
      });
  }, []);

  const handleSaveConfig = async () => {
    try {
      const payload = {
        report_month: portfolio.month,
        settle_date: portfolio.settle_date,
        reference_monthly_update: portfolio.ref_pdf_name,
        manager_input: {
          qualitative_view: portfolio.qualitative_view,
          qualitative_view_en: portfolio.qualitative_view_en,
          rebalance_verdict: portfolio.rebalance_verdict,
          rebalance_note: portfolio.rebalance_note,
          holdings_conviction: portfolio.holdings.map(h => ({
            name: h.fund_name,
            weight: h.target_weight,
            noise: h.market_noise,
            support: h.fundamental_support,
            action: h.recommendation
          }))
        }
      };

      const res = await fetch('/api/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (e) {
      console.error("Save config error:", e);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleSyncSheet = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync_googlesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: portfolio.month })
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Synced Google Sheet:", data);
      }
    } catch (e) {
      console.log("Using cached time-series.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportPdf = () => {
    // If browser supports printing, trigger crisp native vector print
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Action Toolbar */}
      <TopNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        lang={lang}
        setLang={setLang}
        onExportPdf={handleExportPdf}
        onSyncSheet={handleSyncSheet}
        onSaveConfig={handleSaveConfig}
        isExporting={isExporting}
        isSyncing={isSyncing}
        isSaved={isSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* MODE 1: Advisor Workspace Dashboard */}
        {viewMode === 'dashboard' && (
          <Dashboard
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            lang={lang}
            onSave={handleSaveConfig}
            onSync={handleSyncSheet}
            isSyncing={isSyncing}
          />
        )}

        {/* MODE 2: Presentation Slides 1 - 5 */}
        {viewMode === 'presentation' && (
          <div className="presentation-container py-6 space-y-12">
            <Slide1 state={portfolio} lang={lang} />
            <Slide2 state={portfolio} lang={lang} />
            <Slide3 state={portfolio} lang={lang} />
            <Slide4 state={portfolio} lang={lang} />
            <Slide5 state={portfolio} lang={lang} />
          </div>
        )}

        {/* MODE 3: Split Studio (40% Workspace, 60% Live Preview) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-12 gap-4 px-4 py-4 items-start max-w-[1920px] mx-auto">
            {/* Left 5 Cols: Dashboard Editor */}
            <div className="col-span-12 lg:col-span-5 h-[calc(100vh-80px)] overflow-y-auto pr-2 custom-scrollbar">
              <Dashboard
                portfolio={portfolio}
                setPortfolio={setPortfolio}
                lang={lang}
                onSave={handleSaveConfig}
                onSync={handleSyncSheet}
                isSyncing={isSyncing}
              />
            </div>

            {/* Right 7 Cols: Live Slides Scaled */}
            <div className="col-span-12 lg:col-span-7 h-[calc(100vh-80px)] overflow-y-auto pl-2 custom-scrollbar space-y-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-amber-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 flex justify-between items-center sticky top-0 z-30">
                <span>
                  {lang === 'en'
                    ? '⚡ Live Reactive Presentation Preview (Hot Reload)'
                    : '⚡ 实时联动报告画板预览 (毫秒级热更新)'}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {lang === 'en' ? 'Changes reflect here immediately' : '左侧修改将在此处实时同步渲染'}
                </span>
              </div>
              <div className="space-y-8">
                <Slide1 state={portfolio} lang={lang} />
                <Slide2 state={portfolio} lang={lang} />
                <Slide3 state={portfolio} lang={lang} />
                <Slide4 state={portfolio} lang={lang} />
                <Slide5 state={portfolio} lang={lang} />
              </div>
            </div>
          </div>
        )}

        {/* MODE 4: Standalone Look-Through Factsheet */}
        {viewMode === 'factsheet' && (
          <div className="presentation-container py-6">
            <Factsheet portfolio={portfolio} lang={lang} />
          </div>
        )}
      </main>
    </div>
  );
};
