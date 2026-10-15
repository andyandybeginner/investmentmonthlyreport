import React from 'react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';

interface Slide5Props {
  state: PortfolioState;
  lang: Language;
}

export const Slide5: React.FC<Slide5Props> = ({ lang }) => {
  const t = getDictionary(lang);

  return (
    <div
      id="slide5"
      className="landscape-slide relative bg-white w-[1400px] h-[990px] mx-auto my-6 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col justify-between shrink-0"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-3 border-b-2 border-amber-500 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
              {t.s5_tag}
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">{t.s5_title}</h1>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9.5px] uppercase font-semibold">
              Legal & Compliance
            </span>
            <span className="text-amber-300 font-extrabold text-sm mono-num">MAS SFA 289</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Legal Disclosures */}
      <div className="p-8 flex-1 grid grid-cols-3 gap-6 items-stretch overflow-hidden">
        {/* Column 1: Advisory Nature */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h3 className="text-xs font-bold text-[#0f2347]">{t.s5_c1_title}</h3>
            </div>
            <div className="space-y-2 text-[10.5px] text-slate-600 leading-relaxed">
              <p>{t.s5_c1_p1}</p>
              <p>{t.s5_c1_p2}</p>
              <p>{t.s5_c1_p3}</p>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-400 font-mono">
            MAS SFA 289 Sec. 25 & 26
          </div>
        </div>

        {/* Column 2: Risk Disclosures */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <h3 className="text-xs font-bold text-[#0f2347]">{t.s5_c2_title}</h3>
            </div>
            <div className="space-y-2 text-[10.5px] text-slate-600 leading-relaxed">
              <p>{t.s5_c2_p1}</p>
              <p>{t.s5_c2_p2}</p>
              <p>{t.s5_c2_p3}</p>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-400 font-mono">
            Capital at Risk Notice
          </div>
        </div>

        {/* Column 3: Regulatory Jurisdiction */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <h3 className="text-xs font-bold text-[#0f2347]">{t.s5_c3_title}</h3>
            </div>
            <div className="space-y-2 text-[10.5px] text-slate-600 leading-relaxed">
              <p>{t.s5_c3_p1}</p>
              <p>{t.s5_c3_p2}</p>
              <p>{t.s5_c3_p3}</p>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-400 font-mono">
            Republic of Singapore SFA (Cap. 289)
          </div>
        </div>
      </div>

      {/* Compliance Stamp Bar */}
      <div className="mx-8 mb-4 p-3 bg-gradient-to-r from-slate-100 to-blue-50/50 border border-slate-200 rounded-xl flex justify-between items-center text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{t.s5_stamp_jurisdiction}</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
          {t.s5_stamp_confidential}
        </span>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span>{t.s5_foot_left}</span>
        <span className="font-semibold text-slate-700">{t.s5_foot_right}</span>
      </div>
    </div>
  );
};
