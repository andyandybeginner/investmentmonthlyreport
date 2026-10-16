import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PortfolioState, Language } from '../../types';
import { getDictionary } from '../../i18n';
import { MONTH_PRESETS } from '../../utils/performance';

interface Slide4Props {
  state: PortfolioState;
  lang: Language;
}

export const Slide4: React.FC<Slide4Props> = ({ state, lang }) => {
  const t = getDictionary(lang);
  const isEn = lang === 'en';

  const rebalanceNote = isEn ? state.rebalance_note_en : state.rebalance_note;
  const activeHoldings = state.holdings.filter((h) => h.active !== false);
  const presetHoldings = (MONTH_PRESETS[state.month] || MONTH_PRESETS['2026-09']).holdings_returns;

  // Check if there is any modification in holdings / rebalance verdict (i.e. not pure hold)
  const hasHoldingsModification =
    (state.rebalance_verdict && !['持有', '坚持持有', 'Hold', 'HOLD'].includes(state.rebalance_verdict)) ||
    activeHoldings.some(h => {
      const act = h.recommendation || '';
      return act === '调仓' || act === '更换标的' || act.toLowerCase().includes('rebalance') || act.toLowerCase().includes('replace');
    }) ||
    Boolean(state.show_rebalance_memo);

  const memoLink = state.rebalance_memo_link?.trim();
  const shouldShowMemoLink = (hasHoldingsModification || Boolean(state.show_rebalance_memo)) && Boolean(memoLink);

  const principles = isEn
    ? [
        {
          title: 'Prudent Diversification Matters',
          desc: 'We diversify prudently without over-diversifying—precisely calibrating how much weight each high-conviction basket carries.'
        },
        {
          title: 'Valuation-Driven Discipline',
          desc: 'Valuation-anchored investing uncovers asymmetric opportunities, as prices ultimately converge toward intrinsic value.'
        },
        {
          title: 'Fundamental Research Conviction',
          desc: 'Every portfolio decision is grounded in deep fundamental research, resisting both market euphoria and short-term panic.'
        },
        {
          title: 'Long-Term Investment Horizon',
          desc: 'We maintain a disciplined long-term horizon, helping investors navigate cyclical volatility and capture structural compounding.'
        },
        {
          title: 'Independent & Objective Thinking',
          desc: 'Generating sustainable alpha requires independent thinking—even when taking contrarian positions against consensus.'
        },
        {
          title: 'Investors’ Interests First',
          desc: 'Our mission is to build resilient global wealth portfolios, always placing client interests at the forefront.'
        }
      ]
    : [
        {
          title: '审慎分散至关重要',
          desc: '我们保持审慎分散，但绝不过度分散。这不仅在于把鸡蛋放在不同篮子里，更在于精确厘定每个篮子放多少个鸡蛋。'
        },
        {
          title: '坚持估值驱动投资',
          desc: '估值驱动策略助我们发掘良机，因为从长远来看，证券价格终将回归底层资产的内在价值。'
        },
        {
          title: '深信基本面研究',
          desc: '我们的每一项决策均以深度调研为依托，绝不盲从市场狂热，亦不屈服于恐慌。'
        },
        {
          title: '着眼长期投资周期',
          desc: '我们始终坚持长期投资方法，协助投资者从容穿越市场周期与波动，并在机会显现时果断出击。'
        },
        {
          title: '秉持独立客观思考',
          desc: '要创造超额业绩，必须保持独立思考与投资——即使这意味着逆向而行、不随波逐流。独立性是核心优势。'
        },
        {
          title: '投资者利益始终第一',
          desc: '我们的使命：协助全球投资者实现稳健盈利的全球化配置。始终将客户利益置于首位，缔造持久双赢。'
        }
      ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case '持有':
        return (
          <span className="px-2.5 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
            {isEn ? 'HOLD' : '持有'}
          </span>
        );
      case '调仓':
        return (
          <span className="px-2.5 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
            {isEn ? 'REBALANCE' : '调仓'}
          </span>
        );
      case '更换标的':
        return (
          <span className="px-2.5 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300 whitespace-nowrap">
            {isEn ? 'REPLACE' : '更换标的'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
            {isEn ? 'HOLD' : action || '持有'}
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
              {isEn ? 'Advisory Governance' : '投委会治理核查'}
            </span>
            <span className="text-amber-300 font-extrabold text-sm mono-num">
              {isEn ? 'Monthly Conviction Audit' : '月度信念审查复盘'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body: Drawer 1 (6 Principles) + Drawer 2 (3 Pillars) + Drawer 3 (Conviction Matrix + Verdict) */}
      <div className="px-7 py-4 flex-1 flex flex-col justify-between gap-3 overflow-hidden">
        {/* Drawer 1: iFAST 6 Core Investment Philosophy Principles */}
        <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-xs flex shrink-0">
          <div className="w-56 bg-gradient-to-br from-[#124b68] to-[#0c3347] text-white p-3.5 flex flex-col justify-between shrink-0">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300 block mb-0.5">
                iFAST
              </span>
              <h3 className="text-base font-extrabold tracking-tight leading-tight">
                {isEn ? 'Core Investment Philosophy' : '核心投资哲学'}
              </h3>
              <div className="w-8 h-0.5 bg-amber-400 my-1.5"></div>
            </div>
            <p className="text-[10.5px] text-slate-200 leading-snug font-medium">
              {isEn
                ? 'Six foundational tenets guiding every decision from portfolio construction to fund manager selection.'
                : '贯穿每一项投资决策的六大基石法则，从投资组合构建到基金经理筛选。'}
            </p>
          </div>

          <div className="flex-1 grid grid-cols-3 divide-x divide-y divide-slate-200 bg-white">
            {principles.map((p, idx) => (
              <div key={idx} className="p-2.5 flex flex-col justify-start">
                <span className="text-[11.5px] font-bold text-[#0f2347] flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span>{p.title}</span>
                </span>
                <p className="text-[10.5px] text-slate-600 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer 2: 3 Core Portfolio Pillars */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="border border-slate-200 rounded-lg p-2.5 bg-white shadow-xs border-l-4 border-l-blue-800 space-y-0.5">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              {t.s4_p1_title}
            </span>
            <p className="text-[10.5px] text-slate-600 leading-snug">{t.s4_p1_desc}</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-2.5 bg-white shadow-xs border-l-4 border-l-sky-600 space-y-0.5">
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
              {t.s4_p2_title}
            </span>
            <p className="text-[10.5px] text-slate-600 leading-snug">{t.s4_p2_desc}</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-2.5 bg-white shadow-xs border-l-4 border-l-amber-500 space-y-0.5">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              {t.s4_p3_title}
            </span>
            <p className="text-[10.5px] text-slate-600 leading-snug">{t.s4_p3_desc}</p>
          </div>
        </div>

        {/* Drawer 3: Dynamic Conviction Review Decision Matrix Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-100 pb-1">
            <h3 className="text-xs font-extrabold uppercase tracking-tight text-[#0f2347] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>
                {isEn
                  ? `Professional Conviction Amid Volatility: ${state.month} Decision Matrix`
                  : `面对短期波动的专业定见：${state.month} 信念审查决策矩阵`}
              </span>
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">
              {activeHoldings.length} {isEn ? 'Selected Holdings · Objective Weights & Returns Synced' : '只优选标的 · 客观比重与当月回报实时同步'}
            </span>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10.5px] uppercase font-bold border-b border-slate-200">
                  <th className="p-2 pl-3 w-52">{t.s4_th_fund}</th>
                  <th className="p-2 w-24">{t.s4_th_role}</th>
                  <th className="p-2 text-right w-20">{isEn ? 'Target Wt' : '目标权重'}</th>
                  <th className="p-2 text-right w-20 bg-amber-100/60 text-[#0f2347]">{t.s4_th_weight}</th>
                  <th className="p-2 text-right w-20">{t.s4_th_ret}</th>
                  <th className="p-2">{t.s4_th_noise}</th>
                  <th className="p-2">{t.s4_th_support}</th>
                  <th className="p-2 text-center pr-3 w-24">{t.s4_th_action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
                {activeHoldings.map((h) => {
                  const fallback = presetHoldings[h.id];
                  const tgtW = h.target_weight ?? fallback?.target_weight ?? 0;
                  const curW = h.current_weight ?? fallback?.current_weight ?? tgtW;
                  const ret1m = h.return_1m ?? fallback?.return_1m ?? 0;
                  const retColor =
                    ret1m >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-semibold';
                  const noise = isEn
                    ? h.market_noise_en || fallback?.market_noise_en || h.market_noise
                    : h.market_noise || fallback?.market_noise;
                  const support = isEn
                    ? h.fundamental_support_en || fallback?.fundamental_support_en || h.fundamental_support
                    : h.fundamental_support || fallback?.fundamental_support;
                  const rec = h.recommendation || fallback?.recommendation || '持有';

                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="p-2 pl-3 font-bold text-slate-900 truncate max-w-[205px]">
                        {h.fund_name}
                      </td>
                      <td className="p-2 text-slate-700 font-semibold whitespace-nowrap">
                        {isEn ? h.role_en : h.role}
                      </td>
                      <td className="p-2 text-right font-mono text-slate-600 font-semibold">
                        {tgtW.toFixed(2)}%
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-[#0f2347] bg-amber-50/50 border-l border-r border-amber-100">
                        {curW.toFixed(2)}%
                      </td>
                      <td className={`p-2 text-right mono-num ${retColor}`}>
                        {ret1m >= 0 ? `+${ret1m.toFixed(2)}%` : `${ret1m.toFixed(2)}%`}
                      </td>
                      <td className="p-2 text-slate-600 text-[10.5px] leading-snug max-w-[220px]">
                        {noise}
                      </td>
                      <td className="p-2 text-slate-800 text-[10.5px] leading-snug font-medium max-w-[260px]">
                        {support}
                      </td>
                      <td className="p-2 pr-3 text-center">{getActionBadge(rec)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rebalance Verdict Box & Optional Google Drive Attachment Memo Link */}
          <div className="bg-blue-50/90 border border-blue-200 rounded-lg px-3.5 py-1.5 text-xs text-blue-950 flex flex-wrap justify-between items-center gap-2 mt-2 shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {hasHoldingsModification && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white shadow-xs shrink-0">
                  {t.s4_memo_badge}
                </span>
              )}
              <span className="font-bold text-[#0f2347] shrink-0">
                {isEn ? 'Monthly Rebalancing Verdict:' : '月度调仓结论：'}
              </span>
              <span className="text-[11.5px] text-slate-700 truncate">{rebalanceNote}</span>
            </div>

            {shouldShowMemoLink && (
              <a
                href={memoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold rounded-md shadow-xs transition hover:scale-[1.02] shrink-0"
                title={isEn ? 'Open Rebalancing Memorandum on Google Drive' : '在 Google Drive 中查阅持仓变动详细说明备忘录附件'}
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.s4_memo_link_btn}</span>
              </a>
            )}
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
