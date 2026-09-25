import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingDown,
  Gift,
  Coins,
  Globe,
  Briefcase,
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders,
  Check,
} from 'lucide-react';
import {
  MonthlySalarySlip,
  BonusSlip,
  ExtraIncomeRecord,
  MedicalExpenseRecord,
  TaxDeductionSettings,
  CompleteTaxReport,
} from '../types/tax';
import {
  generateSmartTaxRecommendations,
  TaxRecommendation,
} from '../utils/taxAdvisorEngine';

interface SmartTaxAdvisorProps {
  salarySlips: MonthlySalarySlip[];
  bonuses: BonusSlip[];
  extraIncomes: ExtraIncomeRecord[];
  medicalExpenses: MedicalExpenseRecord[];
  settings: TaxDeductionSettings;
  report: CompleteTaxReport;
  onUpdateSettings: (newSettings: TaxDeductionSettings) => void;
  onNavigateTab: (tab: string) => void;
}

export const SmartTaxAdvisor: React.FC<SmartTaxAdvisorProps> = ({
  salarySlips,
  bonuses,
  extraIncomes,
  medicalExpenses,
  settings,
  report,
  onUpdateSettings,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showAppliedModal, setShowAppliedModal] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    return generateSmartTaxRecommendations(
      salarySlips,
      bonuses,
      extraIncomes,
      medicalExpenses,
      settings,
      report
    );
  }, [salarySlips, bonuses, extraIncomes, medicalExpenses, settings, report]);

  const filteredRecs = useMemo(() => {
    if (selectedCategory === 'all') return recommendations;
    if (selectedCategory === 'high_priority')
      return recommendations.filter((r) => r.priority === 'high');
    return recommendations.filter((r) => r.category === selectedCategory);
  }, [recommendations, selectedCategory]);

  // Calculations
  const totalPotentialSavings = recommendations
    .filter((r) => r.currentStatus !== 'applied')
    .reduce((sum, r) => sum + r.potentialSavingsJpy, 0);

  const alreadySaved = report.totalTaxSavings || 0;

  const appliedCount = recommendations.filter(
    (r) => r.currentStatus === 'applied'
  ).length;

  const handleApplyStrategy = (rec: TaxRecommendation) => {
    if (rec.id === 'rec_ideco') {
      onUpdateSettings({
        ...settings,
        idecoMonthlyContribution: 23000,
      });
      setShowAppliedModal('已將您的 iDeCo 試算設定為每月 ¥23,000！');
      setTimeout(() => setShowAppliedModal(null), 3000);
    } else if (rec.id === 'rec_blue_return') {
      onUpdateSettings({
        ...settings,
        blueReturnDeduction: 650000,
      });
      setShowAppliedModal('已將副業青色申告特別控除設定為 ¥650,000！');
      setTimeout(() => setShowAppliedModal(null), 3000);
    } else if (rec.id === 'rec_furusato') {
      onNavigateTab('deductions');
    } else {
      onNavigateTab('deductions');
    }
  };

  const getCategoryIcon = (category: TaxRecommendation['category']) => {
    switch (category) {
      case 'donation':
        return <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'pension':
        return <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'overseas':
        return <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'side_business':
        return <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'family':
        return <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'housing':
        return <Building className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showAppliedModal && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{showAppliedModal}</span>
        </div>
      )}

      {/* Top Banner: Smart Advisor Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              日本稅務智慧減稅對策顧問（現行所得稅法・地方稅法）
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              根據您的所得與支出分析，為您客製化減稅方案
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              系統已自動診斷您的給與收入（基本給、殘業手當）、夏季賞與、調薪升給及國內外額外收入。
              以下是針對您目前課稅級距（實質邊際稅率 {(report.marginalIncomeTaxRate + 10).toFixed(0)}%）最具節稅效益的法定對策。
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center min-w-[140px]">
              <span className="text-[11px] font-medium text-slate-400 block">
                預估可再省稅額
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1 block">
                +¥{totalPotentialSavings.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">每年稅金節約空間</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center min-w-[140px]">
              <span className="text-[11px] font-medium text-slate-400 block">
                已採用對策
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-blue-400 mt-1 block">
                {appliedCount} / {recommendations.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                現已節稅 ¥{alreadySaved.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        {[
          { id: 'all', label: '全部對策', count: recommendations.length },
          {
            id: 'high_priority',
            label: '⭐ 高度優先推薦',
            count: recommendations.filter((r) => r.priority === 'high').length,
          },
          { id: 'donation', label: '故鄉納稅', count: 1 },
          { id: 'pension', label: 'iDeCo年金', count: 1 },
          { id: 'overseas', label: '海外外國稅額', count: 1 },
          { id: 'side_business', label: '副業青色申告', count: 1 },
          { id: 'family', label: '海外親族撫養', count: 1 },
          { id: 'housing', label: '住宅貸款', count: 1 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === tab.id
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                selectedCategory === tab.id
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Recommendation Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecs.map((rec) => {
          const isExpanded = expandedCardId === rec.id;
          const isApplied = rec.currentStatus === 'applied';

          return (
            <div
              key={rec.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 shadow-xs ${
                isApplied
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/10'
                  : rec.priority === 'high'
                  ? 'border-blue-200 dark:border-blue-900/60 hover:border-blue-300'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {/* Card Summary Header */}
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide border ${
                            rec.priority === 'high'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {rec.priority === 'high' ? '高度推薦' : '適合評估'}
                        </span>

                        <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                          {rec.badge}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          申報管道：{rec.filingMethod}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {rec.summary}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Expected savings & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-medium text-slate-400 block">
                        預期年度節稅效果
                      </span>
                      <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {isApplied ? '已完成抵稅' : `+¥${rec.potentialSavingsJpy.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {!isApplied && (
                        <button
                          onClick={() => handleApplyStrategy(rec)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs flex items-center gap-1"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          立即套用試算
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setExpandedCardId(isExpanded ? null : rec.id)
                        }
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1"
                      >
                        <span>{isExpanded ? '收合詳情' : '法規與條件'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Accordion */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          適用條件與法規資格
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {rec.conditionDescription}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <TrendingDown className="w-4 h-4 text-emerald-600" />
                          預期節稅原理與試算
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {rec.effectDescription}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Info className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>行動步驟：{rec.actionTip}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono italic">
                        {rec.lawReference}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expat Special Guidance Card */}
      <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          在日華人／外國籍上班族（給與所得者）必知稅務合規指南
        </h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              1. 居住者身分判定
            </span>
            居住在日滿 1 年為「非永住者」，在日滿 5 年轉為「非永住者以外之居住者（永久居住者）」。滿 5 年後海外投資所得無論是否送金進日本均須全面申報。
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              2. 國外居住親族送金嚴格化
            </span>
            申報海外父母或親屬扶養，每人每年海外送金（銀行或 Wise）需滿 38 萬日圓（30~69歲），必須由申報人本人名義直匯，切勿委託他人代匯。
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              3. 副業 20 萬円條款迷思
            </span>
            副業淨所得未滿 20 萬日圓雖「免所得稅確定申告」，但依地方稅法仍須向所在地區役所/市役所提出「住民稅申告」，否則將收到補稅催繳。
          </div>
        </div>
      </div>
    </div>
  );
};
