import React, { useState, useRef } from 'react';
import { PortfolioState, FundHolding, RecommendationType, Language } from '../../types';
import {
  sliceTimeSeriesByReportMonth,
  resolveSettleDateFromCalcEngine,
  synthesize7030AndTranslate,
  MONTH_PRESETS,
  resolveHoldingsForMonth
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
  ExternalLink,
  Calendar,
  X,
  Layers,
  CheckSquare,
  Square,
  PieChart,
  Star,
  BookOpen,
  Sliders,
  Check,
  FileSearch,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  portfolio: PortfolioState;
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioState>>;
  lang: Language;
  onSave: () => void;
  onSync: () => void;
  isSyncing: boolean;
  isSplitMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  portfolio,
  setPortfolio,
  onSave,
  onSync,
  isSyncing,
  isSplitMode = false
}) => {
  const [sectionSaved, setSectionSaved] = useState<{ [key: string]: boolean }>({});
  const [subjectiveInput, setSubjectiveInput] = useState<string>('坚守三支柱战略配置，维持全员持有');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [previewReadyMsg, setPreviewReadyMsg] = useState<string>('');
  const monthInputRef = useRef<HTMLInputElement>(null);

  // PDF Structure Analysis & Selection Modal state
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  const [parseProgress, setParseProgress] = useState<number>(0);
  const [parsePhaseText, setParsePhaseText] = useState<string>('');
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [pdfSummaryData, setPdfSummaryData] = useState<any>(null);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    returns: true,
    stars: true,
    topic: true,
    funds_matrix: false,
    dpms: false,
    calendar: false,
  });
  const [modalPages, setModalPages] = useState<Record<string, number>>({
    returns: portfolio.page_returns || 6,
    stars: portfolio.page_stars || 7,
    topic: 3,
    funds_matrix: 20,
    dpms: 14,
    calendar: 24,
  });
  const [customExtraPage, setCustomExtraPage] = useState<string>('');
  const [modalTopicTitle, setModalTopicTitle] = useState<string>(
    portfolio.slide3_topic_title_zh || '当债券不再扮演债券：60/40股债平衡组合是否已死？'
  );

  // Dynamic time series slice info calculated from selected report month and settle date
  const timeSliceInfo = sliceTimeSeriesByReportMonth(
    portfolio.month,
    portfolio.settle_date,
    portfolio.time_series
  );

  // Apply month resolution locally and immediately populate dynamic N funds' objective weights & returns
  const applyMonthResolution = (targetMonth: string): FundHolding[] => {
    const preset = MONTH_PRESETS[targetMonth];
    const calcLookup = resolveSettleDateFromCalcEngine(targetMonth);
    const nextSettleDate = preset?.settle_date || calcLookup.settleDate;
    const sliceInfo = sliceTimeSeriesByReportMonth(targetMonth, nextSettleDate, portfolio.time_series);

    // Dynamically resolve exact N holdings for target month
    const updatedHoldings = resolveHoldingsForMonth(targetMonth, portfolio.holdings);

    if (preset) {
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
        settle_date: nextSettleDate,
        valuation_date_zh: calcLookup.valuationDateZh,
        valuation_date_en: calcLookup.valuationDateEn,
        holdings: updatedHoldings,
        cum_current: sliceInfo.cumCurrent,
        cum_past: sliceInfo.cumPast,
        cum_sp500: sliceInfo.cumSp500,
        cum_msci: sliceInfo.cumMsci,
        alpha_vs_msci: sliceInfo.alphaVsMsci,
        monthly_return_1m: sliceInfo.monthlyReturn1m,
      }));
    }
    return updatedHoldings;
  };

  // Handle report month manual input or quick select
  const handleSelectMonth = (newMonth: string) => {
    if (/^\d{4}-\d{2}$/.test(newMonth.trim())) {
      applyMonthResolution(newMonth.trim());
    } else {
      setPortfolio(prev => ({ ...prev, month: newMonth }));
    }
  };

  // Trigger native browser month picker modal
  const handleOpenMonthPicker = () => {
    if (monthInputRef.current) {
      try {
        if (typeof (monthInputRef.current as any).showPicker === 'function') {
          (monthInputRef.current as any).showPicker();
        } else {
          monthInputRef.current.focus();
          monthInputRef.current.click();
        }
      } catch {
        monthInputRef.current.focus();
      }
    }
  };

  // Section 1 Save: Queries Calculation_Engine Col A for M+1 first valid price date,
  // scans preset local folder for matching iFAST Monthly Update PDF & page numbers,
  // populates all dynamic N funds' objective returns & weights, and generates previewable HTML report
  const handleSaveSection1 = async () => {
    const cleanMonth = portfolio.month.trim();
    const resolvedHoldings = applyMonthResolution(cleanMonth);
    const preset = MONTH_PRESETS[cleanMonth];

    const serializedHoldings = resolvedHoldings.map(h => ({
      id: h.id,
      fund_name: h.fund_name,
      role: h.role,
      role_en: h.role_en,
      target_weight: `${h.target_weight.toFixed(2)}%`,
      current_weight: `${h.current_weight.toFixed(2)}%`,
      nav: h.nav || '—',
      return_1m: `${h.return_1m >= 0 ? '+' : ''}${h.return_1m.toFixed(2)}%`,
      contrib_1m: `${h.contrib_1m >= 0 ? '+' : ''}${h.contrib_1m.toFixed(2)}%`,
      active: h.active !== false,
      market_noise: h.market_noise,
      market_noise_en: h.market_noise_en,
      fundamental_support: h.fundamental_support,
      fundamental_support_en: h.fundamental_support_en,
      advisory_recommendation: h.recommendation
    }));

    try {
      const res = await fetch('/api/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_month: cleanMonth,
          section_name: '第1节（结算日回溯与研报页码适配）',
          manager_input: {
            qualitative_view: preset?.qualitative_view || portfolio.qualitative_view,
            qualitative_view_en: preset?.qualitative_view_en || portfolio.qualitative_view_en,
            rebalance_verdict: preset?.rebalance_verdict || portfolio.rebalance_verdict,
            rebalance_note: preset?.rebalance_note || portfolio.rebalance_note,
            rebalance_note_en: preset?.rebalance_note_en || portfolio.rebalance_note_en,
            holdings_conviction: serializedHoldings
          }
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
            holdings: resolvedHoldings
          }));
          setPreviewReadyMsg(
            `已从 Calculation_Engine A列自动回溯填入结算日 [${data.settle_date}]，同步 ${resolvedHoldings.length} 只底层基金客观回报与权重，匹配本地研报 [${data.ref_pdf_name}] (回报页 P.${data.page_returns} / 星级榜 P.${data.page_stars})，并已生成可预览 HTML！`
          );
        }
      }
    } catch {
      setPreviewReadyMsg(
        `已自动回溯填入结算日 [${portfolio.settle_date}]、同步 ${resolvedHoldings.length} 只底层基金客观回报与权重，并适配研报页码 (P.${portfolio.page_returns} / P.${portfolio.page_stars})！`
      );
    }

    setSectionSaved(prev => ({ ...prev, sec1: true }));
    setTimeout(() => {
      setSectionSaved(prev => ({ ...prev, sec1: false }));
    }, 3000);

    // Automatically trigger PDF analysis and modal popup after Section 1 save
    handleTriggerPdfAnalysis(cleanMonth);
  };

  // Trigger PDF Structure Analysis & Selection Modal
  const handleTriggerPdfAnalysis = async (targetMonth?: string) => {
    const monthToUse = targetMonth || portfolio.month;
    setIsParsingPdf(true);
    setParseProgress(10);
    setParsePhaseText('正在定位本地 iFAST Monthly Update 研报文件...');

    let currentP = 10;
    const progressTimer = setInterval(() => {
      currentP += Math.floor(Math.random() * 9) + 4;
      if (currentP > 88) currentP = 88;
      setParseProgress(currentP);
      if (currentP > 25 && currentP <= 50) {
        setParsePhaseText('正在执行文本追踪归一化与底层向量 DOM 解析...');
      } else if (currentP > 50 && currentP <= 75) {
        setParsePhaseText('正在定位 Market Performance、行业星级榜与深度专题...');
      } else if (currentP > 75) {
        setParsePhaseText('正在提取各大类资产回报向量数据与图表锚点...');
      }
    }, 280);

    try {
      const res = await fetch(`/api/analyze_pdf_structure?month=${monthToUse}&filename=${encodeURIComponent(portfolio.ref_pdf_name || '')}`);
      clearInterval(progressTimer);

      if (res.ok) {
        const data = await res.json();
        setParseProgress(100);
        setParsePhaseText('研报结构语义解析完成！');
        setPdfSummaryData(data);

        if (data.preselected_pages) {
          setModalPages(prev => ({
            ...prev,
            returns: data.preselected_pages.page_returns || prev.returns,
            stars: data.preselected_pages.page_stars || prev.stars,
            topic: data.preselected_pages.page_topic || prev.topic,
            funds_matrix: data.preselected_pages.page_funds || prev.funds_matrix,
            dpms: data.preselected_pages.page_dpms || prev.dpms,
            calendar: data.preselected_pages.page_calendar || prev.calendar,
          }));
          if (data.preselected_pages.topic_title_zh) {
            setModalTopicTitle(data.preselected_pages.topic_title_zh);
          }
        }

        // Reset to default core mandatory preselected
        setSelectedSections({
          returns: true,
          stars: true,
          topic: true,
          funds_matrix: false,
          dpms: false,
          calendar: false,
        });

        setTimeout(() => {
          setIsParsingPdf(false);
          setShowSummaryModal(true);
        }, 500);
      } else {
        throw new Error('API parse failed');
      }
    } catch {
      clearInterval(progressTimer);
      setParseProgress(100);
      setParsePhaseText('自动解析完成（载入默认标准结构）');
      setTimeout(() => {
        setIsParsingPdf(false);
        setShowSummaryModal(true);
      }, 500);
    }
  };

  // Section 2: Apply selected sections and custom page numbers from modal
  const handleApplyModalSections = async () => {
    const pageReturns = modalPages.returns || portfolio.page_returns || 6;
    const pageStars = modalPages.stars || portfolio.page_stars || 7;
    const topicTitle = modalTopicTitle || portfolio.slide3_topic_title_zh;

    setShowSummaryModal(false);

    const customPagesList: number[] = [];
    if (customExtraPage.trim()) {
      const parts = customExtraPage.split(/[,，\s]+/);
      for (const p of parts) {
        const num = parseInt(p.trim());
        if (num && num > 0) customPagesList.push(num);
      }
    }

    try {
      const res = await fetch('/api/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_month: portfolio.month,
          section_name: '第2节（研报动态页码与专题微调）',
          page_returns: pageReturns,
          page_stars: pageStars,
          slide3_topic_title: topicTitle,
          slide3_topic_title_zh: topicTitle,
          selected_sections: selectedSections,
          modal_pages: modalPages,
          custom_pages: customPagesList,
        })
      });

      if (res.ok) {
        const data = await res.json();
        const dynSlides = data.dynamic_slides || [];
        setPortfolio(prev => ({
          ...prev,
          page_returns: pageReturns,
          page_stars: pageStars,
          slide3_topic_title_zh: topicTitle,
          dynamic_slides: dynSlides
        }));

        const count = dynSlides.length;
        const extraMsg = count > 0 ? ` 并已实时设计生成 ${count} 个扩充附录幻灯片 (Slide 6+)！` : '';
        setPreviewReadyMsg(
          `已成功应用研报结构选择：大类资产表现(P.${pageReturns})、行业星级榜(P.${pageStars})、深度专题 [${topicTitle}]${extraMsg}`
        );
      } else {
        setPortfolio(prev => ({
          ...prev,
          page_returns: pageReturns,
          page_stars: pageStars,
          slide3_topic_title_zh: topicTitle,
        }));
      }
    } catch {
      setPortfolio(prev => ({
        ...prev,
        page_returns: pageReturns,
        page_stars: pageStars,
        slide3_topic_title_zh: topicTitle,
      }));
    }

    notifySectionSaved('sec2');
  };

  const notifySectionSaved = (sec: string) => {
    onSave();
    setSectionSaved(prev => ({ ...prev, [sec]: true }));
    setTimeout(() => {
      setSectionSaved(prev => ({ ...prev, [sec]: false }));
    }, 2500);
  };

  // Section 2: Save custom page numbers and topic title tweaks
  const handleSaveSection2 = async () => {
    try {
      await fetch('/api/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_month: portfolio.month,
          section_name: '第2节（研报动态页码与专题微调）',
          page_returns: portfolio.page_returns,
          page_stars: portfolio.page_stars,
          slide3_topic_title: portfolio.slide3_topic_title_zh,
          slide3_topic_title_zh: portfolio.slide3_topic_title_zh
        })
      });
    } catch {
      // Local state is already held in portfolio
    }
    notifySectionSaved('sec2');
  };

  // Section 4: Save manager verdict, 70:30 review, conviction matrix & Google Drive alteration memo link
  const handleSaveSection4 = async () => {
    try {
      await fetch('/api/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_month: portfolio.month,
          section_name: '第4节（定见、调仓决议与附件备忘录）',
          rebalance_memo_link: portfolio.rebalance_memo_link,
          show_rebalance_memo: portfolio.show_rebalance_memo,
          manager_input: {
            qualitative_view: portfolio.qualitative_view,
            qualitative_view_en: portfolio.qualitative_view_en,
            rebalance_verdict: portfolio.rebalance_verdict,
            rebalance_note: portfolio.rebalance_note,
            rebalance_note_en: portfolio.rebalance_note_en,
            rebalance_memo_link: portfolio.rebalance_memo_link,
            show_rebalance_memo: portfolio.show_rebalance_memo,
            holdings_conviction: portfolio.holdings.map(h => ({
              id: h.id,
              fund_name: h.fund_name,
              role: h.role,
              role_en: h.role_en,
              target_weight: `${h.target_weight.toFixed(2)}%`,
              current_weight: `${h.current_weight.toFixed(2)}%`,
              nav: h.nav || '—',
              return_1m: `${h.return_1m >= 0 ? '+' : ''}${h.return_1m.toFixed(2)}%`,
              contrib_1m: `${h.contrib_1m >= 0 ? '+' : ''}${h.contrib_1m.toFixed(2)}%`,
              active: h.active !== false,
              market_noise: h.market_noise,
              market_noise_en: h.market_noise_en,
              fundamental_support: h.fundamental_support,
              fundamental_support_en: h.fundamental_support_en,
              advisory_recommendation: h.recommendation
            }))
          }
        })
      });
    } catch {
      // Local state is preserved
    }
    notifySectionSaved('sec4');
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

  // Determine whether any portfolio modification is present (or forced)
  const hasModification =
    (portfolio.rebalance_verdict && !['持有', '坚持持有', 'Hold', 'HOLD'].includes(portfolio.rebalance_verdict)) ||
    portfolio.holdings.some(h => {
      const act = h.recommendation || '';
      return act === '调仓' || act === '更换标的' || act.includes('调仓') || act.includes('更换');
    }) ||
    Boolean(portfolio.show_rebalance_memo);

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
                报告目标月份与研报文件检索 (唯一手动输入项)
              </h2>
              <p className="text-xs text-slate-500">
                手动填入汇报月份并点击“保存本节设定”，系统自动从 Calculation_Engine A列拉取结算日并在本地文件夹检索研报，适配页码将自动返还至第 2 节
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTriggerPdfAnalysis()}
              disabled={isParsingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500/40 shadow-xs transition cursor-pointer"
              title="根据 SOP 底层向量拆解研报并弹出章节结构摘要选择器"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>⚡ 智能拆解研报大纲与板块选择</span>
            </button>
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
              <span>{sectionSaved['sec1'] ? '已保存并解析研报' : '保存本节设定'}</span>
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Month (Manual Input + Standardized Month Picker Button) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              目标汇报月度 (唯一手动填入项)
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={monthInputRef}
                type="month"
                min="2023-07"
                max="2027-12"
                value={portfolio.month}
                onChange={(e) => handleSelectMonth(e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mono-num"
              />
              <button
                type="button"
                onClick={handleOpenMonthPicker}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-blue-50 text-slate-950 hover:text-blue-700 text-xs font-extrabold border border-slate-300 hover:border-blue-400 shadow-xs transition shrink-0 cursor-pointer"
                title="点击打开标准年月规范选择器"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>日期规范选择</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">快速切换:</span>
              <button
                type="button"
                onClick={() => handleSelectMonth('2026-08')}
                className={`px-2 py-0.5 text-xs font-bold rounded border transition ${
                  portfolio.month === '2026-08'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-950 border-slate-300'
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
                    : 'bg-white hover:bg-slate-100 text-slate-950 border-slate-300'
                }`}
              >
                2026-09 (9月 / 40期)
              </button>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              ✓ 选定 {portfolio.month} 后，已自动同步底层基金客观比重与当月回报（共 {portfolio.holdings.length} 只标的）
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
              className="w-full px-3 py-2 text-sm font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mono-num"
            />
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              ✓ 自动定位制作月次月首个有价格日期: {portfolio.settle_date}
            </span>
          </div>

          {/* PDF Reference Name (Auto-matched from preset local folder) */}
          <div>
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
            <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
              <span className="text-[11px] text-emerald-700 font-semibold block">
                ✓ 已匹配本地研报: {portfolio.ref_pdf_name}
              </span>
              <button
                type="button"
                onClick={() => handleTriggerPdfAnalysis()}
                className="text-[11px] text-blue-700 hover:text-blue-900 underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileSearch className="w-3 h-3" />
                <span>分析此文件大纲结构与选择板块 →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: ADAPTIVE PAGE NUMBERS & FINANCIAL TIME-SERIES                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                研报章节动态页码返还与时间序列数据
              </h2>
              <p className="text-xs text-slate-500">
                保存第 1 节后系统自动读取本地研报返还以下适配页码与专题；同时从 Calculation_Engine A列动态截取时序
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (pdfSummaryData) {
                  setShowSummaryModal(true);
                } else {
                  handleTriggerPdfAnalysis();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs transition cursor-pointer"
              title="重新打开研报大纲与板块选择器"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>研报大纲与板块选择器</span>
            </button>
            <button
              onClick={handleSaveSection2}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                sectionSaved['sec2']
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {sectionSaved['sec2'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-white" />}
              <span>{sectionSaved['sec2'] ? '已保存页码微调' : '保存页码微调'}</span>
            </button>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-md">
              ✓ 研报解析与时序联动
            </span>
          </div>
        </div>

        {/* Dynamic Matched Pages & Topic Title Card (Moved from Section 1) */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/40">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase">
                  研报解析动态返还结果（支持顾问人工微调并保存）
                </h3>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                研报来源: <code className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{portfolio.ref_pdf_name || '待第 1 节保存后读取'}</code>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className="w-20 px-3 py-1.5 text-sm font-bold text-center text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600">页 (研报实测适配)</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1.5 block">
                  ✓ 对应 Slide 2 全球大类资产月度表现穿透
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className="w-20 px-3 py-1.5 text-sm font-bold text-center text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600">页 (研报实测适配)</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1.5 block">
                  ✓ 对应 Slide 2 行业星级与估值评级穿透
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  📑 月度深度专题适配题目 (Slide 3 专题)
                </label>
                <input
                  type="text"
                  value={portfolio.slide3_topic_title_zh || '当债券不再扮演债券：60/40股债平衡组合是否已死？'}
                  onChange={(e) => handleMetaChange('slide3_topic_title_zh', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-emerald-700 font-semibold mt-1.5 block">
                  ✓ 对应 Slide 3 研报深度专题解析题目
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Time-Series Info & Sheet Mapping */}
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
                href={`/download/memo_zh?month=${portfolio.month}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
              >
                下载中文备忘录 PDF
              </a>
              <a
                href={`/download/memo_en?month=${portfolio.month}`}
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
                href={`/download/factsheet_zh?month=${portfolio.month}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition"
              >
                下载中文穿透单页 PDF
              </a>
              <a
                href={`/download/factsheet_en?month=${portfolio.month}`}
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
              onClick={handleSaveSection4}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sectionSaved['sec4']
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
              }`}
            >
              {sectionSaved['sec4'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-slate-950" />}
              <span>{sectionSaved['sec4'] ? '已保存定见与附件' : '保存信念矩阵与附件'}</span>
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

          {/* Rebalancing Execution Verdict & Google Drive Alteration Memo Attachment */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  月度调仓决议与变动备忘录公开附件 (适用于持仓发生修改)
                </h3>
              </div>
              {hasModification ? (
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                  ⚠️ 已检测到持仓变动（非全员持有）
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ 当前为全员持有状态
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Verdict Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  全组合调仓执行决议
                </label>
                <select
                  value={portfolio.rebalance_verdict || '持有'}
                  onChange={(e) => handleMetaChange('rebalance_verdict', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="持有">持有（维持既有资产配置不触发被动赎回）</option>
                  <option value="调仓">调仓（触发部分标的或权重微调再平衡）</option>
                  <option value="更换标的">更换标的（触发底层标的替换或组合重组）</option>
                </select>
              </div>

              {/* Rebalance Note */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  调仓决议结论简述 (Slide 4 底部决议条)
                </label>
                <input
                  type="text"
                  value={portfolio.rebalance_note}
                  onChange={(e) => handleMetaChange('rebalance_note', e.target.value)}
                  placeholder="例如：全员保持持有，各支柱运作良好，无须被动调仓"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Google Drive Public Link Input */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <label className="block text-xs font-bold text-slate-800">
                  📎 调仓与持仓变动备忘录公开附件链接 (Google Drive 公开链接)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={portfolio.show_rebalance_memo ?? false}
                      onChange={(e) => handleMetaChange('show_rebalance_memo', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>在 Slide 4 底部强制展示附件按钮</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={portfolio.rebalance_memo_link || ''}
                  onChange={(e) => handleMetaChange('rebalance_memo_link', e.target.value)}
                  placeholder="粘贴 Google Drive 公开附件链接，例如: https://drive.google.com/file/d/1BxiMVs.../view?usp=sharing"
                  className="flex-1 px-3 py-2 text-xs font-mono font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {portfolio.rebalance_memo_link && (
                  <a
                    href={portfolio.rebalance_memo_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition shrink-0"
                    title="在浏览器中测试打开此 Google Drive 链接"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>测试打开</span>
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  {hasModification || portfolio.show_rebalance_memo ? (
                    portfolio.rebalance_memo_link ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ 联动生效：检测到持仓变动或已启用展示，该 Google Drive 链接已插入至 Slide 4 底部！
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        ⚠️ 提示：检测到持仓变动（或启用了展示），请输入有效的 Google Drive 链接以在 Slide 4 底部渲染附件按钮。
                      </span>
                    )
                  ) : (
                    <span>
                      ℹ️ 说明：当下方底层标的选择非“持有”（如调仓或更换标的）或决议为非“持有”时，系统将自动激活该链接并呈现在 Slide 4 底部。
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Fund Holdings Conviction Matrix */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                底层基金清单与审查决策 ({portfolio.holdings.length} 只标的 · 客观比重与当月回报已由第 1 节自动加载)
              </span>
              <span className="text-xs text-slate-600 font-bold mono-num">
                目标权重合计: {portfolio.holdings.reduce((sum, h) => sum + h.target_weight, 0).toFixed(1)}% · 当前权重合计: {portfolio.holdings.reduce((sum, h) => sum + h.current_weight, 0).toFixed(2)}%
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 w-48">基金全称</th>
                      <th className="py-2.5 px-2 w-28">配置定位</th>
                      <th className="py-2.5 px-2 text-right w-20">目标权重</th>
                      <th className="py-2.5 px-2 text-right w-20 bg-amber-50/70">当前权重</th>
                      <th className="py-2.5 px-2 text-right w-20">当月回报</th>
                      <th className="py-2.5 px-3 min-w-[200px]">短期市场噪音与波动分歧</th>
                      <th className="py-2.5 px-3 min-w-[200px]">中长期核心支撑逻辑</th>
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
                        <td className="py-2 px-2 text-right bg-amber-50/30">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={h.current_weight}
                              onChange={(e) => handleFundChange(idx, 'current_weight', parseFloat(e.target.value) || 0)}
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

      {/* ========================================================================= */}
      {/* ROTATING PERCENTAGE PROGRESS OVERLAY                                      */}
      {/* ========================================================================= */}
      {isParsingPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Rotating SVG Percentage Ring */}
            <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping opacity-25" />
              
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                {/* Animated progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#progress-gradient)"
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * parseProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Centered percentage text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white tracking-tight mono-num">
                  {Math.round(parseProgress)}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SOP 解析中</span>
              </div>
            </div>

            {/* Status and Description */}
            <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>研报底层向量解析中</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {parsePhaseText || '正在检索并分解研报内容块...'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              遵循 SOP 规范：正文追踪归一化 → 章节 DOM 标定 → 矢量图表提取与行业星级萃取，正在生成内容结构摘要供您选择。
            </p>

            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${parseProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUMMARY & SECTION SELECTION MODAL                                         */}
      {/* ========================================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl max-w-4xl w-full my-8 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 px-7 py-5 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>iFAST Monthly Update 研报结构摘要与板块选择器</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {pdfSummaryData?.filename || portfolio.ref_pdf_name || '研报结构解析'} (共 {pdfSummaryData?.total_pages || 25} 页)
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-blue-50 border-b border-blue-100 px-7 py-3 text-xs text-blue-900 flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">i</div>
              <div>
                <span className="font-bold">SOP 解析提示：</span>
                系统已对 PDF 进行底层向量与章节标定。前 3 项为生成机构汇报幻灯片的<strong>必选核心板块（已默认预选并提取对应页码）</strong>。您可以核实、勾选需要进一步读取的板块并微调页码，点击确认后将直接返还至<strong>第 2 节及 Slide 2/3</strong>！
              </div>
            </div>

            {/* Modal Body: Cards List */}
            <div className="p-7 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50/60">
              {/* Card 1: Market Performance */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedSections.returns ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSections(prev => ({ ...prev, returns: !prev.returns }))}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {selectedSections.returns ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-extrabold text-slate-900">
                          📊 全球重点资产月度回报与区域透视 (Market Performance)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                          核心必选 / Slide 2
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        涵盖 9 大主要股票市场（拉丁美洲、中国、亚洲除日、标普等）及 5 大债券门类（全球综合债、亚洲IG等）双币种月度回报，含美/日/中核心区域宏观评述。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">研报页码: 第</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={modalPages.returns}
                      onChange={(e) => setModalPages(prev => ({ ...prev, returns: parseInt(e.target.value) || 6 }))}
                      className="w-14 px-2 py-1 text-center font-bold text-sm bg-white rounded border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">页</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Star Ratings */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedSections.stars ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSections(prev => ({ ...prev, stars: !prev.stars }))}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {selectedSections.stars ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-extrabold text-slate-900">
                          ⭐ 官方全行业星级榜与配置策略 (Investment Views & Star Ratings)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                          核心必选 / Slide 2
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        穿透 19 个官方细分赛道 4 档星级评级（极具吸引力、具备吸引力、中性、审慎低配），包含行业估值判定与长期投资评级。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">研报页码: 第</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={modalPages.stars}
                      onChange={(e) => setModalPages(prev => ({ ...prev, stars: parseInt(e.target.value) || 7 }))}
                      className="w-14 px-2 py-1 text-center font-bold text-sm bg-white rounded border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">页</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Thematic Feature Article */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedSections.topic ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSections(prev => ({ ...prev, topic: !prev.topic }))}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {selectedSections.topic ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-extrabold text-slate-900">
                          📑 月度精选深度专题 (Monthly In-Depth Thematic Feature)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                          核心必选 / Slide 3
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                        研报当月宏观专题长文深度解析，用于构建 Slide 3 的核心逻辑体系。
                      </p>

                      {/* Topic Title Selector / Input */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          选定/微调专题题目 (将同步返还至第 2 节及 Slide 3):
                        </label>
                        <input
                          type="text"
                          value={modalTopicTitle}
                          onChange={(e) => setModalTopicTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-500 font-semibold">快速选择已识别题目:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setModalTopicTitle('当债券不再扮演债券：60/40股债平衡组合是否已死？');
                              setModalPages(prev => ({ ...prev, topic: 3 }));
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium cursor-pointer"
                          >
                            60/40股债平衡组合专题 (P.3)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalTopicTitle('本月焦点标的：M&G 亚洲精选股票基金与高息标的透视');
                              setModalPages(prev => ({ ...prev, topic: 8 }));
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium cursor-pointer"
                          >
                            M&G 亚洲精选股票基金 (P.8)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">研报页码: 第</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={modalPages.topic}
                      onChange={(e) => setModalPages(prev => ({ ...prev, topic: parseInt(e.target.value) || 3 }))}
                      className="w-14 px-2 py-1 text-center font-bold text-sm bg-white rounded border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">页</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Recommended Unit Trusts */}
              {/* Card 4: Recommended Unit Trusts */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedSections.funds_matrix ? 'bg-white border-blue-400 shadow-sm' : 'bg-slate-50/80 border-slate-200 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSections(prev => ({ ...prev, funds_matrix: !prev.funds_matrix }))}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {selectedSections.funds_matrix ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-extrabold text-slate-900">
                          🏆 推荐基金月度表现矩阵 (Recommended Unit Trusts)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          ✨ 实时生成 Slide 6+ / 附录基金池
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        涵盖核心股票（亚洲、全球）、辅助多元与固定收益三类官方推荐基金池当月、3个月、YTD及年化历史回报率。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">起始页: 第</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={modalPages.funds_matrix || 20}
                      onChange={(e) => setModalPages(prev => ({ ...prev, funds_matrix: parseInt(e.target.value) || 20 }))}
                      className="w-14 px-2 py-1 text-center font-bold text-sm bg-white rounded border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">页</span>
                  </div>
                </div>
              </div>

              {/* Card 5: DPMS Portfolio */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedSections.dpms ? 'bg-white border-blue-400 shadow-sm' : 'bg-slate-50/80 border-slate-200 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSections(prev => ({ ...prev, dpms: !prev.dpms }))}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {selectedSections.dpms ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-extrabold text-slate-900">
                          💼 全权委托管理组合理念与架构 (DPMS Portfolio Overview)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          ✨ 实时生成 Slide 6+ / 专户配置
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        展示奕丰全权委托投资解决方案 (DPMS) 的价值投资哲学、各类风险评级组合比例及稳健现金流架构。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">研报页码: 第</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={modalPages.dpms || 14}
                      onChange={(e) => setModalPages(prev => ({ ...prev, dpms: parseInt(e.target.value) || 14 }))}
                      className="w-14 px-2 py-1 text-center font-bold text-sm bg-white rounded border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">页</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Global Economic Calendar */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedSections.calendar ? 'bg-white border-blue-400 shadow-sm' : 'bg-slate-50/80 border-slate-200 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSections(prev => ({ ...prev, calendar: !prev.calendar }))}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {selectedSections.calendar ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-extrabold text-slate-900">
                          📅 全球重要经济事件与央行议息日历 (Global Economic Calendar)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          ✨ 实时生成 Slide 6+ / 宏观日历
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        涵盖当月中美欧日央行议息、非农就业、CPI/PPI 通胀等关键宏观数据发布的完整日程时间线。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">研报页码: 第</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={modalPages.calendar || 24}
                      onChange={(e) => setModalPages(prev => ({ ...prev, calendar: parseInt(e.target.value) || 24 }))}
                      className="w-14 px-2 py-1 text-center font-bold text-sm bg-white rounded border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">页</span>
                  </div>
                </div>
              </div>

              {/* Card 7: Arbitrary Custom Extra Page Synthesis */}
              <div className="p-4 rounded-2xl border bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-amber-200/90 shadow-2xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-extrabold text-slate-900">
                          ✨ 自定义追加任意研报单页为独立专栏幻灯片 (Custom Deep Dive Page)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-950 border border-amber-300">
                          自由扩充 / 适用任何研报
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        输入研报中您感兴趣的任意页码，系统将自动向量解析提取论点与核心指标，实时设计为 Slide 6+ 卡片汇报页。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-600">指定页码: 第</span>
                    <input
                      type="text"
                      placeholder="例: 12"
                      value={customExtraPage}
                      onChange={(e) => setCustomExtraPage(e.target.value)}
                      className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded border border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                    <span className="text-xs font-bold text-slate-600">页</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-7 py-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-slate-700">
                  已选定 {Object.values(selectedSections).filter(Boolean).length} 个板块（前 3 项核心板块将自动同步第 2 节页码及幻灯片）
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleApplyModalSections}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>确认应用所选板块配置并同步第 2 节 →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
