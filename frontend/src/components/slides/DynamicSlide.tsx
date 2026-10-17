import React, { useState } from 'react';
import { DynamicSlideData, PortfolioState, Language } from '../../types';
import { 
  Table, 
  Calendar, 
  Briefcase, 
  FileText, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles, 
  Filter, 
  ExternalLink 
} from 'lucide-react';

interface DynamicSlideProps {
  slide: DynamicSlideData;
  state: PortfolioState;
  lang: Language;
  slideNumber: number;
}

export const DynamicSlide: React.FC<DynamicSlideProps> = ({
  slide,
  state,
  lang,
  slideNumber
}) => {
  const isEn = lang === 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const title = isEn ? (slide.title_en || slide.title_zh) : (slide.title_zh || slide.title_en);
  const badge = isEn ? (slide.category_badge_en || slide.category_badge_zh) : (slide.category_badge_zh || slide.category_badge_en);

  // Format return tokens
  const renderReturnCell = (val: string) => {
    if (!val || val === '—') return <span className="text-slate-400 font-mono text-xs">一</span>;
    const isNeg = val.startsWith('-') || val.includes('(');
    const isPos = val.startsWith('+') || (!isNeg && parseFloat(val) > 0);
    const colorClass = isPos ? 'text-emerald-700 font-bold' : isNeg ? 'text-rose-700 font-bold' : 'text-slate-700';
    return <span className={`font-mono text-xs ${colorClass}`}>{val}</span>;
  };

  return (
    <div
      id={`slide${slideNumber}`}
      className="landscape-slide relative bg-[#f8fafc] w-[1400px] h-[990px] mx-auto my-6 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col justify-between shrink-0"
    >
      {/* 1. Header Bar */}
      <div className="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-3.5 border-b-2 border-amber-500 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider font-bold mb-1">
            <span className="bg-amber-400/20 px-2.5 py-0.5 rounded text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              SLIDE {slideNumber} · {badge}
            </span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-slate-300 text-[10px]">
              {isEn ? `Source: Page ${slide.source_page}` : `研报溯源: 第 ${slide.source_page} 页`}
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9.5px] uppercase font-semibold">
              {isEn ? 'Reference Document' : '研报参考文件'}
            </span>
            <span className="text-amber-300 font-bold text-xs truncate max-w-[260px] block" title={slide.source_pdf}>
              {slide.source_pdf || state.ref_pdf_name}
            </span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9.5px] uppercase font-semibold">
              {isEn ? 'Valuation Date' : '核算估值日'}
            </span>
            <span className="text-amber-300 font-extrabold text-xs mono-num">
              {isEn ? state.valuation_date_en : state.valuation_date_zh}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div className="px-7 py-4 flex-1 flex flex-col justify-between overflow-hidden min-h-0">
        {/* LAYOUT A: Table Matrix (Recommended Unit Trusts Performance) */}
        {slide.layout === 'table_matrix' && slide.table_data && (
          <div className="h-full flex flex-col justify-between gap-3">
            {/* Top Toolbar / Filter */}
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-2">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isEn ? 'Filter Category:' : '资产类别筛选:'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isEn ? `All (${slide.table_data.rows.length})` : `全部标的 (${slide.table_data.rows.length})`}
                </button>
                {slide.table_data.category_groups.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{isEn ? 'Monthly / YTD / Annualized Net Returns' : '月度、年初至今及年化净回报率'}</span>
              </div>
            </div>

            {/* Table Matrix Container */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex-1 flex flex-col min-h-0">
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#0f2347] text-white z-10">
                    <tr className="text-[11px] font-bold">
                      <th className="py-2.5 px-3 w-[36%]">{isEn ? 'Fund Name' : '官方优选基金名称 (Fund Name)'}</th>
                      <th className="py-2.5 px-2 w-[18%]">{isEn ? 'Category' : '投资类别'}</th>
                      <th className="py-2.5 px-2 text-right">{isEn ? '1M' : '1个月'}</th>
                      <th className="py-2.5 px-2 text-right">{isEn ? '3M' : '3个月'}</th>
                      <th className="py-2.5 px-2 text-right">{isEn ? 'YTD' : '年初至今'}</th>
                      <th className="py-2.5 px-2 text-right">{isEn ? '1Y' : '1年'}</th>
                      <th className="py-2.5 px-2 text-right">{isEn ? '3Y Ann.' : '3年年化'}</th>
                      <th className="py-2.5 px-3 text-right">{isEn ? '5Y Ann.' : '5年年化'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slide.table_data.rows
                      .filter(r => selectedCategory === 'all' || r.category === selectedCategory)
                      .slice(0, 14)
                      .map((row, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-blue-50/50 transition-colors ${
                            idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                          }`}
                        >
                          <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-[340px]" title={row.name}>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                              <span className="truncate">{row.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {row.category}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">{renderReturnCell(row.m1)}</td>
                          <td className="py-2 px-2 text-right">{renderReturnCell(row.m3)}</td>
                          <td className="py-2 px-2 text-right">{renderReturnCell(row.ytd)}</td>
                          <td className="py-2 px-2 text-right">{renderReturnCell(row.y1)}</td>
                          <td className="py-2 px-2 text-right">{renderReturnCell(row.y3)}</td>
                          <td className="py-2 px-3 text-right">{renderReturnCell(row.y5)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Strategy Footnote */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-start gap-3 shrink-0">
              <div className="p-1 rounded bg-blue-600 text-white mt-0.5 shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-950">
                  {isEn ? '【Portfolio Research Context】: ' : '【投研配置关联说明】：'}
                </span>
                {isEn
                  ? 'This performance matrix represents the vetted universe of official Recommended Unit Trusts. Our Model Portfolio selectively anchors core equity drivers and market-neutral ballasts from this tier-one institutional repository.'
                  : '本回报矩阵提取自当月研报附录官方推荐基金池。我们当前的顾问模型组合核心持仓（包括富敦市场中性对冲、大华黄金、东春科技等）均经由该底层基金池与量化夏普比率进行交叉印证与严格对账。'}
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT B: Cards Briefing (DPMS / In-Depth Thematic / Custom Page Insight) */}
        {slide.layout === 'cards_briefing' && slide.cards_data && (
          <div className="h-full flex flex-col justify-between gap-4">
            {/* Top Executive Overview Thesis */}
            <div className="bg-gradient-to-r from-white via-slate-50 to-blue-50/40 p-5 rounded-2xl border border-blue-200/80 shadow-xs shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  {isEn ? 'Executive Core Summary' : '核心提炼与研究纲领'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {isEn ? `Extracted directly from Page ${slide.source_page}` : `直接提取自研报第 ${slide.source_page} 页`}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {isEn ? (slide.cards_data.summary_en || slide.cards_data.summary) : slide.cards_data.summary}
              </p>
            </div>

            {/* 3 Structured Pillar Cards */}
            <div className="grid grid-cols-3 gap-4 flex-1 items-stretch min-h-0">
              {slide.cards_data.pillars.map((pillar, idx) => {
                const borderColors = [
                  'border-emerald-200 hover:border-emerald-300',
                  'border-blue-200 hover:border-blue-300',
                  'border-purple-200 hover:border-purple-300'
                ];
                const tagColors = [
                  'bg-emerald-100 text-emerald-800 border-emerald-200',
                  'bg-blue-100 text-blue-800 border-blue-200',
                  'bg-purple-100 text-purple-800 border-purple-200'
                ];

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-2xl p-5 border ${borderColors[idx % 3]} shadow-xs flex flex-col justify-between transition-all`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tagColors[idx % 3]}`}>
                          {pillar.tag || (isEn ? `Pillar 0${idx + 1}` : `核心支柱 0${idx + 1}`)}
                        </span>
                        {pillar.stat && (
                          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                            {pillar.stat}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-950 mb-2">
                        {isEn ? (pillar.title_en || pillar.title) : pillar.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {isEn ? (pillar.desc_en || pillar.desc) : pillar.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{isEn ? 'Institutional Standard' : '机构级投研标尺'}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Institutional Takeaway */}
            {slide.cards_data.adviser_takeaway && (
              <div className="bg-[#0f2347] text-white p-4 rounded-xl border border-slate-700 shadow-sm flex items-start gap-3 shrink-0">
                <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 mt-0.5 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-extrabold text-amber-300">
                    {isEn ? '【Adviser Implementation Takeaway】: ' : '【投顾配置落地启示】：'}
                  </span>
                  <span className="text-slate-200">
                    {slide.cards_data.adviser_takeaway}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LAYOUT C: Timeline Calendar (Global Economic Calendar) */}
        {slide.layout === 'timeline_calendar' && slide.calendar_data && (
          <div className="h-full flex flex-col justify-between gap-3">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-4 gap-3 shrink-0">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">{isEn ? 'Total Macro Events' : '全月宏观事件总数'}</span>
                  <span className="text-lg font-black text-slate-900 mono-num">{slide.calendar_data.total_count} 项</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">{isEn ? 'High-Impact Decisions' : '极高影响级央行/数据'}</span>
                  <span className="text-lg font-black text-rose-600 mono-num">{slide.calendar_data.high_impact_count} 项</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">{isEn ? 'Key Economies' : '覆盖核心主要经济体'}</span>
                  <span className="text-sm font-extrabold text-slate-900">美 / 中 / 欧 / 日</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">{isEn ? 'Hedging Strategy' : '组合防守策略'}</span>
                  <span className="text-sm font-extrabold text-amber-700">富敦中性 + 黄金对冲</span>
                </div>
              </div>
            </div>

            {/* Calendar Events Grid */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex-1 flex flex-col min-h-0">
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-2.5">
                  {slide.calendar_data.events.map((evt, idx) => {
                    const isHigh = evt.importance === 'high';
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border transition-all flex items-start gap-3 ${
                          isHigh
                            ? 'bg-rose-50/50 border-rose-200/90 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200/80'
                        }`}
                      >
                        {/* Day Badge */}
                        <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 font-bold ${
                          isHigh ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <span className="text-xs uppercase leading-none">{evt.day || 'D'}</span>
                          <span className="text-base font-black leading-none mt-0.5 mono-num">{evt.date}</span>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              evt.region === 'US' ? 'bg-blue-100 text-blue-800' :
                              evt.region === 'CN' ? 'bg-red-100 text-red-800' :
                              evt.region === 'EU' ? 'bg-indigo-100 text-indigo-800' :
                              evt.region === 'JP' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-200 text-slate-800'
                            }`}>
                              {evt.region}
                            </span>
                            {isHigh && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-rose-600 text-white animate-pulse">
                                HIGH IMPACT
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate" title={isEn ? evt.event_en : evt.event_zh}>
                            {isEn ? evt.event_en : evt.event_zh}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {isEn ? evt.event_zh : evt.event_en}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Hedging Note */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex items-start gap-3 shrink-0">
              <div className="p-1 rounded bg-amber-500 text-slate-950 mt-0.5 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-amber-950 leading-relaxed">
                <span className="font-bold">
                  {isEn ? '【Macro Calendar Risk Protocol】: ' : '【宏观日历风险响应机制】：'}
                </span>
                {isEn
                  ? 'All listed central bank rate decisions and macroeconomic releases are proactively hedged against denominator shocks through our 35% market-neutral core and 10.5% pure gold buffer.'
                  : '针对当月中美欧日关键央行议息与核心宏观数据波动，HR 模型组合依托 35% 富敦低贝塔市场中性底仓与 10.5% 穿透纯金对冲提前锁定防御边界，无惧短线利率预期的脉冲式扰动。'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer Bar */}
      <div className="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span>
          {isEn
            ? `HR Institutional Advisory Suite · Supplementary Appendix (Slide ${slideNumber}) · Proprietary Synthesis`
            : `HR 机构投资顾问套件 · 研报附录扩充透析 (第 ${slideNumber} 页) · 严守合规披露`}
        </span>
        <span className="font-semibold text-slate-700">
          {isEn ? `Page ${slideNumber} of Extended Presentation` : `扩充报告第 ${slideNumber} 页`}
        </span>
      </div>
    </div>
  );
};
