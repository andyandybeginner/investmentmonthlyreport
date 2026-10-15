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
      badgeColor: 'bg-emerald-600 text-white',
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
      badgeColor: 'bg-teal-600 text-white',
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
      badgeColor: 'bg-slate-500 text-white',
      items: [{ name: isEn ? 'Global Healthcare' : '全球医疗健康', stars: '★★½' }],
    },
    {
      tierTitle: t.st_tier_not_att,
      badgeColor: 'bg-rose-600 text-white',
      items: [
        { name: isEn ? 'Europe' : '欧洲', stars: '★★' },
        { name: isEn ? 'India' : '印度', stars: '★★' },
        { name: isEn ? 'Global Financials' : '全球金融', stars: '★★' },
        { name: isEn ? 'US' : '美国', stars: '★★' },
        { name: isEn ? 'ASEAN' : '东盟 (ASEAN)', stars: '★★' },
      ],
    },
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

      {/* Strategic Recommendation Banner */}
      <div className="px-8 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shadow-inner shrink-0 text-xs">
        <div className="flex items-center space-x-3">
          <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
            {t.s2_rec_badge}
          </span>
          <span
            className="text-slate-100 text-[11px] leading-snug"
            dangerouslySetInnerHTML={{ __html: t.s2_rec_text }}
          ></span>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="p-6 flex-1 grid grid-cols-12 gap-4 items-stretch overflow-hidden">
        {/* Column 1 (4 Cols): Asset Snapshot & Region Outlook */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-100 pb-1">
            <h3 className="text-xs font-bold text-[#0f2347]">{t.s2_mkt_header}</h3>
            <span className="text-[9px] text-slate-400 font-medium">
              {isEn ? `P.${state.page_returns}` : `彭博与投研综合数据 (P.${state.page_returns})`}
            </span>
          </div>

          {/* Diverging Bar Chart 1: Equity Indices */}
          <div className="space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-[9.5px]">
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
              <span>{t.s2_chart1_title}</span>
              <span className="font-mono text-[8px] text-slate-400">{t.s2_mkt_1m_tag}</span>
            </div>
            {/* Axis Ruler */}
            <div className="flex items-center text-[7.5px] font-mono text-slate-400 px-0.5">
              <span className="w-16"></span>
              <div className="flex-1 relative mx-1 h-2 flex items-center">
                <span className="absolute left-0">-7%</span>
                <span className="absolute left-[75%] -translate-x-1/2 text-slate-700 font-bold">0%</span>
                <span className="absolute right-0">+2%</span>
              </div>
              <span className="w-10"></span>
            </div>
            {/* Equity Bars */}
            {[
              { name: t.s2_eq_nasdaq, ret: '+1.74%', width: '17.4%', positive: true },
              { name: t.s2_eq_nikkei, ret: '+0.52%', width: '5.2%', positive: true },
              { name: t.s2_eq_spx, ret: '-0.78%', width: '7.8%', positive: false },
              { name: t.s2_eq_em, ret: '-2.50%', width: '25.0%', positive: false },
              { name: t.s2_eq_cn, ret: '-4.81%', width: '48.1%', positive: false },
            ].map((bar, i) => (
              <div key={i} className="flex items-center py-0.5">
                <span className="w-16 text-slate-700 font-medium truncate">{bar.name}</span>
                <div className="flex-1 flex items-center h-2 bg-slate-200/60 rounded relative mx-1">
                  <div className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-slate-400 z-10"></div>
                  {bar.positive ? (
                    <div
                      className="absolute top-0 bottom-0 left-[75%] bg-emerald-500 rounded-r"
                      style={{ width: bar.width }}
                    ></div>
                  ) : (
                    <div
                      className="absolute top-0 bottom-0 right-[25%] bg-rose-500 rounded-l"
                      style={{ width: bar.width }}
                    ></div>
                  )}
                </div>
                <span
                  className={`w-10 text-right font-mono font-bold text-[9px] ${
                    bar.positive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {bar.ret}
                </span>
              </div>
            ))}
          </div>

          {/* Regional Review Cards: US, Japan, China */}
          <div className="space-y-1.5 overflow-hidden">
            {[
              { name: t.us_name, rating: t.us_rating, desc: t.us_desc, badge: 'bg-rose-50 text-rose-700' },
              { name: t.jp_name, rating: t.jp_rating, desc: t.jp_desc, badge: 'bg-slate-100 text-slate-700' },
              { name: t.cn_name, rating: t.cn_rating, desc: t.cn_desc, badge: 'bg-emerald-50 text-emerald-700' },
            ].map((reg, i) => (
              <div key={i} className="p-1.5 bg-slate-50/70 border border-slate-200/80 rounded-lg">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-[10px] text-slate-800">{reg.name}</span>
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-semibold ${reg.badge}`}>
                    {reg.rating}
                  </span>
                </div>
                <p className="text-[9px] text-slate-600 leading-tight line-clamp-2">{reg.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 (4 Cols): Q4 Structural Logic & Systemic Risks */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-100 pb-1">
            <h3 className="text-xs font-bold text-[#0f2347]">{t.s2_thematic_header}</h3>
            <span className="text-[9px] text-slate-400 font-medium">iFAST Strategy</span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-around">
            {/* Driver 1: AI Hardware */}
            <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
              <h4 className="text-[10.5px] font-bold text-blue-950 flex items-center gap-1 mb-1">
                <span>{t.drv_ai_title}</span>
              </h4>
              <p className="text-[9.5px] text-slate-600 leading-relaxed">{t.drv_ai_desc}</p>
            </div>

            {/* Driver 2: Middle East Oil */}
            <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
              <h4 className="text-[10.5px] font-bold text-amber-950 flex items-center gap-1 mb-1">
                <span>{t.drv_oil_title}</span>
              </h4>
              <p className="text-[9.5px] text-slate-600 leading-relaxed">{t.drv_oil_desc}</p>
            </div>

            {/* Driver 3: Caution Areas & Gold Look-through Calibration */}
            <div className="p-2 rounded-lg bg-rose-50/50 border border-rose-100">
              <h4 className="text-[10.5px] font-bold text-rose-950 flex items-center gap-1 mb-1">
                <span>{t.drv_cautious_title}</span>
              </h4>
              <p
                className="text-[9.5px] text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t.drv_cautious_desc }}
              ></p>
            </div>
          </div>
        </div>

        {/* Column 3 (4 Cols): Official 19 Sector Star Ratings */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-100 pb-1">
            <h3 className="text-xs font-bold text-[#0f2347]">{t.s2_star_header}</h3>
            <span className="text-[9px] text-slate-400 font-medium">
              {isEn ? `P.${state.page_stars}` : `官方榜单 (P.${state.page_stars})`}
            </span>
          </div>

          <div className="space-y-1.5 text-[9.5px] overflow-hidden flex-1 flex flex-col justify-between">
            {starTiers.map((tier, idx) => (
              <div key={idx} className="space-y-0.5">
                <div
                  className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${tier.badgeColor}`}
                >
                  {tier.tierTitle}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                  {tier.items.map((it, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex justify-between items-center px-1 py-0.5 bg-slate-50 rounded border border-slate-100"
                    >
                      <span className="font-semibold text-slate-700 truncate max-w-[90px]">
                        {it.name}
                      </span>
                      <span className="text-amber-500 font-mono text-[8px] font-bold">
                        {it.stars}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
