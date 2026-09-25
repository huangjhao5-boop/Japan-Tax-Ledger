import React, { useState } from 'react';
import { TaxDeductionSettings } from '../types/tax';
import { simulatePayRaise } from '../utils/taxCalculator';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Percent,
  Coins,
  Building,
  CheckCircle,
} from 'lucide-react';

interface PayRaiseSimulatorProps {
  settings: TaxDeductionSettings;
  defaultBaseSalary?: number;
  defaultBonus?: number;
}

export const PayRaiseSimulator: React.FC<PayRaiseSimulatorProps> = ({
  settings,
  defaultBaseSalary = 445_000,
  defaultBonus = 1_570_000,
}) => {
  const [currentMonthly, setCurrentMonthly] = useState<number>(defaultBaseSalary);
  const [raiseAmount, setRaiseAmount] = useState<number>(35_000);
  const [annualBonus, setAnnualBonus] = useState<number>(defaultBonus);

  const simulation = simulatePayRaise(currentMonthly, raiseAmount, annualBonus, settings);

  const raisePercentage =
    currentMonthly > 0 ? ((raiseAmount / currentMonthly) * 100).toFixed(1) : '0';

  // Incremental deductions breakdown
  const diffSocial =
    simulation.afterReport.totalSocialInsurance - simulation.beforeReport.totalSocialInsurance;
  const diffIncomeTax =
    simulation.afterReport.finalIncomeTax - simulation.beforeReport.finalIncomeTax;
  const diffResidentTax =
    simulation.afterReport.finalResidentTax - simulation.beforeReport.finalResidentTax;

  const socialShare =
    simulation.annualGrossIncrease > 0
      ? ((diffSocial / simulation.annualGrossIncrease) * 100).toFixed(1)
      : '0';
  const incomeTaxShare =
    simulation.annualGrossIncrease > 0
      ? ((diffIncomeTax / simulation.annualGrossIncrease) * 100).toFixed(1)
      : '0';
  const residentTaxShare =
    simulation.annualGrossIncrease > 0
      ? ((diffResidentTax / simulation.annualGrossIncrease) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
          <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-900">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3>日本升薪實質手取試算器 (昇給手取りシミュレーター)</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          在日本調薪時，常出現「額面薪水增加了，但因為所得稅率跳階（5% ➔ 10% ➔ 20% ➔ 23%）與標準報酬月額調升造成厚生年金、健保增加，手取り實際入帳遠少於預期」的現象。本工具為您精確推算調薪後的實質手取金額與邊際稅損！
        </p>
      </div>

      {/* Simulator Inputs & Key Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Input Parameters */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            調薪參數設定
          </h4>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                調薪前基本月薪 (基本給)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="5000"
                  value={currentMonthly}
                  onChange={(e) => setCurrentMonthly(Math.max(100_000, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-500 shrink-0">円/月</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  預計月調薪金額 (+昇給額)
                </label>
                <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">
                  +{raisePercentage}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="5000"
                  min="0"
                  max="500000"
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 dark:text-blue-400"
                />
                <span className="text-slate-500 shrink-0">円/月</span>
              </div>

              {/* Quick Raise Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10_000, 20_000, 30_000, 50_000, 80_000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setRaiseAmount(amt)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                      raiseAmount === amt
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    +¥{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                預估年間獎金 (賞与)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="50000"
                  value={annualBonus}
                  onChange={(e) => setAnnualBonus(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-500 shrink-0">円/年</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Side-by-Side Impact Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {/* Big Take-Home Gain Callout */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/20 p-5 rounded-xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  升薪實質入帳分析
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  每月額面 +¥{simulation.monthlyGrossIncrease.toLocaleString()} ➔ 實質手取り每個月增加：
                </h4>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +¥{simulation.monthlyNetIncrease.toLocaleString()}
                </div>
                <span className="text-xs text-slate-500">
                  實質留存率 {simulation.effectiveTakeHomeRatio.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-500/20 text-xs">
              <div>
                <span className="text-slate-500">年間額面增加總額:</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                  +¥{simulation.annualGrossIncrease.toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-slate-500">年間手取り增加總額:</span>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +¥{simulation.annualNetIncrease.toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-slate-500">被稅金與社保吃掉:</span>
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  -¥{simulation.marginalTaxDrag.toLocaleString()} ({(100 - simulation.effectiveTakeHomeRatio).toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>

          {/* Where did the raise go? Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              調薪增額 ¥{simulation.annualGrossIncrease.toLocaleString()} 的去向分解
            </h4>

            {/* Segmented bar */}
            <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-white">
              <div
                style={{ width: `${simulation.effectiveTakeHomeRatio}%` }}
                className="bg-emerald-500 h-full flex items-center justify-center"
                title={`手取り: ${simulation.effectiveTakeHomeRatio.toFixed(1)}%`}
              >
                手取 {simulation.effectiveTakeHomeRatio.toFixed(0)}%
              </div>
              <div
                style={{ width: `${socialShare}%` }}
                className="bg-blue-500 h-full flex items-center justify-center"
                title={`社會保險: ${socialShare}%`}
              >
                社保
              </div>
              <div
                style={{ width: `${residentTaxShare}%` }}
                className="bg-indigo-500 h-full flex items-center justify-center"
                title={`住民稅: ${residentTaxShare}%`}
              >
                住民
              </div>
              <div
                style={{ width: `${incomeTaxShare}%` }}
                className="bg-rose-500 h-full flex items-center justify-center"
                title={`所得稅: ${incomeTaxShare}%`}
              >
                所得
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px] block">實領手取增加</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +¥{simulation.annualNetIncrease.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px] block">社會保險增加</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  +¥{diffSocial.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px] block">住民稅增加 (10%)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  +¥{diffResidentTax.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px] block">所得稅增加</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  +¥{diffIncomeTax.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Before vs After Side-by-Side Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
              調薪前後年度對比詳表
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-500 font-medium">項目</span>
                <span className="text-center font-semibold text-slate-700 dark:text-slate-300">調薪前 (現狀)</span>
                <span className="text-right font-semibold text-blue-600 dark:text-blue-400">調薪後 (+{raisePercentage}%)</span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-600 dark:text-slate-400">年間給與總額面</span>
                <span className="text-center font-mono tabular-nums">
                  ¥{simulation.beforeReport.annualEmploymentGross.toLocaleString()}
                </span>
                <span className="text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  ¥{simulation.afterReport.annualEmploymentGross.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-600 dark:text-slate-400">社會保險負擔</span>
                <span className="text-center font-mono tabular-nums">
                  ¥{simulation.beforeReport.totalSocialInsurance.toLocaleString()}
                </span>
                <span className="text-right font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  ¥{simulation.afterReport.totalSocialInsurance.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-600 dark:text-slate-400">所得稅 + 復興稅</span>
                <span className="text-center font-mono tabular-nums">
                  ¥{simulation.beforeReport.finalIncomeTax.toLocaleString()}
                </span>
                <span className="text-right font-mono tabular-nums text-rose-600 dark:text-rose-400">
                  ¥{simulation.afterReport.finalIncomeTax.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-600 dark:text-slate-400">住民稅</span>
                <span className="text-center font-mono tabular-nums">
                  ¥{simulation.beforeReport.finalResidentTax.toLocaleString()}
                </span>
                <span className="text-right font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                  ¥{simulation.afterReport.finalResidentTax.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold">
                <span className="text-emerald-900 dark:text-emerald-300">年間實質手取り</span>
                <span className="text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  ¥{simulation.beforeReport.netTakeHomePay.toLocaleString()}
                </span>
                <span className="text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  ¥{simulation.afterReport.netTakeHomePay.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
