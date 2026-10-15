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
              Research Focus
            </span>
            <span className="text-amber-300 font-extrabold text-sm mono-num">iFAST Horizon Feature</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="p-6 flex-1 grid grid-cols-12 gap-6 items-stretch overflow-hidden">
        {/* Left Column (5 Cols): Thematic Essay & Rationale */}
        <div className="col-span-5 flex flex-col justify-between gap-3 overflow-hidden">
          {/* Block 1: Phenomenon & Macro Observation */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex-1 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[#0f2347] flex items-center gap-1.5 mb-1.5 border-b border-slate-100 pb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>{t.s3_obs_title}</span>
            </h3>
            <p className="text-[10px] text-slate-600 leading-relaxed overflow-y-auto">
              {t.s3_obs_desc}
            </p>
          </div>

          {/* Block 2: Debate */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex-1 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[#0f2347] flex items-center gap-1.5 mb-1.5 border-b border-slate-100 pb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{t.s3_debate_title}</span>
            </h3>
            <p className="text-[10px] text-slate-600 leading-relaxed overflow-y-auto">
              {t.s3_debate_desc}
            </p>
          </div>

          {/* Block 3: Asset Allocator Reflection */}
          <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-3.5 shadow-xs flex-1 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-blue-950 flex items-center gap-1.5 mb-1.5 border-b border-blue-200 pb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t.s3_question_title}</span>
            </h3>
            <p className="text-[10px] text-slate-700 leading-relaxed font-medium overflow-y-auto">
              {t.s3_question_desc}
            </p>
          </div>
        </div>

        {/* Right Column (7 Cols): Vector Frontier Chart & NYU Stern Citation */}
        <div className="col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-bold text-[#0f2347]">{t.s3_chart_title}</h3>
              <span className="text-[9.5px] text-slate-400 font-mono">NYU Stern / Damodaran</span>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-6 text-[10px] py-1 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-900"></span>
                <span className="font-semibold text-blue-950">{t.s3_lg_2020}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-600"></span>
                <span className="font-semibold text-rose-700">{t.s3_lg_2025}</span>
              </div>
            </div>
          </div>

          {/* Frontier Vector SVG Chart */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
            <FrontierChart lang={lang} width={620} height={310} />
          </div>

          {/* Academic Source Citation Footnote */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[9px] text-slate-500 leading-normal mt-2">
            {t.s3_footer_source}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span>{t.s3_foot_right}</span>
        <span className="font-semibold text-slate-700">{t.s3_foot_right}</span>
      </div>
    </div>
  );
};
