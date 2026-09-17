import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  TrendingUp,
  Globe,
  ShieldCheck,
  ClipboardCheck,
  Sparkles,
  UploadCloud,
  Filter,
  X,
} from 'lucide-react';
import { CompleteTaxReport } from '../types/tax';

interface SidebarProps {
  currentYear: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  taxReport: CompleteTaxReport;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCleanMode: boolean;
  onToggleCleanMode: (clean: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentYear,
  activeTab,
  onSelectTab,
  taxReport,
  isOpenMobile = false,
  onCloseMobile,
  isCleanMode,
  onToggleCleanMode,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'ダッシュボード',
      sublabel: '綜合概況與稅務摘要',
      icon: LayoutDashboard,
    },
    {
      id: 'advisor',
      label: '減税推薦システム',
      sublabel: '智慧減稅對策顧問',
      icon: Sparkles,
      isSpecial: true,
    },
    {
      id: 'importer',
      label: 'スマートPDF読取',
      sublabel: 'PDF明細直接上傳',
      icon: UploadCloud,
    },
    {
      id: 'salary',
      label: '収入明細',
      sublabel: '給與・獎金明細',
      icon: FileSpreadsheet,
    },
    {
      id: 'simulator',
      label: '昇給・賞与管理',
      sublabel: '升薪手取試算',
      icon: TrendingUp,
    },
    {
      id: 'extra',
      label: '海外・国内副業',
      sublabel: '額外與海外收入追蹤',
      icon: Globe,
    },
    {
      id: 'deductions',
      label: '節税・控除対策',
      sublabel: '減稅與所得扣除',
      icon: ShieldCheck,
    },
    {
      id: 'checklist',
      label: '確定申告チェック',
      sublabel: '申告檢核清單',
      icon: ClipboardCheck,
      hasBadge: taxReport.needsFinalTaxReturn,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1E293B] text-white flex flex-col transition-transform duration-200 ease-in-out shrink-0 select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded mr-2.5 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              税
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                税金マネージャー
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">日本稅務與所得管理</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Mode Switch Banner in Sidebar */}
        <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">
              {isCleanMode ? '純淨模式 (僅上傳)' : '示範模擬模式'}
            </span>
          </div>
          <button
            onClick={() => onToggleCleanMode(!isCleanMode)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
              isCleanMode
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isCleanMode ? '切換示範' : '切換純淨'}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'simulator' && activeTab === 'pay_raise');

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center px-5 py-3 text-left transition-colors relative group ${
                  isActive
                    ? 'bg-blue-600 border-l-4 border-blue-400 text-white font-semibold'
                    : item.isSpecial
                    ? 'text-amber-300 hover:bg-slate-800 hover:text-amber-200 border-l-4 border-transparent'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mr-3 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : item.isSpecial
                      ? 'text-amber-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold block truncate leading-tight flex items-center gap-1.5">
                    {item.label}
                    {item.isSpecial && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded text-[9px] font-bold">
                        新
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate leading-none mt-0.5">
                    {item.sublabel}
                  </span>
                </div>

                {item.hasBadge && (
                  <span
                    title="需要確定申告"
                    className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30 animate-pulse ml-2 shrink-0"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Estimated Tax Widget */}
        <div className="p-5 bg-slate-900 border-t border-slate-800">
          <div className="bg-slate-800 p-3.5 rounded-lg text-xs border border-slate-700/60 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <p className="text-slate-400 text-[11px] font-medium">推定所得税額</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                {currentYear}年
              </span>
            </div>
            <p className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
              ¥{taxReport.finalIncomeTax.toLocaleString()}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-700/60 flex justify-between text-[10px] text-slate-400">
              <span>實質手取率</span>
              <span className="font-mono font-semibold text-slate-200">
                {taxReport.takeHomeRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
