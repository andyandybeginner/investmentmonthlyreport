import React from 'react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';

interface Slide2Props {
  state: PortfolioState;
  lang: Language;
}

export const Slide2: React.FC<Slide2Props> = ({ state, lang }) => {
  const t = getDictionary(lang);
  const isEn = lang === 'en';

  const starTiers = [
    {
      tierTitle: t.st_tier_v_att,
      badgeColor: 'bg-emerald-700 text-white',
      range: '★★★★½ ~ ★★★★',
      items: [
        { name: isEn ? 'Asia Semiconductors' : '亚洲半导体', stars: '★★★★½' },
        { name: isEn ? 'Singapore' : '新加坡', stars: '★★★★' },
        { name: isEn ? 'South Korea' : '韩国', stars: '★★★★' },
        { name: isEn ? 'Taiwan (China)' : '中国台湾', stars: '★★★★' },
        { name: isEn ? 'Asia ex-Japan' : '亚洲除日本', stars: '★★★★' },
        { name: isEn ? 'Emerging Markets' : '新兴市场', stars: '★★★★' },
      ],
    },
    {
      tierTitle: t.st_tier_att,
      badgeColor: 'bg-teal-700 text-white',
      range: '★★★½ ~ ★★★',
      items: [
        { name: isEn ? 'China Internet (HSTECH)' : '中国互联 (恒生科技)', stars: '★★★½' },
        { name: isEn ? 'Digital Economy (Semicon)' : '数字经济 (半导体)', stars: '★★★½' },
        { name: isEn ? 'Digital Economy (Internet)' : '数字经济 (互联网)', stars: '★★★½' },
        { name: isEn ? 'China' : '中国', stars: '★★★½' },
        { name: isEn ? 'Hong Kong (China)' : '中国香港', stars: '★★★½' },
        { name: isEn ? 'Malaysia' : '马来西亚', stars: '★★★' },
        { name: isEn ? 'Japan' : '日本', stars: '★★★' },
      ],
    },
    {
      tierTitle: t.st_tier_neu,
      badgeColor: 'bg-slate-600 text-white',
      range: '★★½',
      items: [{ name: isEn ? 'Global Healthcare' : '全球医疗健康', stars: '★★½' }],
    },
    {
      tierTitle: t.st_tier_not_att,
      badgeColor: 'bg-rose-700 text-white',
      range: '★★',
      items: [
        { name: isEn ? 'Europe' : '欧洲', stars: '★★' },
        { name: isEn ? 'India' : '印度', stars: '★★' },
        { name: isEn ? 'Global Financials' : '全球金融', stars: '★★' },
        { name: isEn ? 'US' : '美国', stars: '★★' },
        { name: isEn ? 'ASEAN' : '东盟', stars: '★★' },
      ],
    },
  ];

  // Official iFAST Market Performance Data (Page 6 / Doc[5])
  const equityData = [
    { name: t.s2_eq_latam, sgd: 0.47, local: 0.28 },
    { name: t.s2_eq_eemea, sgd: -5.83, local: -6.01 },
    { name: t.s2_eq_cn, sgd: -4.71, local: -4.81 },
    { name: t.s2_eq_asia_ex_jp, sgd: -0.48, local: -0.67 },
    { name: t.s2_eq_em, sgd: -0.82, local: -1.01 },
    { name: t.s2_eq_jp, sgd: 2.59, local: 0.52 },
    { name: t.s2_eq_eu, sgd: -4.99, local: -3.10 },
    { name: t.s2_eq_us, sgd: -0.60, local: -0.78 },
    { name: t.s2_eq_global, sgd: -1.41, local: -1.60 },
  ];

  const bondData = [
    { name: t.s2_bd_global, ret: -2.48 },
    { name: t.s2_bd_aig, ret: -2.05 },
    { name: t.s2_bd_ghy, ret: -3.00 },
    { name: t.s2_bd_ahy, ret: -1.23 },
    { name: t.s2_bd_emd, ret: -3.01 },
  ];

  return (
    <div
      id="slide2"
      className="landscape-slide relative bg-white w-[1400px] h-[990px] mx-auto my-6 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col justify-between shrink-0"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-3 border-b-2 border-amber-500 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
              {t.s2_tag}
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">{t.s2_title}</h1>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
            <span className="text-slate-300 block text-[9.5px] uppercase font-semibold">
              {t.s2_ref_title}
            </span>
            <span className="text-amber-300 font-extrabold text-sm mono-num">{t.s2_ref_val}</span>
          </div>
        </div>
      </div>

      {/* Strategic Recommendation Banner (Large readable font: 13.5px) */}
      <div className="px-8 py-2.5 bg-gradient-to-r from-[#071329] via-[#0d2146] to-[#122b5c] text-white flex items-center justify-between border-b border-indigo-900/60 shadow-inner shrink-0">
        <div className="flex items-center space-x-3.5 w-full">
          <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded shadow-sm shrink-0 tracking-wide uppercase">
            {t.s2_rec_badge}
          </span>
          <span
            className="text-slate-100 text-[13.5px] leading-relaxed font-normal [&>strong]:text-amber-300 [&>strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: t.s2_rec_text }}
          ></span>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="p-4 flex-1 grid grid-cols-12 gap-3.5 items-stretch overflow-hidden">
        {/* Column 1 (4 Cols): Official Market Performance + Regional Review */}
        <div className="col-span-4 bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Section Header */}
          <div className="flex justify-between items-center pb-1 border-b border-slate-100 shrink-0">
            <h3 className="text-xs font-bold text-[#0f2347]">{t.s2_mkt_header}</h3>
            <span className="text-[9.5px] text-slate-400 font-medium">
              {isEn ? `P.${state.page_returns}` : `彭博与投研综合数据 (第${state.page_returns}页)`}
            </span>
          </div>

          {/* Chart 1: Equity Indices Diverging Bar Chart (SGD vs Local) */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-2 flex flex-col gap-1 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
              <span>{t.s2_chart1_title}</span>
              <span className="font-mono text-[8.5px] text-slate-400">{t.s2_mkt_1m_tag}</span>
            </div>

            {/* Axis Ruler (-8% to +4%, Range 12%, 0% at 66.67%) */}
            <div className="flex items-center text-[8px] font-mono text-slate-400 px-0.5">
              <span className="w-20 shrink-0"></span>
              <div className="flex-1 relative mx-1 h-3 flex items-center">
                <span className="absolute left-0">-8%</span>
                <span className="absolute left-[33.33%] -translate-x-1/2">-4%</span>
                <span className="absolute left-[66.67%] -translate-x-1/2 text-slate-700 font-bold">0%</span>
                <span className="absolute right-0">+4%</span>
              </div>
              <span className="w-16 shrink-0 text-right font-sans text-[8px] font-semibold text-slate-500">
                {t.s2_chart1_val_header}
              </span>
            </div>

            {/* 9 Equity Rows */}
            <div className="space-y-[1px]">
              {equityData.map((row, i) => {
                const totalRange = 12; // -8% to +4%

                // SGD bar
                const sgdWidth = (Math.abs(row.sgd) / totalRange) * 100;
                const sgdPos = row.sgd >= 0;

                // Local bar
                const locWidth = (Math.abs(row.local) / totalRange) * 100;
                const locPos = row.local >= 0;

                return (
                  <div key={i} className="flex items-center py-[1px]">
                    <span className="w-20 shrink-0 text-slate-700 font-medium text-[9px] truncate" title={row.name}>
                      {row.name}
                    </span>
                    <div className="flex-1 flex flex-col justify-center gap-[1px] h-3 bg-slate-200/50 rounded relative mx-1">
                      {/* Zero baseline */}
                      <div className="absolute top-0 bottom-0 left-[66.67%] w-[1px] bg-slate-400 z-10"></div>
                      {/* SGD Bar (Upper, Red) */}
                      <div className="relative w-full h-[3px]">
                        {sgdPos ? (
                          <div
                            className="absolute top-0 bottom-0 left-[66.67%] bg-rose-600 rounded-r"
                            style={{ width: `${sgdWidth}%` }}
                          ></div>
                        ) : (
                          <div
                            className="absolute top-0 bottom-0 right-[33.33%] bg-rose-600 rounded-l"
                            style={{ width: `${sgdWidth}%` }}
                          ></div>
                        )}
                      </div>
                      {/* Local Currency Bar (Lower, Dark Blue/Teal) */}
                      <div className="relative w-full h-[3px]">
                        {locPos ? (
                          <div
                            className="absolute top-0 bottom-0 left-[66.67%] bg-cyan-700 rounded-r"
                            style={{ width: `${locWidth}%` }}
                          ></div>
                        ) : (
                          <div
                            className="absolute top-0 bottom-0 right-[33.33%] bg-cyan-700 rounded-l"
                            style={{ width: `${locWidth}%` }}
                          ></div>
                        )}
                      </div>
                    </div>
                    {/* Return labels */}
                    <div className="w-16 shrink-0 text-right font-mono text-[8px] font-bold leading-tight flex justify-end gap-1">
                      <span className={row.sgd >= 0 ? 'text-rose-600' : 'text-slate-600'}>
                        {row.sgd > 0 ? `+${row.sgd.toFixed(2)}` : row.sgd.toFixed(2)}
                      </span>
                      <span className="text-slate-300">/</span>
                      <span className={row.local >= 0 ? 'text-cyan-800' : 'text-slate-500'}>
                        {row.local > 0 ? `+${row.local.toFixed(2)}` : row.local.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend for Chart 1 */}
            <div className="flex items-center justify-center gap-4 text-[8.5px] pt-0.5 border-t border-slate-200/60 font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-1.5 bg-rose-600 rounded-xs"></span>
                {t.s2_lg_sgd}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-1.5 bg-cyan-700 rounded-xs"></span>
                {t.s2_lg_local}
              </span>
            </div>
          </div>

          {/* Chart 2: Bond Indices (USD Terms) Hanging Bars */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-2 flex flex-col gap-0.5 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
              <span>{t.s2_chart2_title}</span>
              <span className="font-mono text-[8.5px] text-slate-400">{t.s2_mkt_1m_tag}</span>
            </div>

            {/* 5 Hanging Columns below 0% baseline */}
            <div className="pt-0.5 pb-0.5">
              {/* Category Names */}
              <div className="grid grid-cols-5 gap-0.5 text-[8px] font-semibold text-slate-700 text-center leading-tight mb-0.5">
                {bondData.map((b, i) => (
                  <span key={i} className="truncate" title={b.name}>
                    {b.name}
                  </span>
                ))}
              </div>

              {/* Zero baseline line */}
              <div className="w-full border-t border-slate-400 relative mb-0.5"></div>

              {/* Hanging bars container (max negative is -3.5%) */}
              <div className="grid grid-cols-5 gap-0.5 h-8 items-start">
                {bondData.map((b, i) => {
                  const barHeight = (Math.abs(b.ret) / 3.5) * 20; // max ~20px
                  return (
                    <div key={i} className="flex flex-col items-center justify-start h-full">
                      <div
                        className="w-3.5 bg-cyan-800 rounded-b"
                        style={{ height: `${barHeight}px` }}
                      ></div>
                      <span className="text-[8px] font-mono font-bold text-slate-800 mt-0.5">
                        {b.ret.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footnote */}
            <p className="text-[7.5px] text-slate-400 leading-tight border-t border-slate-200/60 pt-0.5">
              {t.s2_mkt_footnote}
            </p>
          </div>

          {/* Regional Review Cards: US, Japan, China (Font size: 11px - 11.5px readable) */}
          <div className="space-y-1 flex flex-col justify-start">
            {[
              {
                name: t.us_name,
                rating: t.us_rating,
                desc: t.us_desc,
                badge: 'bg-rose-50 text-rose-700 border border-rose-200',
              },
              {
                name: t.jp_name,
                rating: t.jp_rating,
                desc: t.jp_desc,
                badge: 'bg-amber-50 text-amber-700 border border-amber-200',
              },
              {
                name: t.cn_name,
                rating: t.cn_rating,
                desc: t.cn_desc,
                badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
              },
            ].map((reg, i) => (
              <div
                key={i}
                className="p-1.5 bg-slate-50/80 border border-slate-200/80 rounded-lg space-y-0.5"
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-[11px] text-slate-800">{reg.name}</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${reg.badge}`}>
                    {reg.rating}
                  </span>
                </div>
                <p className={`text-slate-700 font-normal ${isEn ? 'text-[10px] leading-tight' : 'text-[10.5px] leading-snug'}`}>
                  {reg.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 (4 Cols): Q4 Structural Logic & Systemic Risks (Full height balanced cards) */}
        <div className="col-span-4 bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center pb-1 border-b border-slate-100 shrink-0">
            <h3 className="text-xs font-bold text-[#0f2347]">{t.s2_thematic_header}</h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {isEn ? 'iFAST Strategy · Q4 Focus' : '奕丰投研策略 · Q4 Focus'}
            </span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-between py-1">
            {/* Driver 1: AI Hardware */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/90 shadow-2xs flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-blue-950 flex items-center gap-1.5 mb-1.5">
                  <span>{t.drv_ai_title}</span>
                </h4>
                <p className="text-[12px] text-slate-700 leading-relaxed font-normal">{t.drv_ai_desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-[10.5px] text-blue-800 font-semibold border-t border-blue-200/60 mt-2">
                <span className="bg-blue-200/60 px-2 py-0.5 rounded">CapEx ~$800B</span>
                <span className="bg-blue-200/60 px-2 py-0.5 rounded">{isEn ? 'HBM Booked to 2027' : 'HBM 产能售罄至2027'}</span>
              </div>
            </div>

            {/* Driver 2: Middle East Oil */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 shadow-2xs flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-amber-950 flex items-center gap-1.5 mb-1.5">
                  <span>{t.drv_oil_title}</span>
                </h4>
                <p className="text-[12px] text-slate-700 leading-relaxed font-normal">{t.drv_oil_desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-[10.5px] text-amber-800 font-semibold border-t border-amber-200/60 mt-2">
                <span className="bg-amber-200/60 px-2 py-0.5 rounded">Brent &gt; $100</span>
                <span className="bg-amber-200/60 px-2 py-0.5 rounded">{isEn ? 'Diesel Bottleneck' : '柴油精炼见顶'}</span>
              </div>
            </div>

            {/* Driver 3: Caution Areas & Gold Look-through Calibration */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/90 shadow-2xs flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-rose-950 flex items-center gap-1.5 mb-1.5">
                  <span>{t.drv_cautious_title}</span>
                </h4>
                <p
                  className="text-[12px] text-slate-700 leading-relaxed font-normal"
                  dangerouslySetInnerHTML={{ __html: t.drv_cautious_desc }}
                ></p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-[10.5px] text-rose-800 font-semibold border-t border-rose-200/60 mt-2">
                <span className="bg-rose-200/60 px-2 py-0.5 rounded">{isEn ? 'Gold Exposure ~10.5%' : '黄金穿透敞口 ~10.5%'}</span>
                <span className="bg-rose-200/60 px-2 py-0.5 rounded">{isEn ? 'Strict 10% Ceiling' : '严格契合10%上限'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 (4 Cols): Official 19 Sector Star Ratings + Star Methodology Guide */}
        <div className="col-span-4 bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center pb-1 border-b border-slate-100 shrink-0">
            <h3 className="text-xs font-bold text-[#0f2347]">{t.s2_star_header}</h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {isEn ? `Official Rankings (P.${state.page_stars})` : `官方榜单 (第${state.page_stars}页)`}
            </span>
          </div>

          <div className="space-y-1.5 flex flex-col justify-start py-0.5">
            {starTiers.map((tier, idx) => (
              <div key={idx} className="space-y-1">
                <div
                  className={`text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wider flex justify-between items-center ${tier.badgeColor}`}
                >
                  <span>{tier.tierTitle}</span>
                  <span className="text-amber-200 font-mono text-[9px] font-bold">{tier.range}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 pt-0.5">
                  {tier.items.map((it, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex justify-between items-center px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-100/90"
                    >
                      <span className="font-semibold text-slate-700 truncate max-w-[100px] text-[10px]" title={it.name}>
                        {it.name}
                      </span>
                      <span className="text-amber-500 font-mono text-[9px] font-bold shrink-0 ml-1">
                        {it.stars}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Star Rating Methodology & Portfolio Calibration Guide Card */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-1.5 shrink-0">
            <h4 className="text-[11px] font-bold text-[#0f2347] flex items-center gap-1.5">
              <span>🎯 {t.s2_star_guide_title}</span>
            </h4>
            <div className="space-y-1 text-[10px] text-slate-600 leading-snug">
              <p className="flex items-start gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                <span>{t.s2_star_guide_t1}</span>
              </p>
              <p className="flex items-start gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-600 mt-1 shrink-0"></span>
                <span>{t.s2_star_guide_t2}</span>
              </p>
              <p className="flex items-start gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600 mt-1 shrink-0"></span>
                <span>{t.s2_star_guide_t3}</span>
              </p>
            </div>
            <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9.5px] font-semibold leading-snug">
              {t.s2_star_guide_compliance}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
        <span>{t.s2_foot_left}</span>
        <span className="font-semibold text-slate-700">{t.s2_foot_right}</span>
      </div>
    </div>
  );
};
