import React from 'react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';

interface Slide4Props {
  state: PortfolioState;
  lang: Language;
}

export const Slide4: React.FC<Slide4Props> = ({ state, lang }) => {
  const t = getDictionary(lang);
  const isEn = lang === 'en';

  const rebalanceNote = isEn ? state.rebalance_note_en : state.rebalance_note;
  const activeHoldings = state.holdings.filter((h) => h.active !== false);

  const getActionBadge = (action: string) => {
    switch (action) {
      case '持有':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300">
            {isEn ? 'HOLD' : '持有'}
          </span>
        );
      case '调仓':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] bg-amber-100 text-amber-800 border border-amber-300">
            {isEn ? 'REBALANCE' : '调仓'}
          </span>
        );
      case '更换标的':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] bg-rose-100 text-rose-800 border border-rose-300">
            {isEn ? 'REPLACE' : '更换标的'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] bg-slate-100 text-slate-800 border border-slate-300">
            {action}
          </span>
        );
    }
  };

  return (
    <div
      id="slide4"
      className="landscape-slide relative bg-white w-[1400px] h-[990px] mx-auto my-6 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col justify-between shrink-0"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-3 border-b-2 border-amber-500 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
              {t.s4_tag}
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">{t.s4_title}</h1>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9.5px] uppercase font-semibold">
              Advisory Governance
            </span>
            <span className="text-amber-300 font-extrabold text-sm mono-num">
              Monthly Conviction Audit
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-4 overflow-hidden">
        {/* Top: 3 Core Pillars */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50/60 to-white border border-blue-200/80 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h4 className="text-xs font-bold text-blue-950">{t.s4_p1_title}</h4>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">{t.s4_p1_desc}</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-200/80 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h4 className="text-xs font-bold text-indigo-950">{t.s4_p2_title}</h4>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">{t.s4_p2_desc}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <h4 className="text-xs font-bold text-amber-950">{t.s4_p3_title}</h4>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">{t.s4_p3_desc}</p>
          </div>
        </div>

        {/* Bottom: Dynamic Conviction Matrix Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-100 pb-1">
            <h3 className="text-xs font-bold text-[#0f2347]">
              {isEn ? `${state.month} Holdings Conviction Matrix` : `${state.month} 信念审查决策矩阵`}
            </h3>
            <span className="text-[9.5px] text-slate-400 font-medium">
              {activeHoldings.length} {isEn ? 'Selected Holdings' : '只优选标的全景复核'}
            </span>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                  <th className="p-2 w-48">{t.s4_th_fund}</th>
                  <th className="p-2 w-24">{t.s4_th_role}</th>
                  <th className="p-2 text-right w-20">{t.s4_th_weight}</th>
                  <th className="p-2 text-right w-20">{t.s4_th_ret}</th>
                  <th className="p-2">{t.s4_th_noise}</th>
                  <th className="p-2">{t.s4_th_support}</th>
                  <th className="p-2 text-center w-24">{t.s4_th_action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-[10.5px]">
                {activeHoldings.map((h) => {
                  const retColor =
                    h.return_1m >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-semibold';
                  const noise = isEn ? h.market_noise_en : h.market_noise;
                  const support = isEn ? h.fundamental_support_en : h.fundamental_support;

                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="p-1.5 font-bold text-slate-900 truncate max-w-[190px]">
                        {h.fund_name}
                      </td>
                      <td className="p-1.5 text-slate-700 font-semibold">
                        {isEn ? h.role_en : h.role}
                      </td>
                      <td className="p-1.5 text-right font-mono font-bold text-[#0f2347]">
                        {h.current_weight.toFixed(2)}%
                      </td>
                      <td className={`p-1.5 text-right mono-num ${retColor}`}>
                        {h.return_1m >= 0 ? `+${h.return_1m.toFixed(2)}%` : `${h.return_1m.toFixed(2)}%`}
                      </td>
                      <td className="p-1.5 text-slate-500 text-[10px] leading-tight max-w-[200px]">
                        {noise}
                      </td>
                      <td className="p-1.5 text-slate-700 text-[10px] leading-tight font-medium max-w-[240px]">
                        {support}
                      </td>
                      <td className="p-1.5 text-center">{getActionBadge(h.recommendation)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rebalance Verdict Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-1.5 text-xs text-blue-950 flex justify-between items-center mt-2">
            <span className="font-bold text-[#0f2347]">
              {isEn ? 'Monthly Rebalancing Verdict:' : '月度调仓结论：'}
            </span>
            <span className="text-[11.5px] text-slate-700">{rebalanceNote}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span>{t.s4_foot_left}</span>
        <span className="font-semibold text-slate-700">{t.s4_foot_right}</span>
      </div>
    </div>
  );
};
