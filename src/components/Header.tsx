import React from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Menu,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileUp,
  Filter,
} from 'lucide-react';
import { CompleteTaxReport } from '../types/tax';

interface HeaderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  taxReport: CompleteTaxReport;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onToggleMobileMenu?: () => void;
  isCleanMode: boolean;
  onToggleCleanMode: (clean: boolean) => void;
  userName?: string;
  onOpenSmartUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  onYearChange,
  taxReport,
  onResetData,
  onExportData,
  onImportData,
  onToggleMobileMenu,
  isCleanMode,
  onToggleCleanMode,
  userName = '給与所得者 様',
  onOpenSmartUpload,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      e.target.value = '';
    }
  };

  const displayName = userName.replace(/様$/, '').trim();
  const shortAvatar = displayName.slice(0, 2) || '黄';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
      {/* Left side: Mobile menu toggle + Year & Simulation Status */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg lg:hidden"
            title="開啟選單"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 hidden md:inline">
            {currentYear}年度 日本稅務記帳
          </span>

          {taxReport.needsFinalTaxReturn ? (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 border border-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              要確定申告
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              計算完了
            </span>
          )}
        </div>

        {/* Year segmented control */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          {[2025, 2026, 2027].map((year) => (
            <button
              key={year}
              id={`btn-year-${year}`}
              onClick={() => onYearChange(year)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                currentYear === year
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {year}年
            </button>
          ))}
        </div>

        {/* Mode Segmented Control (Clean vs Demo) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onToggleCleanMode(true)}
            title="🌿 純淨實際模式：消除所有 12 個月模擬示範資料，僅依據您真實上傳或登記的明細結算"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              isCleanMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span className="hidden sm:inline">純淨模式</span>
            <span className="sm:hidden">純淨</span>
          </button>
          <button
            onClick={() => onToggleCleanMode(false)}
            title="📊 示範模擬模式：載入 2026 年 12 個月完整薪資、獎金、故鄉納稅與各項扣除額供體驗"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              !isCleanMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">示範模擬</span>
            <span className="sm:hidden">示範</span>
          </button>
        </div>
      </div>

      {/* Right side: Smart Upload + Backup actions + User profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Smart PDF Upload Trigger Button */}
        {onOpenSmartUpload && (
          <button
            onClick={onOpenSmartUpload}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">智慧上傳 PDF</span>
            <span className="sm:hidden">上傳</span>
          </button>
        )}

        {/* Backup Actions */}
        <div className="flex items-center gap-1">
          <button
            id="btn-export-data"
            onClick={onExportData}
            title="匯出備份 JSON"
            className="p-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-import-data"
            onClick={() => fileInputRef.current?.click()}
            title="匯入 JSON 備份"
            className="p-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            id="btn-reset-data"
            onClick={onResetData}
            title="重設為示範數據"
            className="p-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Persona */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {userName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              {isCleanMode ? '個人帳本 / 給与所得者' : '示範模擬企業 / 給与所得者'}
            </p>
          </div>
          <div
            title={`使用者：${userName}`}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20 shadow-2xs"
          >
            {shortAvatar}
          </div>
        </div>
      </div>
    </header>
  );
};
