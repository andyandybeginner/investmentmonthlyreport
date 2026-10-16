import React from 'react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';
import { FrontierChart } from '../charts/FrontierChart';

interface Slide3Props {
  state: PortfolioState;
  lang: Language;
}

export const Slide3: React.FC<Slide3Props> = ({ state, lang }) => {
  const t = getDictionary(lang);
  const isEn = lang === 'en';
  const topicTitle = isEn ? state.slide3_topic_title_en : state.slide3_topic_title_zh;

  return (
    <div
      id="slide3"
      className="landscape-slide relative bg-white w-[1400px] h-[990px] mx-auto my-6 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col justify-between shrink-0"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-3 border-b-2 border-amber-500 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
              {t.s3_tag}
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">{topicTitle}</h1>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9.5px] uppercase font-semibold">
              {isEn ? 'Research Focus' : '深度专题聚焦'}
            </span>
            <span className="text-amber-300 font-extrabold text-sm mono-num">
              {isEn ? 'iFAST Horizon Feature' : '奕丰投研专题精粹'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="px-7 py-4.5 grid grid-cols-12 gap-5 flex-1 items-stretch overflow-hidden min-h-0">
        {/* Left Column (5 Cols): Thematic Essay & Rationale */}
        <div className="col-span-5 h-full flex flex-col justify-between gap-3.5 overflow-hidden">
          {/* Block 1: Phenomenon & Macro Observation */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex-[1.1] flex flex-col justify-start overflow-hidden">
            <h3 className="text-xs font-bold text-[#0f2347] flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="font-extrabold text-[13px]">{t.s3_obs_title}</span>
              </div>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {isEn ? 'Empirical Shift' : '四十年范式位移'}
              </span>
            </h3>
            <p className="text-[11.5px] text-slate-700 leading-relaxed font-normal overflow-y-auto">
              {t.s3_obs_desc}
            </p>
            <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200/90 rounded-lg flex items-center justify-between text-[10.5px] text-slate-600 shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {isEn ? 'Core Mechanism' : '核心传导机制'}
              </span>
              <span className="font-bold text-[#0f2347]">
                {isEn ? 'Stock-Bond Correlation: Shifted from Negative to Positive' : '股债相关性：由历史上负相关转为显著正相关'}
              </span>
            </div>
          </div>

          {/* Block 2: Debate */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex-[0.95] flex flex-col justify-start overflow-hidden">
            <h3 className="text-xs font-bold text-[#0f2347] flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-extrabold text-[13px]">{t.s3_debate_title}</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {isEn ? 'Open Debate' : '机构争议焦点'}
              </span>
            </h3>
            <p className="text-[11.5px] text-slate-700 leading-relaxed font-normal overflow-y-auto">
              {t.s3_debate_desc}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 shrink-0">
              <div className="bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 flex items-center gap-1.5 text-[10px] text-slate-700">
                <span className="text-rose-500 font-bold">●</span>
                <span className="font-semibold">{isEn ? 'Sticky Inflation Anchor' : '持久性高通胀中枢'}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 flex items-center gap-1.5 text-[10px] text-slate-700">
                <span className="text-amber-500 font-bold">●</span>
                <span className="font-semibold">{isEn ? 'Fiscal Deficit Expansion' : '财政赤字与债务供给扩张'}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 flex items-center gap-1.5 text-[10px] text-slate-700">
                <span className="text-blue-500 font-bold">●</span>
                <span className="font-semibold">{isEn ? 'Mega Tech CapEx Issuance' : '科技巨头发债挤占资本池'}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 flex items-center gap-1.5 text-[10px] text-slate-700">
                <span className="text-purple-500 font-bold">●</span>
                <span className="font-semibold">{isEn ? 'Central Bank Independence' : '央行独立性与利率锚重估'}</span>
              </div>
            </div>
          </div>

          {/* Block 3: Asset Allocator Reflection */}
          <div className="bg-blue-50/40 border border-blue-200/90 rounded-xl p-4 shadow-xs flex-[1.25] flex flex-col justify-start overflow-hidden">
            <h3 className="text-xs font-bold text-blue-950 flex items-center justify-between mb-2 border-b border-blue-200 pb-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-extrabold text-[13px]">{t.s3_question_title}</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {isEn ? 'Strategic Takeaway' : '配置逻辑穿透'}
              </span>
            </h3>
            <p className="text-[11.5px] text-slate-700 leading-relaxed font-normal overflow-y-auto">
              {t.s3_question_desc}
            </p>
            <div className="mt-2.5 p-3 bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white rounded-xl shadow-xs border border-blue-800 flex items-start gap-2.5 shrink-0">
              <div className="shrink-0 mt-0.5">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
                  {isEn ? 'Core Verdict' : '配置定见'}
                </span>
              </div>
              <p className="text-[11px] text-slate-100 font-medium leading-relaxed">
                {isEn
                  ? 'Firmly establish the mathematical foundation: Pure Equity Growth Engine (MSCI World Benchmark) + Multi-Commodity Gold Hedge, rejecting mediocre return-dragging fixed income.'
                  : '坚定确立“纯股票全权益增长引擎（以 MSCI 全球指数为基准）+ 黄金多元大宗对冲”而非配置平庸债券的数理基石。'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Vector Frontier Chart & NYU Stern Citation */}
        <div className="col-span-7 h-full bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div>
                <h3 className="text-sm font-extrabold text-[#0f2347] tracking-tight">{t.s3_chart_title}</h3>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                  {isEn ? 'Asset Allocation Risk & Return Frontier Contrast: 1986-2020 vs 2021-2025' : '股债组合风险-收益特征前沿对比：历史经典期 vs 当代新常态'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {isEn ? 'NYU Stern / Aswath Damodaran' : '纽约大学斯特恩商学院'}
              </span>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] py-1.5 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-blue-900 rounded-full inline-block"></span>
                  <span className="font-bold text-blue-950">{t.s3_lg_2020}</span>
                  <span className="text-[9.5px] text-slate-400 font-medium">({isEn ? 'Negative Correlation Era' : '传统负相关减震'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-rose-600 rounded-full inline-block"></span>
                  <span className="font-bold text-rose-700">{t.s3_lg_2025}</span>
                  <span className="text-[9.5px] text-slate-400 font-medium">({isEn ? 'Positive Correlation Regime' : '正相关范式转变'})</span>
                </div>
              </div>
              <span className="text-[9.5px] text-slate-400 italic">
                {isEn ? 'Geometric Annualized Return' : '几何年化回报率'}
              </span>
            </div>
          </div>

          {/* Frontier Vector SVG Chart */}
          <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden">
            <FrontierChart lang={lang} width={740} height={480} />
          </div>

          {/* Academic Source Citation Footnote */}
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-[10px] text-slate-500 leading-relaxed mt-2 shrink-0 flex items-start gap-2">
            <span className="text-blue-600 font-bold text-xs mt-0.5">ℹ</span>
            <span>{t.s3_footer_source}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span>{t.s1_foot_left}</span>
        <span className="font-semibold text-slate-700">{t.s3_foot_right}</span>
      </div>
    </div>
  );
};
