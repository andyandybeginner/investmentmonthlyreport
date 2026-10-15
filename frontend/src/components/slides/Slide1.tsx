import React from 'react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';
import { PerformanceChart } from '../charts/PerformanceChart';
import { sliceTimeSeriesByReportMonth, getMonthDisplay } from '../../utils/performance';

interface Slide1Props {
  state: PortfolioState;
  lang: Language;
}

export const Slide1: React.FC<Slide1Props> = ({ state, lang }) => {
  const t = getDictionary(lang);
  const isEn = lang === 'en';

  const qualitativeView = isEn ? state.qualitative_view_en : state.qualitative_view;

  // Dynamic Time Series Slicing & Metric Calculation
  const monthInfo = getMonthDisplay(state.month, lang);
  const {
    sliced,
    periodsCount,
    startDate,
    endDate,
    matrix,
    cumCurrent,
    cumPast,
    cumSp500,
    cumMsci
  } = sliceTimeSeriesByReportMonth(state.month, state.settle_date, state.time_series);

  const formatCell = (val: number, isAlpha = false) => {
    const sign = val > 0 ? '+' : '';
    let color = 'text-slate-600';
    if (isAlpha) {
      color = val >= 0 ? 'text-emerald-800 font-bold' : 'text-rose-700 font-bold';
    } else {
      color = val > 0 ? 'text-emerald-700 font-bold' : val < 0 ? 'text-rose-600 font-semibold' : 'text-slate-600';
    }
    return <span className={`${color} mono-num`}>{sign}{val.toFixed(2)}%</span>;
  };

  return (
    <div
      id="slide1"
      className="landscape-slide relative bg-white w-[1400px] h-[990px] mx-auto my-6 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col justify-between shrink-0"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-3 border-b-2 border-amber-500 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
              {t.s1_badge}
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">{monthInfo.memoTitle}</h1>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9.5px] uppercase font-semibold">
              {t.s1_calc_label}
            </span>
            <span className="text-amber-300 font-extrabold text-sm mono-num">
              {isEn ? state.valuation_date_en : state.valuation_date_zh}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-4 overflow-hidden">
        {/* Table 1: Multi-Period Return Matrix (100% Dynamically Computed) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="text-xs font-bold text-[#0f2347] tracking-tight">{t.s1_table_title}</h3>
            <span className="text-[10px] text-slate-500 font-medium">{t.s1_base_cur}</span>
          </div>
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                  <th className="p-2">{t.s1_col_strategy}</th>
                  <th className="p-2 text-right">{monthInfo.colHeader1m}</th>
                  <th className="p-2 text-right">{t.s1_col_3m}</th>
                  <th className="p-2 text-right">{t.s1_col_1y}</th>
                  <th className="p-2 text-right">{t.s1_col_3y}</th>
                  <th className="p-2 text-right pr-3 font-extrabold text-[#0f2347]">{t.s1_col_cum}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                {/* Row 1: Current Portfolio */}
                <tr className="bg-amber-50/40 font-bold hover:bg-amber-50/70 transition">
                  <td className="p-1.5 pl-2.5 text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span>{t.s1_row_current}</span>
                  </td>
                  <td className="p-1.5 text-right">{formatCell(matrix.current.r1m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.current.r3m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.current.r1y)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.current.r3y)}</td>
                  <td className="p-1.5 text-right pr-3 text-red-600 font-extrabold mono-num">
                    +{cumCurrent.toFixed(1)}%
                  </td>
                </tr>
                {/* Row 2: Past Portfolio */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-1.5 pl-2.5 text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>{t.s1_row_past}</span>
                  </td>
                  <td className="p-1.5 text-right">{formatCell(matrix.past.r1m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.past.r3m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.past.r1y)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.past.r3y)}</td>
                  <td className="p-1.5 text-right pr-3 text-blue-700 font-bold mono-num">
                    +{cumPast.toFixed(1)}%
                  </td>
                </tr>
                {/* Row 3: MSCI ACWI */}
                <tr className="text-slate-600 hover:bg-slate-50 transition">
                  <td className="p-1.5 pl-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>{t.s1_row_acwi}</span>
                  </td>
                  <td className="p-1.5 text-right">{formatCell(matrix.msci.r1m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.msci.r3m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.msci.r1y)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.msci.r3y)}</td>
                  <td className="p-1.5 text-right pr-3 mono-num">+{cumMsci.toFixed(1)}%</td>
                </tr>
                {/* Row 4: S&P 500 */}
                <tr className="text-slate-600 hover:bg-slate-50 transition">
                  <td className="p-1.5 pl-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    <span>{t.s1_row_sp500}</span>
                  </td>
                  <td className="p-1.5 text-right">{formatCell(matrix.sp500.r1m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.sp500.r3m)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.sp500.r1y)}</td>
                  <td className="p-1.5 text-right">{formatCell(matrix.sp500.r3y)}</td>
                  <td className="p-1.5 text-right pr-3 mono-num">+{cumSp500.toFixed(1)}%</td>
                </tr>
                {/* Alpha Rows */}
                <tr className="bg-emerald-50/50 font-semibold text-emerald-800 border-t border-emerald-100">
                  <td className="p-1 pl-2.5">{t.s1_row_alpha_acwi}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_acwi.r1m, true)}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_acwi.r3m, true)}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_acwi.r1y, true)}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_acwi.r3y, true)}</td>
                  <td className="p-1 text-right pr-3 font-bold mono-num">
                    +{matrix.alpha_acwi.cum.toFixed(1)}%
                  </td>
                </tr>
                <tr className="bg-emerald-50/20 font-semibold text-emerald-800">
                  <td className="p-1 pl-2.5">{t.s1_row_alpha_sp}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_sp.r1m, true)}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_sp.r3m, true)}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_sp.r1y, true)}</td>
                  <td className="p-1 text-right">{formatCell(matrix.alpha_sp.r3y, true)}</td>
                  <td className="p-1 text-right pr-3 font-bold mono-num">
                    +{matrix.alpha_sp.cum.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Lower Grid: Chart (Left) + Fund Breakdown (Right) */}
        <div className="grid grid-cols-12 gap-4 flex-1 items-stretch overflow-hidden">
          {/* Left Col (5 Cols): Real Performance Vector SVG Chart */}
          <div className="col-span-5 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-[#0f2347]">
                  {monthInfo.chartTitle(periodsCount, startDate, endDate)}
                </h3>
                <span className="text-[9px] text-slate-400 font-mono">Inception = 100.0</span>
              </div>
              {/* Legend with Return Badges */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] py-1 border-b border-slate-100 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-red-600 shrink-0"></span>
                  <span className="text-slate-600 truncate">{t.lg_cur}</span>
                  <span className="font-mono text-slate-900 font-bold ml-auto">
                    +{cumCurrent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-blue-600 shrink-0"></span>
                  <span className="text-slate-600 truncate">{t.lg_past}</span>
                  <span className="font-mono text-slate-900 font-bold ml-auto">
                    +{cumPast.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400 shrink-0"></span>
                  <span className="text-slate-600 truncate">{t.lg_acwi}</span>
                  <span className="font-mono text-slate-900 font-bold ml-auto">
                    +{cumMsci.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-slate-900 shrink-0"></span>
                  <span className="text-slate-600 truncate">{t.lg_sp}</span>
                  <span className="font-mono text-slate-900 font-bold ml-auto">
                    +{cumSp500.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Pure Vector SVG Chart (Sliced to selected month) */}
            <div className="flex-1 w-full flex items-center justify-center min-h-[185px]">
              <PerformanceChart data={sliced} events={state.events} />
            </div>

            {/* Chart Sub-legend */}
            <div className="flex justify-between items-center text-[8.5px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-600 inline-block"></span>
                <span>{t.lg_restruct}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 border border-emerald-600 inline-block"></span>
                <span>{t.lg_rebal}</span>
              </span>
            </div>
          </div>

          {/* Right Col (7 Cols): Fund Breakdown & Manager Card */}
          <div className="col-span-7 flex flex-col justify-between gap-3 overflow-hidden">
            {/* Table 2: 7 Underlying Funds */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-[#0f2347]">{t.s1_table2_title}</h3>
                <span className="text-[9.5px] text-slate-400 font-mono">Unit: %</span>
              </div>
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[9.5px] uppercase font-bold border-b border-slate-200">
                      <th className="p-1.5 pl-2">{t.s1_th_role}</th>
                      <th className="p-1.5">{t.s1_th_fund}</th>
                      <th className="p-1.5 text-right">{t.s1_th_target_w}</th>
                      <th className="p-1.5 text-right font-bold text-slate-900 bg-amber-50/50">
                        {t.s1_th_actual_w}
                      </th>
                      <th className="p-1.5 text-right">{t.s1_th_ret_1m}</th>
                      <th className="p-1.5 text-right pr-2">{t.s1_th_contrib}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-[10.5px]">
                    {state.holdings.map((h) => {
                      const retColor =
                        h.return_1m >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-semibold';
                      const contribColor =
                        h.contrib_1m >= 0 ? 'text-emerald-800 font-bold' : 'text-rose-700 font-bold';

                      return (
                        <tr key={h.id} className="hover:bg-slate-50 transition">
                          <td className="p-1 pl-2 font-bold text-slate-800">
                            {isEn ? h.role_en : h.role}
                          </td>
                          <td className="p-1 font-semibold text-slate-800 truncate max-w-[210px]">
                            {h.fund_name}
                          </td>
                          <td className="p-1 text-right text-slate-600 mono-num">
                            {h.target_weight.toFixed(1)}%
                          </td>
                          <td className="p-1 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">
                            {h.current_weight.toFixed(2)}%
                          </td>
                          <td className={`p-1 text-right mono-num ${retColor}`}>
                            {h.return_1m >= 0 ? `+${h.return_1m.toFixed(2)}%` : `${h.return_1m.toFixed(2)}%`}
                          </td>
                          <td className={`p-1 text-right pr-2 mono-num ${contribColor}`}>
                            {h.contrib_1m >= 0 ? `+${h.contrib_1m.toFixed(2)}%` : `${h.contrib_1m.toFixed(2)}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Qualitative Commentary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{t.s1_card_title}</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {state.rebalance_verdict}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed overflow-hidden line-clamp-4">
                {qualitativeView}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span>{t.s1_foot_left}</span>
        <span className="font-mono text-slate-600 font-semibold">{t.s1_foot_right}</span>
      </div>
    </div>
  );
};
