// ==============================================================================
// Strongly Typed Domain Models for Institutional Advisory Presentation Suite
// ==============================================================================

export type RecommendationType = '持有' | '调仓' | '更换标的';

export interface FundHolding {
  id: string;
  fund_name: string;
  role: string;
  role_en: string;
  target_weight: number;      // e.g. 35.0
  current_weight: number;     // e.g. 35.09
  return_1m: number;          // e.g. 0.21
  contrib_1m: number;         // e.g. 0.07
  active: boolean;
  market_noise: string;
  market_noise_en: string;
  fundamental_support: string;
  fundamental_support_en: string;
  recommendation: RecommendationType;
  // Look-through specifics
  sharpe_3y?: string;
  vol_3y?: string;
  role_desc_zh?: string;
  role_desc_en?: string;
}

export interface PerformanceEvent {
  date: string;
  fullDate?: string;
  status: string;
  type: 'rebalance' | 'restructure';
}

export interface TimeSeriesPoint {
  date: string;        // "2023-07"
  current: number;     // 1.0, 1.8116
  past: number;        // 1.0, 1.8908
  sp500: number;       // 1.0, 1.7146
  msci: number;        // 1.0, 1.6867
  event?: PerformanceEvent;
}

export interface LookThroughHolding {
  rank: number;
  name: string;
  name_en?: string;
  weight: number;      // percentage, e.g. 3.45
  country: string;
  country_en?: string;
  sector: string;
  sector_en?: string;
  sources: string[];
}

export interface AllocationItem {
  name: string;
  name_en?: string;
  weight: number;      // percentage, e.g. 46.06
  flag?: string;
  sub?: string;
  sub_en?: string;
}

export interface LookThroughData {
  top10_concentration: number;
  max_single_stock: number;
  geography: AllocationItem[];
  sectors: AllocationItem[];
  top_holdings: LookThroughHolding[];
}

export interface StarRatingItem {
  id: string;
  name_zh: string;
  name_en: string;
  stars: string;       // e.g. "★★★★½"
  tier: 1 | 2 | 3 | 4; // 1: Very Attractive, 2: Attractive, 3: Neutral, 4: Not Attractive
}

export interface PortfolioState {
  month: string;                     // "2026-09"
  settle_date: string;               // "2026-10-05"
  valuation_date_zh: string;
  valuation_date_en: string;
  aum: number;
  
  // Performance Cumulative
  cum_current: number;               // 81.16
  cum_past: number;                  // 89.08
  cum_sp500: number;                 // 71.46
  cum_msci: number;                  // 68.67
  alpha_vs_msci: number;             // 12.49

  // Monthly 1M
  monthly_return_1m: number;         // -1.21
  monthly_alpha_1m: number;          // -1.18

  // Manager Views
  qualitative_view: string;
  qualitative_view_en: string;
  rebalance_verdict: string;         // "持有"
  rebalance_note: string;
  rebalance_note_en: string;
  conflict_note: string;
  conflict_note_en: string;

  // Topic Slide 3
  slide3_topic_title_zh: string;
  slide3_topic_title_en: string;

  // Matched Reference Update Pages
  ref_pdf_name: string;
  page_returns: number;
  page_stars: number;

  // Datasets
  holdings: FundHolding[];
  time_series: TimeSeriesPoint[];
  events: PerformanceEvent[];
  lookthrough: LookThroughData;
}

export type Language = 'zh' | 'en';
export type ViewMode = 'dashboard' | 'presentation' | 'split' | 'factsheet';
