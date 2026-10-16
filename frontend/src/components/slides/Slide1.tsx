import React from 'react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';
import { PerformanceChart } from '../charts/PerformanceChart';
import { sliceTimeSeriesByReportMonth, getMonthDisplay, MONTH_PRESETS } from '../../utils/performance';

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

  const presetHoldings = (MONTH_PRESETS[state.month] || MONTH_PRESETS['2026-09']).holdings_returns;

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

      {/* Main Content Body: Left 7 Cols (Multi-Period Matrix + 7 Underlying Funds) | Right 5 Cols (Vector Chart + Verdict Card) */}
      <div className="px-7 py-4.5 grid grid-cols-12 gap-5 flex-1 items-stretch overflow-hidden min-h-0">
        {/* Left Column (7 Cols): Drawer 1 (Multi-Period Matrix) + Drawer 2 (7 Underlying Funds Table) */}
        <div className="col-span-7 h-full flex flex-col gap-4 overflow-hidden min-h-0">
          {/* Drawer 1: Multi-Period Return Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                {t.s1_table_title}
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{t.s1_base_cur}</span>
            </div>
            <div className="overflow-hidden border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0f2347] text-white text-[11px] font-bold">
                    <th className="py-2.5 px-2">{t.s1_col_strategy}</th>
                    <th className="py-2.5 px-2 text-right">{monthInfo.colHeader1m}</th>
                    <th className="py-2.5 px-2 text-right">{t.s1_col_3m}</th>
                    <th className="py-2.5 px-2 text-right">{t.s1_col_1y}</th>
                    <th className="py-2.5 px-2 text-right">{t.s1_col_3y}</th>
                    <th className="py-2.5 px-2 text-right pr-3 font-extrabold bg-[#091528]">{t.s1_col_cum}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-[12px]">
                  {/* Row 1: Current Portfolio */}
                  <tr className="bg-amber-50/70 font-bold">
                    <td className="py-2 px-2 text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
                      <span>{t.s1_row_current}</span>
                    </td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.current.r1m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.current.r3m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.current.r1y)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.current.r3y)}</td>
                    <td className="py-2 px-2 text-right pr-3 text-[#0f2347] bg-amber-100/80 font-extrabold mono-num">
                      +{cumCurrent.toFixed(2)}%
                    </td>
                  </tr>
                  {/* Row 2: Past Portfolio */}
                  <tr className="hover:bg-slate-50 transition text-slate-700">
                    <td className="py-2 px-2 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                      <span>{t.s1_row_past}</span>
                    </td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.past.r1m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.past.r3m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.past.r1y)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.past.r3y)}</td>
                    <td className="py-2 px-2 text-right pr-3 text-slate-700 bg-slate-50 font-bold mono-num">
                      +{cumPast.toFixed(2)}%
                    </td>
                  </tr>
                  {/* Row 3: S&P 500 */}
                  <tr className="text-slate-600 hover:bg-slate-50 transition">
                    <td className="py-2 px-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                      <span>{t.s1_row_sp500}</span>
                    </td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.sp500.r1m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.sp500.r3m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.sp500.r1y)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.sp500.r3y)}</td>
                    <td className="py-2 px-2 text-right pr-3 font-semibold bg-slate-50 mono-num">
                      +{cumSp500.toFixed(2)}%
                    </td>
                  </tr>
                  {/* Row 4: MSCI ACWI */}
                  <tr className="text-slate-600 hover:bg-slate-50 transition">
                    <td className="py-2 px-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>{t.s1_row_acwi}</span>
                    </td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.msci.r1m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.msci.r3m)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.msci.r1y)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.msci.r3y)}</td>
                    <td className="py-2 px-2 text-right pr-3 font-semibold bg-slate-50 mono-num">
                      +{cumMsci.toFixed(2)}%
                    </td>
                  </tr>
                  {/* Row 5: Alpha vs MSCI ACWI */}
                  <tr className="bg-emerald-50/80 font-bold border-t-2 border-emerald-200 text-emerald-900">
                    <td className="py-2 px-2 pl-2 flex items-center gap-1.5">
                      <span>{t.s1_row_alpha_acwi}</span>
                    </td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.alpha_acwi.r1m, true)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.alpha_acwi.r3m, true)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.alpha_acwi.r1y, true)}</td>
                    <td className="py-2 px-2 text-right">{formatCell(matrix.alpha_acwi.r3y, true)}</td>
                    <td className="py-2 px-2 text-right pr-3 font-extrabold bg-emerald-100/90 mono-num text-emerald-950">
                      +{matrix.alpha_acwi.cum.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Drawer 2: 7 Underlying Funds Table (Objective Weights, NAV, 1M Return & Contribution) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex-1 min-h-0 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2 shrink-0">
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                {isEn
                  ? `${state.holdings.length} Underlying Core Funds: Monthly Performance & Alpha Contribution`
                  : `底层 ${state.holdings.length} 只优选基金构成与月度行情穿透`}
              </h3>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {isEn
                  ? `Total Target Weight: ${state.holdings.reduce((sum, h) => sum + (h.target_weight || 0), 0).toFixed(1)}%`
                  : `权重加总: ${state.holdings.reduce((sum, h) => sum + (h.target_weight || 0), 0).toFixed(1)}%`}
              </span>
            </div>
            <div className="overflow-hidden border border-slate-200 rounded-lg flex-1 min-h-0 flex flex-col">
              <table className="w-full h-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200 shrink-0">
                  <tr>
                    <th className="py-2.5 px-2 pl-2.5">{t.s1_th_role}</th>
                    <th className="py-2.5 px-2">{t.s1_th_fund}</th>
                    <th className="py-2.5 px-2 text-right font-bold text-slate-600">{t.s1_th_target_w}</th>
                    <th className="py-2.5 px-2 text-right font-extrabold text-[#0f2347] bg-amber-100/60 border-l border-r border-amber-200">
                      {t.s1_th_actual_w}
                    </th>
                    <th className="py-2.5 px-2 text-right">{isEn ? 'Latest NAV' : '最新净值'}</th>
                    <th className="py-2.5 px-2 text-right">{t.s1_th_ret_1m}</th>
                    <th className="py-2.5 px-2 text-right pr-2.5">{t.s1_th_contrib}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-[11.5px]">
                  {state.holdings.map((h) => {
                    const fallback = presetHoldings[h.id];
                    const tgtW = h.target_weight ?? fallback?.target_weight ?? 0;
                    const curW = h.current_weight ?? fallback?.current_weight ?? tgtW;
                    const navVal = h.nav || fallback?.nav || '—';
                    const ret1m = h.return_1m ?? fallback?.return_1m ?? 0;
                    const contrib1m = h.contrib_1m ?? fallback?.contrib_1m ?? ((ret1m * curW) / 100);

                    const retColor =
                      ret1m >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-semibold';
                    const contribColor =
                      contrib1m >= 0 ? 'text-emerald-800 font-bold' : 'text-rose-700 font-bold';

                    return (
                      <tr key={h.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                        <td className="px-2 py-2 pl-2.5 font-bold text-slate-800 whitespace-nowrap align-middle">
                          {isEn ? h.role_en : h.role}
                        </td>
                        <td className="px-2 py-2 font-semibold text-slate-800 truncate max-w-[205px] align-middle">
                          {h.fund_name}
                        </td>
                        <td className="px-2 py-2 text-right font-semibold text-slate-600 mono-num align-middle">
                          {tgtW.toFixed(2)}%
                        </td>
                        <td className="px-2 py-2 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100 align-middle">
                          {curW.toFixed(2)}%
                        </td>
                        <td className="px-2 py-2 text-right text-slate-700 mono-num align-middle">{navVal}</td>
                        <td className={`px-2 py-2 text-right mono-num align-middle ${retColor}`}>
                          {ret1m >= 0 ? `+${ret1m.toFixed(2)}%` : `${ret1m.toFixed(2)}%`}
                        </td>
                        <td className={`px-2 py-2 pr-2.5 text-right mono-num align-middle ${contribColor}`}>
                          {contrib1m >= 0 ? `+${contrib1m.toFixed(2)}%` : `${contrib1m.toFixed(2)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Drawer 3 (Real NAV Vector Chart) + Drawer 4 (Monthly Verdict & Qualitative View) */}
        <div className="col-span-5 h-full flex flex-col gap-4 overflow-hidden min-h-0">
          {/* Drawer 3: Real Performance Vector SVG Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-xs shrink-0 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                {monthInfo.chartTitle(periodsCount, startDate, endDate)}
              </h3>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300 shadow-xs mono-num">
                {isEn ? `Alpha +${matrix.alpha_acwi.cum.toFixed(2)}%` : `超额收益 +${matrix.alpha_acwi.cum.toFixed(2)}%`}
              </span>
            </div>

            {/* Pure Vector SVG Chart (Sliced to selected month) */}
            <div className="w-full flex items-center justify-center h-[260px] bg-white rounded-lg border border-slate-200/80 p-1.5 my-1">
              <PerformanceChart data={sliced} events={state.events} lang={lang} />
            </div>

            {/* Legend matching exact 4 curves */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-semibold text-slate-700 border-t border-slate-200 pt-2 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-600 shrink-0"></span>
                <span className="truncate">{t.lg_cur}</span>
                <span className="font-mono text-slate-900 font-bold ml-auto">
                  +{cumCurrent.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-blue-600 shrink-0"></span>
                <span className="truncate">{t.lg_past}</span>
                <span className="font-mono text-slate-900 font-bold ml-auto">
                  +{cumPast.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-400 shrink-0"></span>
                <span className="truncate">{t.lg_acwi}</span>
                <span className="font-mono text-slate-900 font-bold ml-auto">
                  +{cumMsci.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-900 shrink-0"></span>
                <span className="truncate">{t.lg_sp}</span>
                <span className="font-mono text-slate-900 font-bold ml-auto">
                  +{cumSp500.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Chart Sub-legend */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/70 mt-1.5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60 border border-amber-500 inline-block"></span>
                <span>{t.lg_restruct}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60 border border-emerald-500 inline-block"></span>
                <span>{t.lg_rebal}</span>
              </span>
            </div>
          </div>

          {/* Drawer 4: Qualitative Commentary & Monthly Rebalancing Verdict Card */}
          <div className="bg-gradient-to-br from-[#0f2347] via-[#132c57] to-[#1a3a6e] text-white rounded-xl p-4 shadow-md flex-1 min-h-0 flex flex-col justify-between border border-blue-900">
            <div>
              <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-white/15">
                <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{t.s1_card_title}</span>
                </span>
                <span className="text-xs text-slate-950 font-black bg-amber-400 px-3 py-0.5 rounded shadow-xs">
                  {isEn
                    ? state.rebalance_verdict === '持有'
                      ? 'HOLD'
                      : state.rebalance_verdict === '调仓'
                      ? 'REBALANCE'
                      : state.rebalance_verdict === '更换标的'
                      ? 'REPLACE'
                      : state.rebalance_verdict
                    : state.rebalance_verdict}
                </span>
              </div>
              <p className="text-[12px] text-slate-100 leading-relaxed font-medium">
                {qualitativeView}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/15 flex justify-between items-center text-[10.5px] text-amber-200/90">
              <span className="font-bold">{isEn ? 'Monthly Execution Directive:' : '月度执行指令：'}</span>
              <span className="text-slate-200 truncate max-w-[340px]">
                {isEn ? state.rebalance_note_en : state.rebalance_note}
              </span>
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
