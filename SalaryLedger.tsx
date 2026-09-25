import React, { useState } from 'react';
import {
  MonthlySalarySlip,
  BonusSlip,
  PayRaiseRecord,
  BonusType,
} from '../types/tax';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Calendar,
  Sparkles,
  HelpCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SalaryLedgerProps {
  currentYear: number;
  salarySlips: MonthlySalarySlip[];
  bonusSlips?: BonusSlip[];
  bonuses?: BonusSlip[];
  payRaises: PayRaiseRecord[];
  onAddSalarySlip?: () => void;
  onAddSalary?: () => void;
  onEditSalarySlip?: (slip: MonthlySalarySlip) => void;
  onEditSalary?: (slip: MonthlySalarySlip) => void;
  onDeleteSalarySlip?: (id: string) => void;
  onDeleteSalary?: (id: string) => void;
  onAddBonusSlip?: () => void;
  onAddBonus?: () => void;
  onEditBonusSlip?: (bonus: BonusSlip) => void;
  onEditBonus?: (bonus: BonusSlip) => void;
  onDeleteBonusSlip?: (id: string) => void;
  onDeleteBonus?: (id: string) => void;
  onAddPayRaise: () => void;
  onEditPayRaise?: (raise: PayRaiseRecord) => void;
  onDeletePayRaise: (id: string) => void;
  onAutoFillRemainingMonths?: () => void;
  onOpenSmartUpload?: () => void;
}

export const SalaryLedger: React.FC<SalaryLedgerProps> = ({
  currentYear,
  salarySlips,
  bonusSlips,
  bonuses,
  payRaises,
  onAddSalarySlip,
  onAddSalary,
  onEditSalarySlip,
  onEditSalary,
  onDeleteSalarySlip,
  onDeleteSalary,
  onAddBonusSlip,
  onAddBonus,
  onEditBonusSlip,
  onEditBonus,
  onDeleteBonusSlip,
  onDeleteBonus,
  onAddPayRaise,
  onEditPayRaise,
  onDeletePayRaise,
  onAutoFillRemainingMonths,
  onOpenSmartUpload,
}) => {
  const [subTab, setSubTab] = useState<'monthly' | 'bonus' | 'raises'>('monthly');
  const [expandedSlipId, setExpandedSlipId] = useState<string | null>(null);

  const actualBonuses = bonusSlips || bonuses || [];
  const handleAddSalary = onAddSalarySlip || onAddSalary || (() => {});
  const handleEditSalary = onEditSalarySlip || onEditSalary || (() => {});
  const handleDeleteSalary = onDeleteSalarySlip || onDeleteSalary || (() => {});
  const handleAddBonus = onAddBonusSlip || onAddBonus || (() => {});
  const handleEditBonus = onEditBonusSlip || onEditBonus;
  const handleDeleteBonus = onDeleteBonusSlip || onDeleteBonus || (() => {});

  // Filter for current year
  const yearSalarySlips = salarySlips
    .filter((s) => s.year === currentYear)
    .sort((a, b) => a.month - b.month);

  const yearBonusSlips = actualBonuses
    .filter((b) => b.year === currentYear)
    .sort((a, b) => a.month - b.month);

  // Totals for monthly slips
  const totalMonthlyGross = yearSalarySlips.reduce((sum, s) => {
    if (s.taxableGross !== undefined && s.taxableGross > 0) {
      return sum + s.taxableGross;
    }
    return sum + (s.baseSalary + s.overtimePay + s.allowances - (s.absenceDeduction || 0));
  }, 0);
  const totalMonthlyCommute = yearSalarySlips.reduce((sum, s) => sum + (s.commuteAllowance || 0), 0);
  const totalMonthlySocial = yearSalarySlips.reduce(
    (sum, s) => sum + s.healthInsurance + s.welfarePension + s.employmentInsurance,
    0
  );
  const totalMonthlyTax = yearSalarySlips.reduce((sum, s) => sum + s.incomeTax + s.residentTax, 0);
  const totalMonthlyNet = yearSalarySlips.reduce((sum, s) => {
    if (s.netPay !== undefined && s.netPay > 0) {
      return sum + s.netPay;
    }
    const tGross =
      s.taxableGross ||
      s.baseSalary + s.overtimePay + s.allowances - (s.absenceDeduction || 0);
    const totGross = tGross + (s.commuteAllowance || 0);
    const totalDeds =
      s.healthInsurance +
      s.welfarePension +
      s.employmentInsurance +
      s.incomeTax +
      s.residentTax +
      (s.otherDeductions || 0);
    return sum + (totGross - totalDeds);
  }, 0);

  // Totals for bonus slips
  const totalBonusGross = yearBonusSlips.reduce((sum, b) => sum + b.grossAmount, 0);
  const totalBonusSocial = yearBonusSlips.reduce(
    (sum, b) => sum + b.healthInsurance + b.welfarePension + b.employmentInsurance,
    0
  );
  const totalBonusTax = yearBonusSlips.reduce((sum, b) => sum + b.incomeTax, 0);
  const totalBonusNet = totalBonusGross - totalBonusSocial - totalBonusTax;

  const toggleExpand = (id: string) => {
    setExpandedSlipId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Friendly Guidance Banner for Corrections & Re-upload */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>明細校正與重新辨識指南：</strong>匯入後若發現任何數字、月份或類別不對，您可以隨時點擊每筆右側的 <strong className="text-slate-900 dark:text-white">✏️「編輯 / 校正」</strong>直接修正，或點擊右上角 <strong className="text-blue-600 dark:text-blue-400">「智慧上傳 PDF」</strong>重新拖曳文件覆蓋。
          </span>
        </div>
        {onOpenSmartUpload && (
          <button
            onClick={onOpenSmartUpload}
            className="shrink-0 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>重新解析 PDF</span>
            <span>➔</span>
          </button>
        )}
      </div>

      {/* Sub tabs & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            id="subtab-monthly"
            onClick={() => setSubTab('monthly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              subTab === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            月給明細 ({yearSalarySlips.length} 個月)
          </button>
          <button
            id="subtab-bonus"
            onClick={() => setSubTab('bonus')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              subTab === 'bonus'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            賞與獎金 ({yearBonusSlips.length} 筆)
          </button>
          <button
            id="subtab-raises"
            onClick={() => setSubTab('raises')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              subTab === 'raises'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            升薪歷程 ({payRaises.length} 次)
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {subTab === 'monthly' && yearSalarySlips.length < 12 && onAutoFillRemainingMonths && (
            <button
              id="btn-autofill-months"
              onClick={onAutoFillRemainingMonths}
              title="按最近月份薪資自動補齊剩餘未登錄月份"
              className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-900 transition flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              自動補齊整年
            </button>
          )}

          {onOpenSmartUpload && (
            <button
              id="btn-smart-upload-salary"
              onClick={onOpenSmartUpload}
              title="智慧讀取薪資單/獎金單 PDF"
              className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-900 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              智慧上傳 PDF
            </button>
          )}

          {subTab === 'monthly' && (
            <button
              id="btn-add-salary"
              onClick={handleAddSalary}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              登記月薪單
            </button>
          )}

          {subTab === 'bonus' && (
            <button
              id="btn-add-bonus"
              onClick={handleAddBonus}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              登記獎金單
            </button>
          )}

          {subTab === 'raises' && (
            <button
              id="btn-add-raise"
              onClick={onAddPayRaise}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              記錄升薪事件
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: MONTHLY SALARY SLIPS */}
      {subTab === 'monthly' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500">已記錄月份額面合計:</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                ¥{totalMonthlyGross.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-slate-500">已扣社會保險合計:</span>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                ¥{totalMonthlySocial.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-slate-500">已扣稅金 (所得+住民):</span>
              <div className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                ¥{totalMonthlyTax.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-slate-500">實質手取り合計:</span>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                ¥{totalMonthlyNet.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Slips List */}
          {yearSalarySlips.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                尚未登記 {currentYear} 年的月薪明細
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                點擊「登記月薪單」或切換到示範數據，即可查看詳細的日本給與明細、健保、厚生年金與源泉稅。
              </p>
              <button
                onClick={handleAddSalary}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs"
              >
                立即登記第一筆月薪
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {yearSalarySlips.map((slip) => {
                const taxableGross =
                  slip.taxableGross !== undefined && slip.taxableGross > 0
                    ? slip.taxableGross
                    : slip.baseSalary + slip.overtimePay + slip.allowances - (slip.absenceDeduction || 0);
                const totalGross =
                  slip.totalGross !== undefined && slip.totalGross > 0
                    ? slip.totalGross
                    : taxableGross + slip.commuteAllowance;
                const socTotal =
                  slip.socialInsuranceTotal !== undefined && slip.socialInsuranceTotal > 0
                    ? slip.socialInsuranceTotal
                    : slip.healthInsurance + slip.welfarePension + slip.employmentInsurance;
                const totalDeductions =
                  slip.totalDeductions !== undefined && slip.totalDeductions > 0
                    ? slip.totalDeductions
                    : socTotal + slip.incomeTax + slip.residentTax + (slip.otherDeductions || 0);
                const netPay =
                  slip.netPay !== undefined && slip.netPay > 0
                    ? slip.netPay
                    : totalGross - totalDeductions;
                const isExpanded = expandedSlipId === slip.id;

                return (
                  <div
                    key={slip.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
                  >
                    {/* Primary Row */}
                    <div
                      onClick={() => toggleExpand(slip.id)}
                      className="p-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
                          {slip.month}月
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {slip.year}年 {slip.month}月份 給與明細
                            </span>
                            {slip.employeeName && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium">
                                {slip.employeeName}
                              </span>
                            )}
                            {slip.confidenceScore && slip.confidenceScore >= 0.95 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                                100% 辨識平衡
                              </span>
                            )}
                            {slip.note && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                                {slip.note}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span>基本給: ¥{slip.baseSalary.toLocaleString()}</span>
                            {slip.overtimePay > 0 && (
                              <span className="text-blue-600 dark:text-blue-400">
                                残業代: ¥{slip.overtimePay.toLocaleString()}
                                {slip.attendance?.overtimeHours ? ` (${slip.attendance.overtimeHours}h)` : ''}
                              </span>
                            )}
                            {slip.absenceDeduction && slip.absenceDeduction > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                欠勤控除: -¥{slip.absenceDeduction.toLocaleString()}
                                {slip.attendance?.absenceDays ? ` (${slip.attendance.absenceDays}日)` : ''}
                              </span>
                            ) : null}
                            <span className="text-slate-600 dark:text-slate-400">
                              課稅合計: ¥{taxableGross.toLocaleString()}
                            </span>
                            {slip.commuteAllowance > 0 && (
                              <span className="text-slate-400">
                                非課稅通勤: ¥{slip.commuteAllowance.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amounts and Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400">総支給 ¥{totalGross.toLocaleString()}</div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            手取り ¥{netPay.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSalary(slip);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="編輯 / 重新校正"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSalary(slip.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-slate-400 p-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Collapsible Breakdown */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
                        {slip.attendance && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="font-semibold text-slate-900 dark:text-white">勤怠統計：</span>
                            <span>出勤 {slip.attendance.actualWorkDays || 0} 日</span>
                            <span>/</span>
                            <span>要勤務 {slip.attendance.workDays || 0} 日</span>
                            <span>/</span>
                            <span className="text-rose-600 font-semibold">欠勤 {slip.attendance.absenceDays || 0} 日</span>
                            <span>/</span>
                            <span className="text-blue-600 font-semibold">殘業 {slip.attendance.overtimeHours || 0} 小時</span>
                            <span>/</span>
                            <span>通勤 {slip.attendance.commuteDays || 0} 日</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[11px] text-slate-500 block">健康保険料</span>
                            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                              ¥{slip.healthInsurance.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[11px] text-slate-500 block">厚生年金保険</span>
                            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                              ¥{slip.welfarePension.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[11px] text-slate-500 block">雇用保険料</span>
                            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                              ¥{slip.employmentInsurance.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[11px] text-slate-500 block">源泉所得税</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                              ¥{slip.incomeTax.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[11px] text-slate-500 block">住民税 (特別徴収)</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                              ¥{slip.residentTax.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[11px] text-slate-500 block">
                              その他扣除 {slip.otherDeductionsNote ? `(${slip.otherDeductionsNote})` : ''}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                              ¥{slip.otherDeductions.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Deductions & Net Pay Reconciliation Equation */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100/70 dark:bg-slate-900/60 rounded-lg border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">控除平衡核算：</span>
                            <span>法定控除小計 ¥{(slip.healthInsurance + slip.welfarePension + slip.employmentInsurance + slip.incomeTax + slip.residentTax).toLocaleString()}</span>
                            <span>+</span>
                            <span>その他扣除 ¥{(slip.otherDeductions || 0).toLocaleString()}</span>
                            <span>=</span>
                            <span className="font-bold text-slate-900 dark:text-white">總控除計 ¥{totalDeductions.toLocaleString()}</span>
                          </div>
                          <div className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                            總支給 ¥{totalGross.toLocaleString()} - 控除計 ¥{totalDeductions.toLocaleString()} = 實領手取 ¥{netPay.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BONUS SLIPS */}
      {subTab === 'bonus' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>日本賞與 (獎金) 扣稅機制小知識：</strong>
              <p className="mt-0.5 text-amber-800/90 dark:text-amber-400/90">
                獎金的社會保險料按額面全額扣繳（健保約 4.99%、厚生年金 9.15% 上限單次 150 萬日圓）；源泉所得稅率則依據「前月份基本薪與扶養人數」計算，通常扣繳 4% ~ 18% 不等。
              </p>
            </div>
          </div>

          {yearBonusSlips.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                尚未登記 {currentYear} 年的獎金紀錄
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                日本企業通常於 6~7 月發放夏季賞與、12 月發放冬季賞與，點擊上方按鈕記錄您的獎金。
              </p>
              <button
                onClick={handleAddBonus}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs"
              >
                登記獎金單
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {yearBonusSlips.map((bonus) => {
                const totalDeductions =
                  bonus.healthInsurance +
                  bonus.welfarePension +
                  bonus.employmentInsurance +
                  bonus.incomeTax +
                  bonus.otherDeductions;
                const net = bonus.grossAmount - totalDeductions;
                const bonusTypeLabels: Record<BonusType, string> = {
                  summer: '夏季賞與 (Summer)',
                  winter: '冬季賞與 (Winter)',
                  performance: '業績決算賞與',
                  other: '其他特別獎金',
                };

                return (
                  <div
                    key={bonus.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {bonusTypeLabels[bonus.bonusType]}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                          {bonus.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          發放時間：{bonus.year} 年 {bonus.month} 月
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {handleEditBonus && (
                          <button
                            onClick={() => handleEditBonus(bonus)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                            title="編輯 / 手動校正獎金明細"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBonus(bonus.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500">賞與額面 (Gross)</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                          ¥{bonus.grossAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">實質手取り (Net)</span>
                        <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ¥{net.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div className="flex justify-between">
                        <span>健康保險:</span>
                        <span className="tabular-nums">¥{bonus.healthInsurance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>厚生年金:</span>
                        <span className="tabular-nums">¥{bonus.welfarePension.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>雇用保險:</span>
                        <span className="tabular-nums">¥{bonus.employmentInsurance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 dark:text-rose-400">
                        <span>源泉所得稅:</span>
                        <span className="tabular-nums font-semibold">¥{bonus.incomeTax.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PAY RAISES */}
      {subTab === 'raises' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>升薪與日本邊際稅率提醒：</strong>
              <p className="mt-0.5 text-blue-800/90 dark:text-blue-400/90">
                日本每年 4 月通常為定期昇給與春闘調薪時期。基本給調薪除了會增加所得稅率級距外，9 月份還會重新計算「標準報酬月額（4,5,6月平均）」，進而增加厚生年金與健保負擔。您可在「升薪手取試算」頁面精確分析升薪後的實質手取！
              </p>
            </div>
          </div>

          {payRaises.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <TrendingUp className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                尚無記錄升薪事件
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                記錄每次的調薪時間、調薪金額與原因，追蹤您在日本職涯的薪資成長軌跡。
              </p>
              <button
                onClick={onAddPayRaise}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs"
              >
                記錄調薪事件
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {payRaises.map((raise) => {
                const percent =
                  raise.previousBaseSalary > 0
                    ? ((raise.monthlyIncrease / raise.previousBaseSalary) * 100).toFixed(1)
                    : '0';

                return (
                  <div
                    key={raise.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {raise.effectiveDate} 調薪
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            +{percent}%
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                          調薪理由：{raise.reason}
                        </p>
                        {raise.note && <p className="text-xs text-slate-400 mt-0.5">{raise.note}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">
                          ¥{raise.previousBaseSalary.toLocaleString()} ➔ ¥{raise.newBaseSalary.toLocaleString()}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +¥{raise.monthlyIncrease.toLocaleString()} / 月
                        </div>
                        <div className="text-[11px] text-slate-500">
                          年額面預估 +¥{(raise.monthlyIncrease * 12).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {onEditPayRaise && (
                          <button
                            onClick={() => onEditPayRaise(raise)}
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                            title="編輯 / 手動校正調薪紀錄"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeletePayRaise(raise.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
