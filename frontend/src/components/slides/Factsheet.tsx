import React from 'react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';
import { getMonthDisplay } from '../../utils/performance';
import { Shield, TrendingUp, Layers, Globe } from 'lucide-react';

interface FactsheetProps {
  portfolio: PortfolioState;
  lang: Language;
}

export const Factsheet: React.FC<FactsheetProps> = ({ portfolio, lang }) => {
  const t = getDictionary(lang);
  const lookthrough = portfolio.lookthrough;
  const monthInfo = getMonthDisplay(portfolio.month, lang);

  // Split top 10 holdings into 1-5 and 6-10
  const top10 = lookthrough.top_holdings || [];
  const top1to5 = top10.slice(0, 5);
  const top6to10 = top10.slice(5, 10);

  // Month tag text
  const monthTag = monthInfo.monthTag;
  const valuationDate = lang === 'en' ? portfolio.valuation_date_en : portfolio.valuation_date_zh;

  return (
    <div id="factsheet" className="landscape-slide relative flex flex-col justify-between bg-white text-slate-800">
      {/* Slide Header */}
      <div className="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-2 border-b-2 border-amber-500 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
              {t.fs_header_tag}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-extrabold tracking-tight text-white">{t.fs_header_title}</h1>
            <span className="text-amber-400 font-bold text-[11px] bg-slate-900/80 px-2.5 py-0.5 rounded border border-amber-500/50">
              {monthTag}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9px] uppercase font-semibold">{t.fs_benchmark_label}</span>
            <span className="text-amber-300 font-extrabold text-xs mono-num">{valuationDate}</span>
          </div>
        </div>
      </div>

      {/* Top KPI Banner: 4 Portfolio-Level Core Metrics */}
      <div className="px-7 py-1.5 bg-slate-100/90 border-b border-slate-200 grid grid-cols-4 gap-3 shrink-0">
        {/* Metric 1: Annualised Volatility */}
        <div className="bg-white border border-slate-200/90 rounded-lg px-3 py-1 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-500 font-semibold block uppercase leading-tight">
              {t.fs_metric_vol}
            </span>
            <div className="flex items-baseline gap-1.5 leading-none mt-0.5">
              <span className="text-sm font-extrabold text-[#0f2347] mono-num">13.42%</span>
              <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                {t.fs_metric_vol_sub}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Sharpe Ratio */}
        <div className="bg-white border border-slate-200/90 rounded-lg px-3 py-1 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-500 font-semibold block uppercase leading-tight">
              {t.fs_metric_sharpe}
            </span>
            <div className="flex items-baseline gap-1.5 leading-none mt-0.5">
              <span className="text-sm font-extrabold text-amber-700 mono-num">1.35 ~ 1.41</span>
              <span className="text-[9px] text-amber-800 font-bold bg-amber-50 px-1 rounded">
                {t.fs_metric_sharpe_sub}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Top 10 Concentration */}
        <div className="bg-white border border-slate-200/90 rounded-lg px-3 py-1 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-500 font-semibold block uppercase leading-tight">
              {t.fs_metric_conc}
            </span>
            <div className="flex items-baseline gap-1.5 leading-none mt-0.5">
              <span className="text-sm font-extrabold text-blue-800 mono-num">
                {lookthrough.top10_concentration.toFixed(2)}%
              </span>
              <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1 rounded">
                {t.fs_metric_conc_sub} {lookthrough.max_single_stock.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Effective Securities Count */}
        <div className="bg-white border border-slate-200/90 rounded-lg px-3 py-1 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div>
            <span className="text-[9.5px] text-slate-500 font-semibold block uppercase leading-tight">
              {t.fs_metric_sec}
            </span>
            <div className="flex items-baseline gap-1.5 leading-none mt-0.5">
              <span className="text-sm font-extrabold text-purple-900 mono-num">
                {lang === 'en' ? '380+ Names' : '380+ 只'}
              </span>
              <span className="text-[9px] text-purple-800 font-bold bg-purple-50 px-1 rounded">
                {t.fs_metric_sec_sub}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: 3 Columns Layout (Col 1: Geo | Col 2: Sector | Col 3: Top 10 Holdings & Fund Matrix) */}
      <div className="px-7 py-2 grid grid-cols-12 gap-3.5 flex-1 items-stretch overflow-hidden">
        
        {/* Column 1 (3 Cols): Geographical Allocation */}
        <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
            <h4 className="text-[11.5px] font-extrabold uppercase tracking-tight text-[#0f2347] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>{t.fs_geo_title}</span>
            </h4>
            <span className="text-[9px] text-slate-400 font-semibold">
              {lang === 'en' ? 'Weighted Look-Through' : '加权穿透'}
            </span>
          </div>

          <div className="space-y-1 text-[10px] flex-1 flex flex-col justify-around">
            {lookthrough.geography.map((item, idx) => {
              const name = lang === 'en' ? (item.name_en || item.name) : item.name;
              return (
                <div key={idx}>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      {item.flag && <span>{item.flag}</span>}
                      <span>{name}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 mono-num">
                      {item.weight.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-0.5">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.weight * 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2 (3 Cols): Sector Allocation & Strategy Tag */}
        <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
            <h4 className="text-[11.5px] font-extrabold uppercase tracking-tight text-[#0f2347] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{t.fs_sec_title}</span>
            </h4>
            <span className="text-[9px] text-slate-400 font-semibold">
              {lang === 'en' ? 'GICS Look-Through' : '全球行业分类分布'}
            </span>
          </div>

          <div className="space-y-1 text-[10px] flex-1 flex flex-col justify-around">
            {lookthrough.sectors.map((item, idx) => {
              const name = lang === 'en' ? (item.name_en || item.name) : item.name;
              const sub = lang === 'en' ? (item.sub_en || item.sub) : item.sub;
              return (
                <div key={idx}>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span className="font-bold text-slate-800">{name}</span>
                    <span className="font-mono font-bold text-slate-800 mono-num">
                      {item.weight.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-0.5">
                    <div
                      className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.weight * 2.5)}%` }}
                    />
                  </div>
                  {sub && (
                    <span className="text-[8.5px] text-slate-400 block leading-tight mt-0.5">
                      {sub}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strategy Pillar Summary Box */}
          <div className="mt-1 bg-amber-50/70 border border-amber-200/80 rounded-lg p-1.5 text-[9.5px] text-amber-950">
            <span className="font-bold text-[#0f2347] block mb-0.5">{t.fs_pillar_title}</span>
            <span className="text-slate-600 leading-tight block">{t.fs_pillar_desc}</span>
          </div>
        </div>

        {/* Column 3 (6 Cols): Top 10 Holdings Table + Fund Risk & Feature Matrix */}
        <div className="col-span-6 flex flex-col justify-between space-y-2 overflow-hidden">
          
          {/* 1. Top 10 Holdings Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
              <h4 className="text-[11.5px] font-extrabold uppercase tracking-tight text-[#0f2347] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>{t.fs_top10_title}</span>
              </h4>
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                {t.fs_top10_badge}: {lookthrough.top10_concentration.toFixed(2)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 overflow-hidden">
              {/* Left Sub-table: Rank 1 - 5 */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-[#0f2347] text-white text-[9px] uppercase font-bold">
                    <th className="py-1 px-1 text-center w-5">{t.fs_th_rank}</th>
                    <th className="py-1 px-1">{t.fs_th_holding} (1-5)</th>
                    <th className="py-1 px-1 text-right font-bold w-11">{t.fs_th_weight}</th>
                    <th className="py-1 px-1 text-slate-300">{t.fs_th_overlap}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-[9px] leading-tight">
                  {top1to5.map((h) => {
                    const name = lang === 'en' ? (h.name_en || h.name) : h.name;
                    return (
                      <tr key={h.rank} className="hover:bg-slate-50 transition">
                        <td className="py-1 px-1 text-center font-bold text-blue-800 mono-num">{h.rank}</td>
                        <td className="py-1 px-1 font-bold text-slate-900 truncate max-w-[110px]" title={name}>
                          {name}
                        </td>
                        <td className="py-1 px-1 text-right font-extrabold text-blue-900 mono-num">
                          {h.weight.toFixed(2)}%
                        </td>
                        <td className="py-1 px-1 text-slate-600 text-[8.5px] truncate max-w-[130px]" title={h.sources.join('+')}>
                          {h.sources.join('+')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Right Sub-table: Rank 6 - 10 */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-[#0f2347] text-white text-[9px] uppercase font-bold">
                    <th className="py-1 px-1 text-center w-5">{t.fs_th_rank}</th>
                    <th className="py-1 px-1">{t.fs_th_holding} (6-10)</th>
                    <th className="py-1 px-1 text-right font-bold w-11">{t.fs_th_weight}</th>
                    <th className="py-1 px-1 text-slate-300">{t.fs_th_overlap}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-[9px] leading-tight">
                  {top6to10.map((h) => {
                    const name = lang === 'en' ? (h.name_en || h.name) : h.name;
                    return (
                      <tr key={h.rank} className="hover:bg-slate-50 transition">
                        <td className="py-1 px-1 text-center font-bold text-slate-600 mono-num">{h.rank}</td>
                        <td className="py-1 px-1 font-semibold text-slate-900 truncate max-w-[110px]" title={name}>
                          {name}
                        </td>
                        <td className="py-1 px-1 text-right font-bold text-slate-800 mono-num">
                          {h.weight.toFixed(2)}%
                        </td>
                        <td className="py-1 px-1 text-slate-600 text-[8.5px] truncate max-w-[130px]" title={h.sources.join('+')}>
                          {h.sources.join('+')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Fund Risk & Feature Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
              <h4 className="text-[11.5px] font-extrabold uppercase tracking-tight text-[#0f2347] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>{t.fs_fund_matrix_title}</span>
              </h4>
              <span className="text-[9px] text-slate-400 font-semibold">
                {lang === 'en' ? 'Official Factsheets Statistics' : '官方基金月报数据统计'}
              </span>
            </div>

            <div className="overflow-hidden">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[9.5px] uppercase font-bold border-b border-slate-200">
                    <th className="py-1 px-1.5">{t.s1_th_fund}</th>
                    <th className="py-1 px-1.5 text-right font-bold w-12">{t.fs_th_target}</th>
                    <th className="py-1 px-1.5 text-right font-bold w-14">{t.fs_th_sharpe}</th>
                    <th className="py-1 px-1.5 text-right font-bold w-16">{t.fs_th_vol}</th>
                    <th className="py-1 px-1.5 font-bold">{t.fs_th_mandate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-[9px] leading-tight">
                  {portfolio.holdings.map((fund) => {
                    const mandate = lang === 'en' 
                      ? (fund.role_desc_en || fund.role_en)
                      : (fund.role_desc_zh || fund.role);
                    return (
                      <tr key={fund.id} className="hover:bg-slate-50 transition">
                        <td className="py-0.5 px-1.5 font-bold text-slate-900 truncate max-w-[170px]" title={fund.fund_name}>
                          {fund.fund_name}
                        </td>
                        <td className="py-0.5 px-1.5 text-right font-semibold text-slate-700 mono-num">
                          {fund.target_weight.toFixed(1)}%
                        </td>
                        <td className="py-0.5 px-1.5 text-right text-emerald-700 font-bold mono-num">
                          {fund.sharpe_3y || 'N/A'}
                        </td>
                        <td className="py-0.5 px-1.5 text-right text-slate-700 mono-num">
                          {fund.vol_3y || 'N/A'}
                        </td>
                        <td className="py-0.5 px-1.5 text-slate-600 text-[8.5px] truncate max-w-[280px]" title={mandate}>
                          {mandate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Slide Footer */}
      <div className="bg-slate-100 px-8 py-1.5 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span className="max-w-4xl truncate">
          {t.fs_footer_sources}
        </span>
        <span className="font-mono text-slate-600 font-semibold shrink-0">
          {t.fs_footer_page}
        </span>
      </div>
    </div>
  );
};
