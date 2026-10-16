import React from 'react';
import { ViewMode, Language } from '../../types';
import { getDictionary } from '../../i18n';
import { 
  LayoutDashboard, 
  Presentation, 
  Columns, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Check, 
  Globe,
  SlidersHorizontal
} from 'lucide-react';

interface TopNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onExportPdf: () => void;
  onSyncSheet: () => void;
  onSaveConfig: () => void;
  isExporting: boolean;
  isSyncing: boolean;
  isSaved: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  viewMode,
  setViewMode,
  lang,
  setLang,
  onExportPdf,
  onSyncSheet,
  onSaveConfig,
  isExporting,
  isSyncing,
  isSaved
}) => {
  const t = getDictionary(lang);

  const scrollToSlide = (slideId: string) => {
    if (viewMode === 'dashboard') {
      setViewMode('presentation');
      setTimeout(() => {
        const el = document.getElementById(slideId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(slideId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="no-print bg-[#0b1329] border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-[1700px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-black text-white text-base shadow-sm">
            HR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">{t.nav_title}</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {lang === 'en' ? 'React + Vite 60FPS' : '现代响应式投研工作台'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">{t.nav_sub}</p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.nav_dashboard}</span>
          </button>

          <button
            onClick={() => setViewMode('presentation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'presentation'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>{t.nav_presentation}</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'split'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{t.nav_split}</span>
          </button>

          <button
            onClick={() => setViewMode('factsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'factsheet'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.nav_factsheet}</span>
          </button>
        </div>

        {/* Slide Anchors (visible in presentation or split mode) */}
        {(viewMode === 'presentation' || viewMode === 'split') && (
          <div className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button onClick={() => scrollToSlide('slide1')} className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300">
              {lang === 'en' ? 'S1 Memo' : '第1页 总览'}
            </button>
            <button onClick={() => scrollToSlide('slide2')} className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300">
              {lang === 'en' ? 'S2 Macro' : '第2页 宏观'}
            </button>
            <button onClick={() => scrollToSlide('slide3')} className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300">
              {lang === 'en' ? 'S3 60/40' : '第3页 专题'}
            </button>
            <button onClick={() => scrollToSlide('slide4')} className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300">
              {lang === 'en' ? 'S4 Conviction' : '第4页 信念'}
            </button>
            <button onClick={() => scrollToSlide('slide5')} className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300">
              {lang === 'en' ? 'S5 Legal' : '第5页 合规'}
            </button>
          </div>
        )}

        {/* Action Controls: Lang Toggle, Sync, Save, Export */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setLang('zh')}
              className={`px-2 py-1 rounded text-xs font-bold transition ${
                lang === 'zh' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded text-xs font-bold transition ${
                lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={onSyncSheet}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition disabled:opacity-50"
            title={lang === 'en' ? 'Pull latest NAV & weights from Google Sheet' : '从谷歌云端表同步最新净值与权重'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isSyncing ? (lang === 'en' ? 'Syncing...' : '同步中...') : t.btn_sync}
            </span>
          </button>

          {/* Save Button */}
          <button
            onClick={onSaveConfig}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isSaved
                ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title={lang === 'en' ? 'Save custom settings to backend config' : '保存当前设定至后端配置'}
          >
            <Check className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isSaved ? (lang === 'en' ? 'Saved' : '已保存') : t.btn_save}
            </span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-sm transition disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? (lang === 'en' ? 'Exporting...' : '导出中...') : t.btn_print_pdf}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
