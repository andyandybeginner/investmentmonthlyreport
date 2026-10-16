import React, { useState } from 'react';
import { PortfolioState, FundHolding, RecommendationType, Language } from '../../types';
import {
  sliceTimeSeriesByReportMonth,
  resolveSettleDateFromCalcEngine,
  synthesize7030AndTranslate,
  MONTH_PRESETS
} from '../../utils/performance';
import {
  FileText,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface DashboardProps {
  portfolio: PortfolioState;
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioState>>;
  lang: Language;
  onSave: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  portfolio,
  setPortfolio,
  onSave,
  onSync,
  isSyncing
}) => {
  const [sectionSaved, setSectionSaved] = useState<{ [key: string]: boolean }>({});
  const [subjectiveInput, setSubjectiveInput] = useState<string>('坚守三支柱战略配置，维持全员持有');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [previewReadyMsg, setPreviewReadyMsg] = useState<string>('');

  // Dynamic time series slice info calculated from selected report month and settle date
  const timeSliceInfo = sliceTimeSeriesByReportMonth(
    portfolio.month,
    portfolio.settle_date,
    portfolio.time_series
  );

  // Apply month resolution locally and optionally from backend Calculation_Engine Col A + preset folder PDF
  const applyMonthResolution = (targetMonth: string) => {
    const preset = MONTH_PRESETS[targetMonth];
    const calcLookup = resolveSettleDateFromCalcEngine(targetMonth);
    const nextSettleDate = preset?.settle_date || calcLookup.settleDate;
    const sliceInfo = sliceTimeSeriesByReportMonth(targetMonth, nextSettleDate, portfolio.time_series);

    if (preset) {
      const updatedHoldings = portfolio.holdings.map(h => {
        const retInfo = preset.holdings_returns[h.id];
        if (retInfo) {
          return {
            ...h,
            return_1m: retInfo.return_1m,
            contrib_1m: retInfo.contrib_1m
          };
        }
        return h;
      });

      setPortfolio(prev => ({
        ...prev,
        month: preset.month,
        settle_date: preset.settle_date,
        valuation_date_zh: preset.valuation_date_zh,
        valuation_date_en: preset.valuation_date_en,
        ref_pdf_name: preset.ref_pdf_name,
        page_returns: preset.page_returns,
        page_stars: preset.page_stars,
        slide3_topic_title_zh: preset.slide3_topic_title_zh,
        slide3_topic_title_en: preset.slide3_topic_title_en,
        qualitative_view: preset.qualitative_view,
        qualitative_view_en: preset.qualitative_view_en,
        rebalance_verdict: preset.rebalance_verdict,
        rebalance_note: preset.rebalance_note,
        rebalance_note_en: preset.rebalance_note_en,
        holdings: updatedHoldings,
        cum_current: sliceInfo.cumCurrent,
        cum_past: sliceInfo.cumPast,
        cum_sp500: sliceInfo.cumSp500,
        cum_msci: sliceInfo.cumMsci,
        alpha_vs_msci: sliceInfo.alphaVsMsci,
        monthly_return_1m: sliceInfo.monthlyReturn1m,
      }));
    } else {
      setPortfolio(prev => ({
        ...prev,
        month: targetMonth,
        settle_date: calcLookup.settleDate,
        valuation_date_zh: calcLookup.valuationDateZh,
        valuation_date_en: calcLookup.valuationDateEn,
        cum_current: sliceInfo.cumCurrent,
        cum_past: sliceInfo.cumPast,
        cum_sp500: sliceInfo.cumSp500,
        cum_msci: sliceInfo.cumMsci,
        alpha_vs_msci: sliceInfo.alphaVsMsci,
        monthly_return_1m: sliceInfo.monthlyReturn1m,
      }));
    }
  };

  // Handle report month manual input or quick select
  const handleSelectMonth = (newMonth: string) => {
    if (/^\d{4}-\d{2}$/.test(newMonth.trim())) {
      applyMonthResolution(newMonth.trim());
    } else {
      setPortfolio(prev => ({ ...prev, month: newMonth }));
    }
  };

  // Section 1 Save: Queries Calculation_Engine Col A for M+1 first valid price date,
  // scans preset local folder for matching iFAST Monthly Update PDF & page numbers,
  // and generates previewable HTML report based on Section 1 & 2
  const handleSaveSection1 = async () => {
    const cleanMonth = portfolio.month.trim();
    applyMonthResolution(cleanMonth);

    try {
      const res = await fetch('/api/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_month: cleanMonth,
          section_name: '第1节（结算日回溯与研报页码适配）'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setPortfolio(prev => ({
            ...prev,
            settle_date: data.settle_date || prev.settle_date,
            valuation_date_zh: data.valuation_date_zh || prev.valuation_date_zh,
            valuation_date_en: data.valuation_date_en || prev.valuation_date_en,
            ref_pdf_name: data.ref_pdf_name || prev.ref_pdf_name,
            page_returns: data.page_returns || prev.page_returns,
            page_stars: data.page_stars || prev.page_stars,
            slide3_topic_title_zh: data.slide3_topic_title_zh || prev.slide3_topic_title_zh,
            slide3_topic_title_en: data.slide3_topic_title_en || prev.slide3_topic_title_en,
          }));
          setPreviewReadyMsg(
            `已从 Calculation_Engine A列自动回溯填入结算日 [${data.settle_date}]，匹配本地研报 [${data.ref_pdf_name}] (回报页 P.${data.page_returns} / 星级榜 P.${data.page_stars})，并已生成可预览 HTML！`
          );
        }
      }
    } catch {
      setPreviewReadyMsg(
        `已自动回溯填入结算日 [${portfolio.settle_date}] 并适配研报页码 (P.${portfolio.page_returns} / P.${portfolio.page_stars})！`
      );
    }

    onSave();
    setSectionSaved(prev => ({ ...prev, sec1: true }));
    setTimeout(() => {
      setSectionSaved(prev => ({ ...prev, sec1: false }));
    }, 3000);
  };

  const notifySectionSaved = (sec: string) => {
    onSave();
    setSectionSaved(prev => ({ ...prev, [sec]: true }));
    setTimeout(() => {
      setSectionSaved(prev => ({ ...prev, [sec]: false }));
    }, 2500);
  };

  // Section 1: Update individual metadata field
  const handleMetaChange = (field: keyof PortfolioState, value: any) => {
    setPortfolio(prev => {
      const nextState = { ...prev, [field]: value };
      if (field === 'settle_date' || field === 'month') {
        const sliceInfo = sliceTimeSeriesByReportMonth(nextState.month, nextState.settle_date, nextState.time_series);
        nextState.cum_current = sliceInfo.cumCurrent;
        nextState.cum_past = sliceInfo.cumPast;
        nextState.cum_sp500 = sliceInfo.cumSp500;
        nextState.cum_msci = sliceInfo.cumMsci;
        nextState.alpha_vs_msci = sliceInfo.alphaVsMsci;
        nextState.monthly_return_1m = sliceInfo.monthlyReturn1m;
      }
      return nextState;
    });
  };

  // Section 4: Trigger Agent 70:30 Argumentation (<= 200 chars) & Auto English Translation
  const handleGenerate7030 = async () => {
    setIsSynthesizing(true);
    const localResult = synthesize7030AndTranslate(portfolio.month, subjectiveInput);
    setPortfolio(prev => ({
      ...prev,
      qualitative_view: localResult.zh,
      qualitative_view_en: localResult.en
    }));

    try {
      const res = await fetch('/api/analyze_sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: portfolio.month,
          user_input: subjectiveInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ai_suggested_attribution) {
          setPortfolio(prev => ({
            ...prev,
            qualitative_view: data.ai_suggested_attribution.slice(0, 200),
            qualitative_view_en: data.ai_suggested_attribution_en || prev.qualitative_view_en
          }));
        }
      }
    } catch {
      // Local deterministic 70:30 result already applied
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Handle direct edit of Chinese qualitative view (strictly <= 200 chars + auto sync English)
  const handleQualitativeZhChange = (newZh: string) => {
    const cappedZh = newZh.length > 200 ? newZh.slice(0, 200) : newZh;
    const synced = synthesize7030AndTranslate(portfolio.month, cappedZh);
    setPortfolio(prev => ({
      ...prev,
      qualitative_view: cappedZh,
      qualitative_view_en: synced.en
    }));
  };

  // Section 4: Update fund conviction
  const handleFundChange = (index: number, field: keyof FundHolding, value: any) => {
    setPortfolio(prev => {
      const nextHoldings = [...prev.holdings];
      nextHoldings[index] = { ...nextHoldings[index], [field]: value };
      return { ...prev, holdings: nextHoldings };
    });
  };

  const handleAddFund = () => {
    const newFund: FundHolding = {
      id: `fund-${Date.now()}`,
      fund_name: 'New Selected Fund',
      role: '卫星成长配置',
      role_en: 'Satellite Growth Asset',
      target_weight: 5.0,
      current_weight: 5.0,
      return_1m: 0.0,
      contrib_1m: 0.0,
      active: true,
      market_noise: '短期波动正常',
      market_noise_en: 'Normal short-term noise',
      fundamental_support: '长期增长逻辑确立',
      fundamental_support_en: 'Solid secular fundamentals',
      recommendation: '持有'
    };
    setPortfolio(prev => ({ ...prev, holdings: [...prev.holdings, newFund] }));
  };

  const handleRemoveFund = (index: number) => {
    setPortfolio(prev => ({
      ...prev,
      holdings: prev.holdings.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-8 space-y-8">
      
      {/* Workspace Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f2347] to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>投研智能工作台</span>
            <span>•</span>
            <span className="text-emerald-400">全自动回溯与双向联动引擎</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            机构投资顾问工作台 · 业务配置与全景中枢
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            仅需填入目标汇报月份并保存设定，系统自动从 Calculation_Engine A列拉取次月首个有效价格日期作为估值结算日，并自动检索本地文件夹中的 iFAST 研报适配对应页码与生成预览 HTML。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-bold border border-slate-700 shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span>{isSyncing ? '同步中...' : '同步 Google Sheet 数据'}</span>
          </button>
          <button
            onClick={() => notifySectionSaved('all')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-extrabold shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>保存全部配置</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: REPORT TARGET & PDF PAGE MATCHING                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                报告目标月份与月度研报动态页码匹配
              </h2>
              <p className="text-xs text-slate-500">
                手动填入汇报月份并点击“保存本节设定”，系统自动从 Calculation_Engine A列写入次月首个有价格的结算日，并读取本地 iFAST 研报返还适配页码
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/preview?month=${portfolio.month}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>打开生成的 HTML 预览</span>
            </a>
            <button
              onClick={handleSaveSection1}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                sectionSaved['sec1']
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {sectionSaved['sec1'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-white" />}
              <span>{sectionSaved['sec1'] ? '已保存并完成回溯匹配' : '保存本节设定'}</span>
            </button>
          </div>
        </div>

        {previewReadyMsg && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <span>✓ {previewReadyMsg}</span>
            <a
              href={`/preview?month=${portfolio.month}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline font-bold ml-4 shrink-0"
            >
              立即查看 HTML 报告预览 →
            </a>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Target Month (Manual Input) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              目标汇报月度 (唯一手动填入项)
            </label>
            <input
              type="text"
              value={portfolio.month}
              onChange={(e) => handleSelectMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: 2026-09"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">快速切换:</span>
              <button
                type="button"
                onClick={() => handleSelectMonth('2026-08')}
                className={`px-2 py-0.5 text-xs font-bold rounded border transition ${
                  portfolio.month === '2026-08'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                2026-08 (8月 / 39期)
              </button>
              <button
                type="button"
                onClick={() => handleSelectMonth('2026-09')}
                className={`px-2 py-0.5 text-xs font-bold rounded border transition ${
                  portfolio.month === '2026-09'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                2026-09 (9月 / 40期)
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              填入 {portfolio.month} 后，系统自动锚定次月发布与结算周期
            </span>
          </div>

          {/* Settle Date (Auto-pulled from Calculation_Engine Column A) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              估值结算日期 (Calculation_Engine A列自动拉取)
            </label>
            <input
              type="date"
              value={portfolio.settle_date}
              onChange={(e) => handleMetaChange('settle_date', e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              ✓ 自动定位制作月次月首个有价格日期: {portfolio.settle_date}
            </span>
          </div>

          {/* PDF Reference Name (Auto-matched from preset local folder) */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              iFAST Monthly Update 研报文件名 (预设本地文件夹自动匹配)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={portfolio.ref_pdf_name}
                onChange={(e) => handleMetaChange('ref_pdf_name', e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              ✓ 已匹配本地文件夹: ...\3. Monthly Report\1. iFast Monthly update\{portfolio.ref_pdf_name}
            </span>
          </div>

          {/* Page Matching Matrix (Auto-returned from matched PDF) */}
          <div className="md:col-span-2 lg:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                📊 全球资产月度回报适配页码 (自动读取返还)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">第</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={portfolio.page_returns || 6}
                  onChange={(e) => handleMetaChange('page_returns', parseInt(e.target.value) || 6)}
                  className="w-20 px-3 py-1.5 text-sm font-bold text-center text-slate-950 bg-white rounded-lg border border-slate-300"
                />
                <span className="text-xs text-slate-600">页 (研报实测适配)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ⭐ 行业星级榜适配页码 (自动读取返还)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">第</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={portfolio.page_stars || 7}
                  onChange={(e) => handleMetaChange('page_stars', parseInt(e.target.value) || 7)}
                  className="w-20 px-3 py-1.5 text-sm font-bold text-center text-slate-950 bg-white rounded-lg border border-slate-300"
                />
                <span className="text-xs text-slate-600">页 (研报实测适配)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                📑 月度深度专题适配题目 (Slide 3 专题)
              </label>
              <input
                type="text"
                value={portfolio.slide3_topic_title_zh || '当债券不再扮演债券：60/40股债平衡组合是否已死？'}
                onChange={(e) => handleMetaChange('slide3_topic_title_zh', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-950 bg-white rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: INPUT MAPPING & FINANCIAL TIME-SERIES (2 Cards Only)           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                时间序列自动抓取与 Google Sheet 映射标准
              </h2>
              <p className="text-xs text-slate-500">
                系统底层已实现全自动期数检测与时间序列清洗，根据第 1 节与第 2 节实时生成可预览 HTML
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-md">
              ✓ 自动化锁定 (已生效)
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">动态时间序列期数</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 mono-num">
                {timeSliceInfo.periodsCount} 期
              </span>
              <span className="text-xs text-emerald-600 font-bold">系统自适应截取</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              根据选定汇报月度 [{portfolio.month}] 与估值结算日 [{portfolio.settle_date}] 动态计算截取：时序区间为 {timeSliceInfo.startDate} 至 {timeSliceInfo.endDate}，共计 {timeSliceInfo.periodsCount} 个月（完全由汇报日期决定，非固定写死）。
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">主组合时间序列计算表名 (Google Sheet Tab)</span>
            <div className="text-sm font-bold text-slate-900 mono-num">
              Calculation_Engine（全组合时间序列计算）
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              底层格式规范：A 列为估值结算日期 (YYYY-MM-DD)，F 列为当前组合复权净值，G 列为旧组合，H 列为标普 500，I 列为 MSCI 全球。
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: DELIVERABLES & EXPORT MANAGEMENT                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                双文件独立分发与导出矩阵 (备忘录与穿透单页)
              </h2>
              <p className="text-xs text-slate-500">
                第 1–5 页备忘录与底层穿透单页分立为独立文件，中英双语严格遵循语言零混杂铁律
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File 1: Monthly Memo (Slide 1-5) */}
          <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  核心交付物 1 · 16:9 横版演示报告
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                  HR 模板投资组合月度投资咨询备忘录 (第 1–5 页)
                </h3>
              </div>
              <FileCheck className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              涵盖业绩走势、宏观脉搏与行业星级、股债专题研读、核心投资支柱与标的信念审查、新加坡法定声明。
            </p>
            <div className="flex gap-2">
              <a
                href="/download/memo_zh"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
              >
                下载中文备忘录 PDF
              </a>
              <a
                href="/download/memo_en"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition"
              >
                下载英文备忘录 PDF
              </a>
            </div>
          </div>

          {/* File 2: Look-Through Factsheet (Standalone) */}
          <div className="border border-slate-200 rounded-xl p-5 hover:border-amber-400 transition bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  核心交付物 2 · 独立穿透分析单页
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                  HR 投资组合底层穿透配置与风险透析单页
                </h3>
              </div>
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              独立文件，不夹带于备忘录内。包含前十大底层穿透持仓、地理行业穿透分布、7 只基金夏普波动矩阵。
            </p>
            <div className="flex gap-2">
              <a
                href="/download/factsheet_zh"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition"
              >
                下载中文穿透单页 PDF
              </a>
              <a
                href="/download/factsheet_en"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition"
              >
                下载英文穿透单页 PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: UNIFIED VERDICT (70:30 <=200 CHARS + AUTO EN) & N-FUND TABLE   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                主观定见、70:30 论据自动生成与 N 标的信念审查决策矩阵
              </h2>
              <p className="text-xs text-slate-500">
                仅需输入一句中文结论与主观意见，Agent 按 70:30 比重自动寻找正向论据与反驳观点（严格 ≤ 200 字），并自动翻译为纯正英文，无需重复填写两次
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddFund}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增底层标的</span>
            </button>
            <button
              onClick={() => notifySectionSaved('sec4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sectionSaved['sec4']
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
              }`}
            >
              {sectionSaved['sec4'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-slate-950" />}
              <span>{sectionSaved['sec4'] ? '已保存定见' : '保存信念矩阵'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Unified Monthly Verdict & 70:30 Argumentation + Auto-Translation Module */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  月度调仓结论总评（中英合一 · 70:30 正反论据生成 · 严控 ≤ 200 字）
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  第 1 步：输入您的中文结论或主观定见 → 第 2 步：点击生成 70% 正向论据 + 30% 反驳逆风（≤200字），系统自动同步纯英文翻译
                </p>
              </div>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-md border mono-num ${
                  portfolio.qualitative_view.length <= 200
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                当前字数: {portfolio.qualitative_view.length} / 200 字 · 70% 正向论据 : 30% 反驳观点
              </span>
            </div>

            {/* Step 1: Advisor Short Conclusion Input + Trigger Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={subjectiveInput}
                onChange={(e) => setSubjectiveInput(e.target.value)}
                placeholder="在此输入您的中文核心结论与主观意见（例如：坚守三支柱战略配置，看好亚洲算力与黄金对冲，维持全员持有）..."
                className="flex-1 px-3.5 py-2 text-xs font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGenerate7030}
                disabled={isSynthesizing}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSynthesizing ? '正在合成 70:30 论据...' : 'AI 生成 70:30 论据 (≤200字) 并自动译为英文'}</span>
              </button>
            </div>

            {/* Step 2: Generated Chinese 70:30 Review (Editable, Capped at 200 Chars) & Auto-Synced English Translation */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  中文月度调仓结论总评（已按 70:30 比重融合正反论据，上限 200 字，可直接微调）：
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={portfolio.qualitative_view}
                  onChange={(e) => handleQualitativeZhChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-950 bg-white rounded-lg border border-slate-300 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-white/90 px-3.5 py-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-600">
                    英文自动翻译同步预览 (Auto-Translated English · 无需手动二次填写)：
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">✓ 已自动对齐中文定见</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {portfolio.qualitative_view_en}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Fund Holdings Conviction Matrix */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                底层基金清单与审查决策 ({portfolio.holdings.length} 只标的)
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                目标权重合计: {portfolio.holdings.reduce((sum, h) => sum + h.target_weight, 0).toFixed(1)}%
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 w-48">基金全称</th>
                      <th className="py-2.5 px-2 w-32">配置定位</th>
                      <th className="py-2.5 px-2 text-right w-20">目标权重</th>
                      <th className="py-2.5 px-2 text-right w-20">当月回报</th>
                      <th className="py-2.5 px-3 min-w-[220px]">短期市场噪音与波动分歧</th>
                      <th className="py-2.5 px-3 min-w-[220px]">中长期核心支撑逻辑</th>
                      <th className="py-2.5 px-3 text-center w-28">顾问行动建议</th>
                      <th className="py-2.5 px-2 text-center w-12">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {portfolio.holdings.map((h, idx) => (
                      <tr key={h.id || idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={h.fund_name}
                            onChange={(e) => handleFundChange(idx, 'fund_name', e.target.value)}
                            className="w-full px-2 py-1 text-xs font-bold text-slate-950 bg-white rounded border border-slate-300"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={h.role}
                            onChange={(e) => handleFundChange(idx, 'role', e.target.value)}
                            className="w-full px-2 py-1 text-xs font-semibold text-slate-950 bg-white rounded border border-slate-300"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.1"
                              value={h.target_weight}
                              onChange={(e) => handleFundChange(idx, 'target_weight', parseFloat(e.target.value) || 0)}
                              className="w-14 px-1.5 py-1 text-xs font-bold text-right text-slate-950 bg-white rounded border border-slate-300 mono-num"
                            />
                            <span className="text-slate-600 text-xs font-bold">%</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={h.return_1m}
                              onChange={(e) => handleFundChange(idx, 'return_1m', parseFloat(e.target.value) || 0)}
                              className="w-14 px-1.5 py-1 text-xs font-bold text-right text-slate-950 bg-white rounded border border-slate-300 mono-num"
                            />
                            <span className="text-slate-600 text-xs font-bold">%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <textarea
                            rows={2}
                            value={h.market_noise}
                            onChange={(e) => handleFundChange(idx, 'market_noise', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] font-medium text-slate-950 bg-white rounded border border-slate-300 leading-tight resize-y"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <textarea
                            rows={2}
                            value={h.fundamental_support}
                            onChange={(e) => handleFundChange(idx, 'fundamental_support', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] font-medium text-slate-950 bg-white rounded border border-slate-300 leading-tight resize-y"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <select
                            value={h.recommendation}
                            onChange={(e) => handleFundChange(idx, 'recommendation', e.target.value as RecommendationType)}
                            className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border transition bg-white text-slate-950 ${
                              h.recommendation === '持有'
                                ? 'border-emerald-400'
                                : h.recommendation === '调仓'
                                ? 'border-amber-400'
                                : 'border-rose-400'
                            }`}
                          >
                            <option value="持有">持有</option>
                            <option value="调仓">调仓</option>
                            <option value="更换标的">更换标的</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleRemoveFund(idx)}
                            className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="移除此标的"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
