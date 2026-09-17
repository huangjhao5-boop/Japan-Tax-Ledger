import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Gift,
  Coins,
  ChevronRight,
  FileUp,
  Filter,
  Lightbulb,
  CheckCircle2,
  DollarSign,
  Globe2,
} from 'lucide-react';
import { CompleteTaxReport } from '../types/tax';

interface OverviewDashboardProps {
  currentYear?: number;
  taxReport: CompleteTaxReport;
  onNavigateTab: (tab: string) => void;
  onAddSalary?: () => void;
  onAddBonus?: () => void;
  onAddExtra?: () => void;
  onAddFurusato?: () => void;
  onOpenAddSalaryModal?: () => void;
  onOpenAddExtraModal?: () => void;
  onOpenAddFurusatoModal?: () => void;
  isCleanMode?: boolean;
  onToggleCleanMode?: (clean: boolean) => void;
  onOpenSmartUpload?: () => void;
  onClearAllCleanData?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentYear = 2026,
  taxReport,
  onNavigateTab,
  onAddSalary,
  onAddBonus,
  onAddExtra,
  onAddFurusato,
  onOpenAddSalaryModal,
  onOpenAddExtraModal,
  onOpenAddFurusatoModal,
  isCleanMode = false,
  onToggleCleanMode,
  onOpenSmartUpload,
  onClearAllCleanData,
}) => {
  const handleOpenSalary = onAddSalary || onOpenAddSalaryModal || (() => onNavigateTab('salary'));
  const handleOpenExtra = onAddExtra || onOpenAddExtraModal || (() => onNavigateTab('extra'));
  const handleOpenFurusato = onAddFurusato || onOpenAddFurusatoModal || (() => onNavigateTab('deductions'));

  const gross = taxReport.totalGrossIncome || 1;
  const netRatio = (taxReport.netTakeHomePay / gross) * 100;
  const socialRatio = (taxReport.totalSocialInsurance / gross) * 100;
  const residentRatio = (taxReport.finalResidentTax / gross) * 100;
  const incomeTaxRatio = (taxReport.finalIncomeTax / gross) * 100;

  // Marginal combined tax rate
  const marginalCombinedRate = taxReport.marginalIncomeTaxRate + 10;

  return (
    <div className="space-y-6">
      {/* Mode Status Banner: Clean Mode vs Demo Mode */}
      {isCleanMode ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg shrink-0 mt-0.5 lg:mt-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  純淨實際模式：已徹底消除所有示範模擬數據
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-700">
                  排除示範雜訊
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                已完全消除 12 個月示範薪資、示範獎金、示範故鄉納稅與示範醫療費。目前計算結果 100% 依據您真實登記或 PDF 上傳的明細。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenSmartUpload && (
              <button
                onClick={onOpenSmartUpload}
                className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <FileUp className="w-3.5 h-3.5" />
                智慧上傳 PDF
              </button>
            )}
            {onClearAllCleanData && (
              <button
                onClick={onClearAllCleanData}
                title="清空為 0 筆全新空白記帳狀態"
                className="text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition"
              >
                清空所有明細
              </button>
            )}
            {onToggleCleanMode && (
              <button
                onClick={() => onToggleCleanMode(false)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                切換示範模擬
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg shrink-0 mt-0.5 lg:mt-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                  目前處於【示範模擬模式】（載入 2026 年 12 個月模擬試算數據）
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded border border-indigo-300 dark:border-indigo-700">
                  示範資料已載入
                </span>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
                包含全年度 12 個月薪資、夏冬獎金、5 筆故鄉納稅、醫療費與房貸等完整模擬範例。若要開始記帳或僅查看自己上傳的資料，請點擊右側按鈕消除示範數據。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onToggleCleanMode && (
              <button
                onClick={() => onToggleCleanMode(true)}
                className="text-xs font-semibold px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <Filter className="w-3.5 h-3.5" />
                消除示範資料，切換純淨模式
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kakutei Shinkoku Diagnosis Banner */}
      {taxReport.needsFinalTaxReturn ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                本年度確定申告診斷提醒：您需要向稅務署提出「確定申告」
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {taxReport.taxReturnReasons[0]}
                {taxReport.taxReturnReasons.length > 1 &&
                  `（另有 ${taxReport.taxReturnReasons.length - 1} 項申報原因）`}
              </p>
            </div>
          </div>
          <button
            id="btn-view-checklist"
            onClick={() => onNavigateTab('checklist')}
            className="text-xs font-semibold px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            檢視申報檢核表
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-300">
              確定申告判定：單純給與所得且副業未達門檻，透過公司「年末調整」即可結算完納，無強制確定申告義務。
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('checklist')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 ml-2"
          >
            查看規定
          </button>
        </div>
      )}

      {/* Main Content Layout: 2 Columns on Left, 1 Column on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: 年次総収入明細 (Gross Income Breakdown) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex justify-between items-center">
              <span>收入明細總覽 (Gross Income Breakdown)</span>
              <button
                onClick={() => onNavigateTab('salary')}
                className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer hover:underline text-xs flex items-center gap-1"
              >
                明細管理
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </h2>

            {/* 4-Stat Box Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                  基本給与
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ¥{taxReport.annualSalaryGross.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  {isCleanMode ? '登記給與總額' : `月均約 ¥${Math.round(taxReport.annualSalaryGross / 12).toLocaleString()}`}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                  賞与合計
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ¥{taxReport.annualBonusGross.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  夏季・冬季支給
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                  国内副業
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ¥{taxReport.annualSideIncomeGross.toLocaleString()}
                </p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  業務委託・雜所得
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                  海外所得
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ¥{taxReport.annualOverseasIncomeGross.toLocaleString()}
                </p>
                <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 font-medium">
                  外國稅額控除可
                </p>
              </div>
            </div>

            {/* Income Deduction Cascade Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <span className="text-slate-600 dark:text-slate-300">給与所得控除額 (法定薪資免稅額)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  - ¥{taxReport.employmentDeduction.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <span className="text-slate-600 dark:text-slate-300">社会保険料控除 (健康+厚生+雇用)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  - ¥{taxReport.totalSocialInsurance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <span className="text-slate-600 dark:text-slate-300">基礎・iDeCo・扶養・其他所得控除</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  - ¥{Math.max(0, taxReport.totalIncomeDeductions - taxReport.totalSocialInsurance).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-1">
                <span className="text-slate-800 dark:text-slate-100">課税所得金額 (計稅基準)</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono text-base tabular-nums">
                  ¥{taxReport.taxableIncomeForIncomeTax.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: 所得分配與實質手取分析 (Take-Home Ratio & Tax Burden) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  所得分配與實質手取分析 (Take-Home Ratio)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  總所得額面：¥{taxReport.totalGrossIncome.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  實領手取率 {taxReport.takeHomeRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Stacked multi-segment bar */}
            <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5">
              <div
                style={{ width: `${Math.max(2, netRatio)}%` }}
                className="bg-emerald-500 h-full rounded-l transition-all"
                title={`實質手取: ¥${taxReport.netTakeHomePay.toLocaleString()} (${netRatio.toFixed(1)}%)`}
              />
              <div
                style={{ width: `${Math.max(1.5, socialRatio)}%` }}
                className="bg-blue-600 h-full transition-all"
                title={`社會保險: ¥${taxReport.totalSocialInsurance.toLocaleString()} (${socialRatio.toFixed(1)}%)`}
              />
              <div
                style={{ width: `${Math.max(1, residentRatio)}%` }}
                className="bg-indigo-500 h-full transition-all"
                title={`住民稅: ¥${taxReport.finalResidentTax.toLocaleString()} (${residentRatio.toFixed(1)}%)`}
              />
              <div
                style={{ width: `${Math.max(1, incomeTaxRatio)}%` }}
                className="bg-rose-500 h-full rounded-r transition-all"
                title={`所得稅: ¥${taxReport.finalIncomeTax.toLocaleString()} (${incomeTaxRatio.toFixed(1)}%)`}
              />
            </div>

            {/* Legend with Monospace Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  手取り (實領)
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  ¥{taxReport.netTakeHomePay.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{netRatio.toFixed(1)}%</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  社會保險
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  ¥{taxReport.totalSocialInsurance.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{socialRatio.toFixed(1)}%</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  住民稅 (10%)
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  ¥{taxReport.finalResidentTax.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{residentRatio.toFixed(1)}%</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  所得稅 (累進)
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  ¥{taxReport.finalIncomeTax.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{incomeTaxRatio.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Card 3: 個人化稅務優化進一步建議 (Personalized Tax Optimization Recommendations) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    個人化稅務進一步優化建議 (Actionable Tax Optimizations)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    基於您現階段收入水平與稅率結構，為您挑選高回報率的稅務優化策略
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('advisor')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-1"
              >
                全部對策
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Suggestion 1: Furusato */}
              <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-emerald-600" />
                    故鄉納稅剩餘額度
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    尚餘 ¥{taxReport.remainingFurusatoQuota.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  您自付 2,000 円即可獲得相當於約 ¥{Math.round(taxReport.remainingFurusatoQuota * 0.3).toLocaleString()} 的返禮品，並全額自翌年住民稅中扣抵！
                </p>
              </div>

              {/* Suggestion 2: iDeCo */}
              <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/20 dark:bg-blue-950/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-blue-600" />
                    iDeCo 個人年金節稅
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    節稅約 {(marginalCombinedRate).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  若每月提撥 ¥23,000，掛金 100% 自所得扣除，每年直接省下約 ¥{Math.round(23000 * 12 * (marginalCombinedRate / 100)).toLocaleString()} 稅款。
                </p>
              </div>

              {/* Suggestion 3: Overseas Tax / Side Business */}
              {taxReport.annualOverseasIncomeGross > 0 ? (
                <div className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/20 dark:bg-purple-950/10 space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-purple-600" />
                      海外外國稅額控除 (二重課稅消除)
                    </span>
                    <span className="text-[10px] font-semibold text-purple-600">
                      海外已扣繳可申請折抵
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    您有登記海外來源所得。在確定申告填寫「外国税額控除」，可將美股或海外已納稅款直接抵繳日本所得稅與住民稅。
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      撫養海外親族節稅 (海外居住親族扶養控除)
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600">
                      每人可減除 38~63 萬円
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    若每年定期匯款撫養海外非同居親屬（如父母），保留銀行送金關係書類與戶籍公證，可在年末調整直接抵扣高額稅賦。
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('advisor')}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                啟動智慧減稅推薦系統深入分析
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column - Professional Polish Widgets */}
        <div className="space-y-6">
          {/* Widget 1: 節税シミュレーター (Dark Slate Highlight Card) */}
          <div className="bg-[#1E293B] text-white p-6 rounded-xl shadow-md border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                節税シミュレーター
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                {currentYear}年度
              </span>
            </div>

            <div className="space-y-3">
              {/* Furusato item */}
              <div className="p-3 bg-slate-800/90 rounded-lg border-l-4 border-emerald-500">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-white">ふるさと納税 (故鄉納稅)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-medium">
                    {taxReport.remainingFurusatoQuota > 0 ? '最佳化進行中' : '已達上限'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">寄附限度額目安</p>
                <div className="flex justify-between items-baseline mt-0.5">
                  <p className="text-lg font-mono font-bold text-white tabular-nums">
                    ¥{taxReport.furusatoLimitEstimate.toLocaleString()}
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400">
                    剩餘 ¥{taxReport.remainingFurusatoQuota.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* iDeCo item */}
              <div className="p-3 bg-slate-800/90 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-white">iDeCo / 確定拠出年金</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded font-medium">
                    {taxReport.idecoDeduction > 0 ? '全額控除中' : '未設定'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">年間所得控除見込額</p>
                <div className="flex justify-between items-baseline mt-0.5">
                  <p className="text-lg font-mono font-bold text-white tabular-nums">
                    ¥{taxReport.idecoDeduction.toLocaleString()}
                  </p>
                  <span className="text-[11px] font-mono text-blue-400">
                    節稅約 ¥{Math.round(taxReport.idecoDeduction * (marginalCombinedRate / 100)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Housing Loan / Insurance item */}
              <div className="p-3 bg-slate-800/90 rounded-lg border-l-4 border-indigo-400">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-white">住宅ローン / 保險料控除</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded font-medium">
                    {taxReport.housingLoanCreditIncomeTax > 0 ? '稅額控除' : '設定完畢'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">已抵減所得稅與保險控除</p>
                <p className="text-lg font-mono font-bold text-white mt-0.5 tabular-nums">
                  ¥{(taxReport.housingLoanCreditIncomeTax + taxReport.lifeInsuranceDeduction).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              id="btn-goto-deductions"
              onClick={() => onNavigateTab('deductions')}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              節税・控除対策を管理
            </button>
          </div>

          {/* Widget 2: 快速記帳捷徑 (Quick Entry Shortcuts) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              快速記帳操作
            </h3>
            <div className="space-y-2">
              {onOpenSmartUpload && (
                <button
                  onClick={onOpenSmartUpload}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 border border-blue-200 dark:border-blue-900 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      智慧上傳明細 PDF / 樣本
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition" />
                </button>
              )}

              <button
                id="btn-quick-add-salary"
                onClick={handleOpenSalary}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    手動登記本月薪資/獎金單
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                id="btn-quick-add-extra"
                onClick={handleOpenExtra}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    登記國內副業/海外所得
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                id="btn-quick-add-furusato"
                onClick={handleOpenFurusato}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    記錄故鄉納稅 (ふるさと)
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
