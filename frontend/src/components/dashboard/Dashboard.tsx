import React, { useState } from 'react';
import { PortfolioState, FundHolding, RecommendationType, Language } from '../../types';
import { getDictionary } from '../../i18n';
import { sliceTimeSeriesByReportMonth, MONTH_PRESETS } from '../../utils/performance';
import { 
  FileText, 
  Calendar, 
  Database, 
  Layers, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  RefreshCw,
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
  lang,
  onSave,
  onSync,
  isSyncing
}) => {
  const [sectionSaved, setSectionSaved] = useState<{ [key: string]: boolean }>({});

  const notifySectionSaved = (sec: string) => {
    onSave();
    setSectionSaved(prev => ({ ...prev, [sec]: true }));
    setTimeout(() => {
      setSectionSaved(prev => ({ ...prev, [sec]: false }));
    }, 2500);
  };

  // Dynamic time series slice info calculated from selected report month and settle date
  const timeSliceInfo = sliceTimeSeriesByReportMonth(
    portfolio.month,
    portfolio.settle_date,
    portfolio.time_series
  );

  // Handle report month selection (presets or custom)
  const handleSelectMonth = (newMonth: string) => {
    const preset = MONTH_PRESETS[newMonth];
    const newSettleDate = preset?.settle_date || portfolio.settle_date;
    const sliceInfo = sliceTimeSeriesByReportMonth(newMonth, newSettleDate, portfolio.time_series);

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
        month: newMonth,
        cum_current: sliceInfo.cumCurrent,
        cum_past: sliceInfo.cumPast,
        cum_sp500: sliceInfo.cumSp500,
        cum_msci: sliceInfo.cumMsci,
        alpha_vs_msci: sliceInfo.alphaVsMsci,
        monthly_return_1m: sliceInfo.monthlyReturn1m,
      }));
    }
  };

  // Section 1: Update metadata & PDF pages
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
            <span>Portfolio Intelligence Studio</span>
            <span>•</span>
            <span className="text-emerald-400">Reactive Architecture</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            机构投资顾问工作台 · 业务配置与全景中枢
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            告别传统 Python 模版碎片化脚本。前端全面响应式双向绑定，所见即所得；修改任意字段实时映射至 5 张机构备忘录幻灯片与穿透 Factsheet。
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
                支持每个月自适应匹配 iFAST 研报页面，自动读取各板块对应页码，确保宏观与星级榜准确提取
              </p>
            </div>
          </div>
          <button
            onClick={() => notifySectionSaved('sec1')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              sectionSaved['sec1']
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {sectionSaved['sec1'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-slate-500" />}
            <span>{sectionSaved['sec1'] ? '已保存设定' : '保存本节设定'}</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Target Month */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              目标汇报月度 (报告归属月)
            </label>
            <input
              type="text"
              value={portfolio.month}
              onChange={(e) => handleMetaChange('month', e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 2026-09"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">快速预设:</span>
              <button
                type="button"
                onClick={() => handleSelectMonth('2026-08')}
                className={`px-2 py-0.5 text-xs font-bold rounded border transition ${
                  portfolio.month === '2026-08'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
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
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                2026-09 (9月 / 40期)
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              当前为 10 月初出具的 9 月份投资咨询备忘录
            </span>
          </div>

          {/* Settle Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              估值结算日期 (Valuation Date)
            </label>
            <input
              type="date"
              value={portfolio.settle_date}
              onChange={(e) => handleMetaChange('settle_date', e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              底层基金完整披露确认日 (通常为次月5日)
            </span>
          </div>

          {/* PDF Reference Name */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              iFAST Monthly Update 研报文件名
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={portfolio.ref_pdf_name}
                onChange={(e) => handleMetaChange('ref_pdf_name', e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20261005 iFAST Monthly Investment Update.pdf"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              存放于 data/ 目录中的当期研报 PDF
            </span>
          </div>

          {/* Page Matching Matrix */}
          <div className="md:col-span-2 lg:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                📊 全球资产月度回报页码 (Returns)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Page</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={portfolio.page_returns || 3}
                  onChange={(e) => handleMetaChange('page_returns', parseInt(e.target.value) || 3)}
                  className="w-20 px-3 py-1.5 text-sm font-bold text-center rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs text-slate-500">默认第 3 页</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ⭐ 行业星级榜页码 (Star Ratings)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Page</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={portfolio.page_stars || 4}
                  onChange={(e) => handleMetaChange('page_stars', parseInt(e.target.value) || 4)}
                  className="w-20 px-3 py-1.5 text-sm font-bold text-center rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs text-slate-500">默认第 4 页</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                📑 月度深度专题题目 (Slide 3 Thematic)
              </label>
              <input
                type="text"
                value={portfolio.slide3_topic_title_zh || '60/40股债平衡组合是否已死？'}
                onChange={(e) => handleMetaChange('slide3_topic_title_zh', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                placeholder="专题题目 (如: 当债券停止表现得像债券)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: INPUT MAPPING & FINANCIAL TIME-SERIES                          */}
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
                系统底层已实现全自动期数检测与时间序列清洗，无需人工干预
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-md">
              ✓ 自动化锁定 (已生效)
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">动态时间序列期数</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 mono-num">
                {timeSliceInfo.periodsCount} 期
              </span>
              <span className="text-xs text-emerald-600 font-bold">系统自适应截取</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              根据选定汇报月度 [{portfolio.month}] 与结算截止日 [{timeSliceInfo.targetChartDate}] 动态计算截取：时序区间为 {timeSliceInfo.startDate} 至 {timeSliceInfo.endDate}，共计 {timeSliceInfo.periodsCount} 个月（完全由汇报日期决定，非固定写死）。
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">主组合时间序列计算表名 (Tab)</span>
            <div className="text-sm font-bold text-slate-800 mono-num">
              全组合时间序列计算
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              底层格式规范：Col A 为日期，Col B 为当期复权净值
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">当期基准收益与阿尔法对比</span>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">当前组合累计</span>
                <span className="text-sm font-black text-rose-600 mono-num">+{timeSliceInfo.cumCurrent.toFixed(2)}%</span>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <span className="text-[10px] text-slate-400 block">MSCI 全球</span>
                <span className="text-sm font-black text-slate-600 mono-num">+{timeSliceInfo.cumMsci.toFixed(2)}%</span>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <span className="text-[10px] text-slate-400 block">阿尔法超额</span>
                <span className="text-sm font-black text-emerald-600 mono-num">+{timeSliceInfo.alphaVsMsci.toFixed(2)}%</span>
              </div>
            </div>
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
                双文件独立分发与导出矩阵 (Memo & Factsheet)
              </h2>
              <p className="text-xs text-slate-500">
                Slide 1-5 备忘录与底层 Factsheet 分立为独立文件，中英双语严格纯正
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
                  核心交付物 1 · 16:9 横版 PPT 报告
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                  HR 模板投资组合月度投资咨询备忘录 (Slide 1-5)
                </h3>
              </div>
              <FileCheck className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              涵盖业绩走势、宏观脉搏与行业星级、股债专题研读、核心投资支柱与标的信念审查、MAS 法律声明。
            </p>
            <div className="flex gap-2">
              <a
                href="/download/memo_zh"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
              >
                下载中文 Memo
              </a>
              <a
                href="/download/memo_en"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition"
              >
                下载英文 Memo
              </a>
            </div>
          </div>

          {/* File 2: Look-Through Factsheet (Standalone) */}
          <div className="border border-slate-200 rounded-xl p-5 hover:border-amber-400 transition bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  核心交付物 2 · A4 独立穿透分析单页
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                  HR 投资组合底层穿透配置与风险透析 Factsheet
                </h3>
              </div>
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              独立文件，不夹带于 Slide 备忘录内。包含前十大底层穿透持仓、地理行业穿透分布、7 只基金夏普波动矩阵。
            </p>
            <div className="flex gap-2">
              <a
                href="/download/factsheet_zh"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition"
              >
                下载中文 Factsheet
              </a>
              <a
                href="/download/factsheet_en"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition"
              >
                下载英文 Factsheet
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: ADVISOR SUBJECTIVE INPUTS & DYNAMIC N-FUND CONVICTION TABLE    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                主观定见、归因评述与 N 标的信念审查决策矩阵
              </h2>
              <p className="text-xs text-slate-500">
                支持动态增减基金、在线修改“短期市场噪音”与“底层核心逻辑”，设定顾问行动建议（持有 / 调仓 / 更换标的）
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
          {/* Monthly Verdict & Qualitative Attribution Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                月度调仓结论总评 (Slide 1 & Slide 4 核心定见) · 中文
              </label>
              <textarea
                rows={3}
                value={portfolio.qualitative_view}
                onChange={(e) => handleMetaChange('qualitative_view', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monthly Attribution & Rebalance Verdict · English
              </label>
              <textarea
                rows={3}
                value={portfolio.qualitative_view_en}
                onChange={(e) => handleMetaChange('qualitative_view_en', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dynamic Fund Holdings Conviction Matrix */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                底层基金清单与审查决策 ({portfolio.holdings.length} 只标的)
              </span>
              <span className="text-xs text-slate-400">
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
                            className="w-full px-2 py-1 text-xs font-bold text-slate-900 rounded border border-slate-200 bg-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={h.role}
                            onChange={(e) => handleFundChange(idx, 'role', e.target.value)}
                            className="w-full px-2 py-1 text-xs text-slate-700 rounded border border-slate-200 bg-white"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.1"
                              value={h.target_weight}
                              onChange={(e) => handleFundChange(idx, 'target_weight', parseFloat(e.target.value) || 0)}
                              className="w-14 px-1.5 py-1 text-xs font-bold text-right rounded border border-slate-200 bg-white mono-num"
                            />
                            <span className="text-slate-400 text-xs">%</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={h.return_1m}
                              onChange={(e) => handleFundChange(idx, 'return_1m', parseFloat(e.target.value) || 0)}
                              className="w-14 px-1.5 py-1 text-xs font-bold text-right rounded border border-slate-200 bg-white mono-num"
                            />
                            <span className="text-slate-400 text-xs">%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <textarea
                            rows={2}
                            value={h.market_noise}
                            onChange={(e) => handleFundChange(idx, 'market_noise', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded border border-slate-200 bg-white leading-tight resize-y"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <textarea
                            rows={2}
                            value={h.fundamental_support}
                            onChange={(e) => handleFundChange(idx, 'fundamental_support', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded border border-slate-200 bg-white leading-tight resize-y"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <select
                            value={h.recommendation}
                            onChange={(e) => handleFundChange(idx, 'recommendation', e.target.value as RecommendationType)}
                            className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border transition ${
                              h.recommendation === '持有'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : h.recommendation === '调仓'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="持有">持有 (HOLD)</option>
                            <option value="调仓">调仓 (REBALANCE)</option>
                            <option value="更换标的">更换标的 (REPLACE)</option>
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
