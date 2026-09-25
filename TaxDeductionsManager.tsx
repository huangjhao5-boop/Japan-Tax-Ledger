import React, { useState } from 'react';
import {
  TaxDeductionSettings,
  FurusatoDonation,
  MedicalExpenseRecord,
  CompleteTaxReport,
} from '../types/tax';
import {
  Gift,
  Coins,
  Home,
  HeartPulse,
  Users,
  Shield,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';

interface TaxDeductionsManagerProps {
  currentYear: number;
  settings: TaxDeductionSettings;
  taxReport: CompleteTaxReport;
  furusatoDonations: FurusatoDonation[];
  medicalExpenses: MedicalExpenseRecord[];
  onUpdateSettings: (newSettings: TaxDeductionSettings) => void;
  onAddFurusato: () => void;
  onDeleteFurusato: (id: string) => void;
  onToggleOneStop: (id: string) => void;
  onAddMedical: () => void;
  onDeleteMedical: (id: string) => void;
}

export const TaxDeductionsManager: React.FC<TaxDeductionsManagerProps> = ({
  currentYear,
  settings,
  taxReport,
  furusatoDonations,
  medicalExpenses,
  onUpdateSettings,
  onAddFurusato,
  onDeleteFurusato,
  onToggleOneStop,
  onAddMedical,
  onDeleteMedical,
}) => {
  const [activeSection, setActiveSection] = useState<
    'furusato' | 'ideco' | 'housing' | 'medical' | 'dependents' | 'insurance'
  >('furusato');

  const safeFurusato = Array.isArray(furusatoDonations) ? furusatoDonations : [];
  const safeMedical = Array.isArray(medicalExpenses)
    ? medicalExpenses
    : (medicalExpenses && typeof medicalExpenses === 'object' && Array.isArray((medicalExpenses as any).records)
      ? (medicalExpenses as any).records
      : []);

  const yearFurusato = safeFurusato.filter(
    (f) => f && f.date && new Date(f.date).getFullYear() === currentYear
  );
  const yearMedical = safeMedical.filter(
    (m) => m && m.date && new Date(m.date).getFullYear() === currentYear
  );

  const uniqueMunicipalities = new Set(yearFurusato.map((f) => f.municipality.trim())).size;
  const exceedsFiveMunicipalities = uniqueMunicipalities > 5;

  // iDeCo annual savings
  const annualIdeco = settings.idecoMonthlyContribution * 12;
  const idecoTaxSaved = Math.round(
    annualIdeco * (taxReport.marginalIncomeTaxRate * 1.021 + 0.1)
  );

  // Housing loan savings
  const housingTaxSaved =
    taxReport.housingLoanCreditIncomeTax + taxReport.housingLoanCreditResidentTax;

  const sections = [
    {
      id: 'furusato',
      name: '故鄉納稅 (ふるさと納税)',
      icon: Gift,
      badge: `剩餘 ¥${taxReport.remainingFurusatoQuota.toLocaleString()}`,
      badgeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      id: 'ideco',
      name: 'iDeCo / 確定拠出年金',
      icon: Coins,
      badge: `年節稅 ¥${idecoTaxSaved.toLocaleString()}`,
      badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      id: 'housing',
      name: '住宅貸款扣除 (住宅ローン)',
      icon: Home,
      badge: settings.housingLoan.hasLoan
        ? `抵稅 ¥${housingTaxSaved.toLocaleString()}`
        : '未啟用',
      badgeColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      id: 'medical',
      name: '醫療費控除',
      icon: HeartPulse,
      badge:
        taxReport.medicalDeduction > 0
          ? `可抵扣 ¥${taxReport.medicalDeduction.toLocaleString()}`
          : '未達10萬門檻',
      badgeColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950',
    },
    {
      id: 'dependents',
      name: '扶養與配偶者控除',
      icon: Users,
      badge: `扣除額 ¥${(taxReport.spouseDeduction + taxReport.dependentDeduction).toLocaleString()}`,
      badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950',
    },
    {
      id: 'insurance',
      name: '生命與地震保險料',
      icon: Shield,
      badge: `扣除額 ¥${(taxReport.lifeInsuranceDeduction + taxReport.earthquakeDeduction).toLocaleString()}`,
      badgeColor: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Total Savings Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 border border-blue-200 dark:border-blue-900">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                減稅對策執行成果：本年度節稅總額 +¥{taxReport.totalTaxSavings.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                包含故鄉納稅返禮品價值、iDeCo 稅額返還、房貸稅額抵減、醫療費與各項保險扶養控除效益
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddFurusato}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5" />
            登記故鄉納稅
          </button>
          <button
            onClick={onAddMedical}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            登記醫療費
          </button>
        </div>
      </div>

      {/* Sections Selector Pills */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 scrollbar-none">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isSelected = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white border-slate-900 dark:border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{sec.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                  isSelected ? 'bg-white/20 text-white' : sec.badgeColor
                }`}
              >
                {sec.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: FURUSATO NOZEI */}
      {activeSection === 'furusato' && (
        <div className="space-y-5">
          {/* Limit Meter Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  故鄉納稅限度額試算與寄附進度
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  自負額僅 2,000 日圓，超過限度額的寄附款無法全額抵扣住民稅與所得稅。
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">目前剩餘可用額度</span>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ¥{taxReport.remainingFurusatoQuota.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">
                  已寄附: ¥{taxReport.actualFurusatoDonations.toLocaleString()}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  上限目安: ¥{taxReport.furusatoLimitEstimate.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (taxReport.actualFurusatoDonations / (taxReport.furusatoLimitEstimate || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Municipality count & One-stop warning */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  已寄附自治體總數:
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    exceedsFiveMunicipalities
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {uniqueMunicipalities} 個自治體 (上限 5 個)
                </span>
              </div>

              {exceedsFiveMunicipalities ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  超過 5 個自治體！One-Stop 特例已失效，務必辦理確定申告！
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  符合 5 個自治體以內，可使用 One-Stop 免確定申告
                </span>
              )}
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                寄附明細與返禮品紀錄 ({yearFurusato.length} 筆)
              </h4>
              <button
                onClick={onAddFurusato}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                新增寄附
              </button>
            </div>

            {yearFurusato.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                尚未記錄故鄉納稅捐贈。點擊「新增寄附」登記您的第一筆返禮品與自治體！
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {yearFurusato.map((donation) => (
                  <div
                    key={donation.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {donation.municipality}
                        </span>
                        <span className="text-slate-400 font-mono">{donation.date}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        返禮品：<strong className="text-amber-600 dark:text-amber-400">{donation.returnGift}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                          ¥{donation.amount.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => onToggleOneStop(donation.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
                          donation.oneStopApplied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title="點擊切換 One-Stop 特例申請狀態"
                      >
                        {donation.oneStopApplied ? '✓ 已申請 One-Stop' : '○ 未申請 One-Stop'}
                      </button>

                      <button
                        onClick={() => onDeleteFurusato(donation.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: IDECO & NISA */}
      {activeSection === 'ideco' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* iDeCo Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  iDeCo (個人型確定拠出年金)
                </h4>
                <p className="text-xs text-slate-400">小規模企業共済等掛金控除（全額所得控除）</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  每月扣繳掛金金額 (JPY)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    max="68000"
                    value={settings.idecoMonthlyContribution}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        idecoMonthlyContribution: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 shrink-0">円 / 月</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  公司無企業年金之上限通常為 23,000 円/月；公務員 12,000 円；自營業 68,000 円。
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">年間所得控除總額:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    ¥{annualIdeco.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-bold text-sm pt-1 border-t border-emerald-200/60 dark:border-emerald-900/60">
                  <span>本年度預估節省所得稅+住民稅:</span>
                  <span className="tabular-nums">+¥{idecoTaxSaved.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 新NISA Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  新 NISA (少額投資非課稅制度)
                </h4>
                <p className="text-xs text-slate-400">資本利得與股息 20.315% 永久免稅</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  本年度 NISA 投資額目標 (JPY)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    max="3600000"
                    value={settings.nisaAnnualInvestment}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        nisaAnnualInvestment: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-500 shrink-0">円 / 年</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  成長投資枠 240 萬 + つみたて投資枠 120 萬，全年上限 360 萬日圓（終身 1,800 萬日圓）。
                </p>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>一般特定帳戶稅率:</span>
                  <span className="font-semibold text-rose-600">20.315% (所得稅15%+住民稅5%+復興0.315%)</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300 font-bold">
                  <span>NISA 帳戶課稅:</span>
                  <span>0% (全額免稅，無需申告)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: HOUSING LOAN */}
      {activeSection === 'housing' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  住宅借入金等特別控除 (住宅ローン控除)
                </h4>
                <p className="text-xs text-slate-400">年末貸款餘額 × 0.7%，直接折抵所得稅與住民稅 (稅額控除)</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.housingLoan.hasLoan}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    housingLoan: { ...settings.housingLoan, hasLoan: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                啟用房貸扣除
              </span>
            </label>
          </div>

          {settings.housingLoan.hasLoan && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    年末房貸餘額 (年末残高)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    value={settings.housingLoan.balanceYearEnd}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        housingLoan: {
                          ...settings.housingLoan,
                          balanceYearEnd: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    居住開始年度 (借入年)
                  </label>
                  <input
                    type="number"
                    value={settings.housingLoan.entryYear}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        housingLoan: {
                          ...settings.housingLoan,
                          entryYear: Number(e.target.value) || currentYear,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">所得稅直接折抵額:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    -¥{taxReport.housingLoanCreditIncomeTax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">住民稅折抵額 (上限97,500円):</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    -¥{taxReport.housingLoanCreditResidentTax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300 font-bold text-sm pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span>今年實際稅金直接抵減:</span>
                  <span className="tabular-nums">+¥{housingTaxSaved.toLocaleString()}</span>
                </div>
              </div>

              {settings.housingLoan.entryYear === currentYear && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    入居首年度（第 1 年）依法必須自行至稅務署提交確定申告，第 2 年起方可隨公司年末調整辦理。
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: MEDICAL EXPENSES */}
      {activeSection === 'medical' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  醫療費控除計算
                </h4>
                <p className="text-xs text-slate-400">
                  同居生計家族的醫療費自費額扣除保險給付後，超過 10 萬日圓（或總所得 5% 取小者）的部分可自所得扣除。
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">可認列所得控除額</span>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  ¥{taxReport.medicalDeduction.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                自費醫療就診明細 ({yearMedical.length} 筆)
              </h4>
              <button
                onClick={onAddMedical}
                className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                新增醫療費
              </button>
            </div>

            {yearMedical.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                尚未登錄醫療費單據。
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {yearMedical.map((med) => (
                  <div
                    key={med.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                        <span>{med.hospitalOrPharmacy}</span>
                        <span className="text-slate-400 text-[11px]">({med.patientName})</span>
                        <span className="text-slate-400 font-mono text-[11px]">{med.date}</span>
                      </div>
                      {med.note && <p className="text-slate-500 text-[11px] mt-0.5">{med.note}</p>}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          ¥{med.amount.toLocaleString()}
                        </span>
                        {med.insuranceReimbursement > 0 && (
                          <div className="text-[10px] text-emerald-600">
                            保險補填: -¥{med.insuranceReimbursement.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteMedical(med.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: DEPENDENTS & SPOUSE */}
      {activeSection === 'dependents' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                扶養控除與配偶者控除設定
              </h4>
              <p className="text-xs text-slate-400">
                按親族年齡與收入狀況填寫，自動計入法定所得稅（38萬~63萬）與住民稅減免
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                配偶者狀態
              </label>
              <select
                value={settings.dependents.spouseType}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    dependents: {
                      ...settings.dependents,
                      spouseType: e.target.value as any,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="none">無配偶者 / 不符合配偶控除</option>
                <option value="general">適用配偶者控除 (配偶年收在 103 萬日圓以下)</option>
                <option value="special">適用配偶者特別控除 (配偶年收在 103~201 萬日圓)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                一般扶養親族人數 (16 ~ 18 歲，38萬円/人)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.dependents.children16to18}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    dependents: {
                      ...settings.dependents,
                      children16to18: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                特定扶養親族人數 (19 ~ 22 歲大學生等，63萬円/人)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.dependents.children19to22}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    dependents: {
                      ...settings.dependents,
                      children19to22: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                老人扶養親族人數 (70 歲以上父母等，48~58萬円/人)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.dependents.elderly70plus}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    dependents: {
                      ...settings.dependents,
                      elderly70plus: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: INSURANCE & BLUE RETURN */}
      {activeSection === 'insurance' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950 text-cyan-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                生命保險料・地震保險料・青色申告控除
              </h4>
              <p className="text-xs text-slate-400">
                填寫年間實際繳納的保費，系統自動依新契約法定制算所得稅（最高 12 萬）與住民稅（最高 7 萬）扣除額
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                一般生命保險料 (年間繳納額)
              </label>
              <input
                type="number"
                value={settings.insurance.generalLifeInsurance}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    insurance: {
                      ...settings.insurance,
                      generalLifeInsurance: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                介護醫療保險料 (年間繳納額)
              </label>
              <input
                type="number"
                value={settings.insurance.nursingCareInsurance}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    insurance: {
                      ...settings.insurance,
                      nursingCareInsurance: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                個人年金保險料 (年間繳納額)
              </label>
              <input
                type="number"
                value={settings.insurance.privatePensionInsurance}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    insurance: {
                      ...settings.insurance,
                      privatePensionInsurance: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                地震保險料 (年間繳納額，上限 5 萬)
              </label>
              <input
                type="number"
                value={settings.insurance.earthquakeInsurance}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    insurance: {
                      ...settings.insurance,
                      earthquakeInsurance: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                副業事業所得之「青色申告特別控除」
              </label>
              <select
                value={settings.blueReturnDeduction}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    blueReturnDeduction: Number(e.target.value) as any,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value={0}>無青色申告 (白色申告或雜所得)</option>
                <option value={100000}>10 萬日圓控除 (簡易帳簿)</option>
                <option value={550000}>55 萬日圓控除 (複式簿記)</option>
                <option value={650000}>65 萬日圓控除 (複式簿記 + e-Tax 電子申報)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
