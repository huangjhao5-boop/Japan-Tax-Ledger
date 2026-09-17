import React, { useState } from 'react';
import {
  ExtraIncomeRecord,
  ExtraIncomeType,
  TaxCategory,
} from '../types/tax';
import {
  Plus,
  Trash2,
  Globe2,
  Building,
  AlertCircle,
  TrendingUp,
  Receipt,
  CheckCircle2,
  DollarSign,
  PieChart,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface ExtraIncomeLedgerProps {
  currentYear: number;
  extraIncomes: ExtraIncomeRecord[];
  onAddExtraIncome?: () => void;
  onSaveExtraIncome?: (income: ExtraIncomeRecord) => void;
  onDeleteExtraIncome: (id: string) => void;
}

export const ExtraIncomeLedger: React.FC<ExtraIncomeLedgerProps> = ({
  currentYear,
  extraIncomes,
  onAddExtraIncome,
  onSaveExtraIncome,
  onDeleteExtraIncome,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'domestic' | 'overseas'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Form State for easy direct input
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ExtraIncomeType>('domestic_side_gig');
  const [date, setDate] = useState(`${currentYear}-06-15`);
  const [currency, setCurrency] = useState<'JPY' | 'USD' | 'TWD' | 'EUR'>('JPY');
  const [amount, setAmount] = useState<number | ''>('');
  const [expenses, setExpenses] = useState<number | ''>(0);
  const [isOverseas, setIsOverseas] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [overseasTaxWithheld, setOverseasTaxWithheld] = useState<number | ''>(0);
  const [note, setNote] = useState('');

  // Handle currency change default rate
  const handleCurrencyChange = (newCurr: 'JPY' | 'USD' | 'TWD' | 'EUR') => {
    setCurrency(newCurr);
    if (newCurr === 'JPY') {
      setExchangeRate(1);
    } else if (newCurr === 'USD') {
      setExchangeRate(155);
      setIsOverseas(true);
    } else if (newCurr === 'TWD') {
      setExchangeRate(4.8);
      setIsOverseas(true);
    } else if (newCurr === 'EUR') {
      setExchangeRate(165);
      setIsOverseas(true);
    }
  };

  // Filter current year
  const yearIncomes = extraIncomes.filter((item) => {
    const itemYear = new Date(item.date).getFullYear();
    return itemYear === currentYear;
  });

  const displayedIncomes = yearIncomes.filter((item) => {
    if (filterType === 'domestic') return !item.isOverseas;
    if (filterType === 'overseas') return item.isOverseas;
    return true;
  });

  // Category Definitions
  const categories: {
    key: ExtraIncomeType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    defaultOverseas: boolean;
  }[] = [
    {
      key: 'domestic_side_gig',
      label: '國內副業 (業務委託/雜所得)',
      sublabel: '日本境內接案、諮詢、設計、程式開發',
      icon: <Building className="w-4 h-4 text-blue-500" />,
      defaultOverseas: false,
    },
    {
      key: 'domestic_dividend',
      label: '國內配當所得 (日本股票股息)',
      sublabel: '日本國內上場或非上場株式配當',
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      defaultOverseas: false,
    },
    {
      key: 'overseas_dividend',
      label: '海外股息 (美股/外國ETF)',
      sublabel: '美國 IRS 預扣 10% 股息、外國法人生產分紅',
      icon: <Globe2 className="w-4 h-4 text-purple-500" />,
      defaultOverseas: true,
    },
    {
      key: 'overseas_salary',
      label: '海外遠端薪資/跨國顧問',
      sublabel: '境外雇主發放、Upwork、跨國合約',
      icon: <Globe2 className="w-4 h-4 text-indigo-500" />,
      defaultOverseas: true,
    },
    {
      key: 'overseas_crypto',
      label: '海外暗號資產/虛擬貨幣',
      sublabel: 'Binance、Bybit 境外交易所買賣利得',
      icon: <DollarSign className="w-4 h-4 text-amber-500" />,
      defaultOverseas: true,
    },
    {
      key: 'other',
      label: '其他雜所得/資產處分',
      sublabel: '書籍版稅、演講稿費、其他非給與所得',
      icon: <Receipt className="w-4 h-4 text-slate-500" />,
      defaultOverseas: false,
    },
  ];

  // Aggregation per Category
  const categorySummary = categories.map((cat) => {
    const items = yearIncomes.filter((i) => i.type === cat.key);
    const gross = items.reduce((sum, i) => sum + i.amountJpy, 0);
    const exp = items.reduce((sum, i) => sum + i.expensesJpy, 0);
    const net = Math.max(0, gross - exp);
    const foreignTax = items.reduce((sum, i) => sum + (i.overseasTaxWithheldJpy || 0), 0);
    return {
      ...cat,
      count: items.length,
      gross,
      expenses: exp,
      net,
      foreignTax,
    };
  });

  // Totals
  const totalDomesticGross = yearIncomes
    .filter((i) => !i.isOverseas)
    .reduce((sum, i) => sum + i.amountJpy, 0);

  const totalDomesticExpenses = yearIncomes
    .filter((i) => !i.isOverseas)
    .reduce((sum, i) => sum + i.expensesJpy, 0);

  const totalDomesticNet = Math.max(0, totalDomesticGross - totalDomesticExpenses);

  const totalOverseasGross = yearIncomes
    .filter((i) => i.isOverseas)
    .reduce((sum, i) => sum + i.amountJpy, 0);

  const totalOverseasExpenses = yearIncomes
    .filter((i) => i.isOverseas)
    .reduce((sum, i) => sum + i.expensesJpy, 0);

  const totalOverseasNet = Math.max(0, totalOverseasGross - totalOverseasExpenses);

  const totalOverseasTaxWithheld = yearIncomes
    .filter((i) => i.isOverseas)
    .reduce((sum, i) => sum + (i.overseasTaxWithheldJpy || 0), 0);

  const totalSideNetIncome = totalDomesticNet + totalOverseasNet;
  const totalSideGrossIncome = totalDomesticGross + totalOverseasGross;
  const isOver200k = totalSideNetIncome > 200_000;

  // Handle Easy Form Submit
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const parsedAmount = Number(amount);
    const parsedExpenses = Number(expenses) || 0;
    const rate = currency === 'JPY' ? 1 : Number(exchangeRate) || 1;
    const amountJpy = Math.round(parsedAmount * rate);
    const expensesJpy = Math.round(parsedExpenses * rate);
    const netIncomeJpy = Math.max(0, amountJpy - expensesJpy);
    const foreignTaxJpy = isOverseas ? Math.round(Number(overseasTaxWithheld || 0) * rate) : 0;

    const newRecord: ExtraIncomeRecord = {
      id: `extra-${Date.now()}`,
      title,
      type,
      date,
      currency,
      originalAmount: parsedAmount,
      exchangeRate: rate,
      amountJpy,
      expensesJpy,
      netIncomeJpy,
      isOverseas,
      taxCategory: type === 'domestic_dividend' || type === 'overseas_dividend' ? 'dividend' : 'miscellaneous',
      overseasTaxWithheldJpy: foreignTaxJpy,
      note,
    };

    if (onSaveExtraIncome) {
      onSaveExtraIncome(newRecord);
    }

    // Reset Form
    setTitle('');
    setAmount('');
    setExpenses(0);
    setOverseasTaxWithheld(0);
    setNote('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 20萬日圓申告門檻診斷條 (20-man Rule Bar) */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isOver200k
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        } space-y-3 shadow-xs`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {isOver200k ? (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                年度副業與額外淨所得：¥{totalSideNetIncome.toLocaleString()} / 200,000 円法定申報門檻
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {isOver200k
                  ? '已超過 20 萬日圓門檻！依日本國稅廳規定，給與所得者副業淨額超過 20 萬円時，依法必須在翌年 2/16～3/15 辦理「所得稅確定申告」。'
                  : '未超過 20 萬日圓門檻：免向國稅局提交「所得稅確定申告」；但請注意：依日本地方稅法，無論金額多少仍須向居住地役所提出「住民稅申告」！'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 shadow-xs ${
              isOver200k ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isOver200k ? '義務：必須確定申告' : '免所得稅申告'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOver200k ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (totalSideNetIncome / 200_000) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>¥0</span>
            <span>20 萬円門檻</span>
            <span>¥{totalSideNetIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Top 3 High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-blue-500" />
              國內副業淨所得
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 font-semibold">
              國內來源
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums">
            ¥{totalDomesticNet.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>毛收: ¥{totalDomesticGross.toLocaleString()}</span>
            <span>認列經費: ¥{totalDomesticExpenses.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Globe2 className="w-4 h-4 text-purple-500" />
              海外所得淨額 (換算日圓)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 font-semibold">
              國外來源
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums">
            ¥{totalOverseasNet.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>毛收: ¥{totalOverseasGross.toLocaleString()}</span>
            <span>認列經費: ¥{totalOverseasExpenses.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5 font-semibold">
              <Receipt className="w-4 h-4" />
              外國稅額已扣繳 (可抵扣)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
              二重課稅解消
            </span>
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2 tabular-nums">
            ¥{totalOverseasTaxWithheld.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            美股配當或境外所得已被扣繳，確定申告時可辦理「外國稅額控除」
          </p>
        </div>
      </div>

      {/* 整合性匯總視圖：各類收入分類總額 (Integrated Category Summary View) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              各類額外與海外收入分類匯總視圖 (Summary by Category)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            全年度總毛收入：¥{totalSideGrossIncome.toLocaleString()} ｜ 淨所得：¥{totalSideNetIncome.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categorySummary.map((cat) => (
            <div
              key={cat.key}
              className={`p-3.5 rounded-xl border transition ${
                cat.count > 0
                  ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cat.icon}
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {cat.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  {cat.count} 筆
                </span>
              </div>

              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                {cat.sublabel}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">淨所得總額:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  ¥{cat.net.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>毛額: ¥{cat.gross.toLocaleString()}</span>
                <span>經費: ¥{cat.expenses.toLocaleString()}</span>
              </div>

              {cat.foreignTax > 0 && (
                <div className="mt-1 text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                  境外已預扣: ¥{cat.foreignTax.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar: Filters & Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            全部明細 ({yearIncomes.length})
          </button>
          <button
            onClick={() => setFilterType('domestic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              filterType === 'domestic'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            國內副業 ({yearIncomes.filter((i) => !i.isOverseas).length})
          </button>
          <button
            onClick={() => setFilterType('overseas')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              filterType === 'overseas'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            海外所得 ({yearIncomes.filter((i) => i.isOverseas).length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 rounded-lg transition flex items-center gap-1.5 shadow-xs"
          >
            {isQuickAddOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isQuickAddOpen ? '收合輸入表單' : '快速直覺輸入'}</span>
          </button>

          {onAddExtraIncome && (
            <button
              id="btn-open-add-extra-modal"
              onClick={onAddExtraIncome}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              開窗登錄
            </button>
          )}
        </div>
      </div>

      {/* 輕鬆輸入表單 (Easy Inline Quick-Add Card) */}
      {isQuickAddOpen && (
        <form
          onSubmit={handleQuickSubmit}
          className="bg-white dark:bg-slate-900 rounded-xl border border-blue-300 dark:border-blue-900 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              快速登錄國內外額外收入
            </h4>
            <span className="text-xs text-slate-400">登錄後即時納入稅務計算與匯總</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Income Source Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                收入來源與項目名稱 *
              </label>
              <input
                type="text"
                required
                placeholder="例如：Upwork 海外軟體顧問、Interactive Brokers 美股配當、台灣專案外包"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                所得種類 *
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as ExtraIncomeType;
                  setType(newType);
                  const found = categories.find((c) => c.key === newType);
                  if (found) setIsOverseas(found.defaultOverseas);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                入帳日期 *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                計價幣別
              </label>
              <select
                value={currency}
                onChange={(e) =>
                  handleCurrencyChange(e.target.value as 'JPY' | 'USD' | 'TWD' | 'EUR')
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="JPY">日圓 (JPY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="TWD">新台幣 (TWD)</option>
                <option value="EUR">歐元 (EUR)</option>
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                收入金額 ({currency}) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="例如：50000"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expenses */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                必要經費 ({currency})
              </label>
              <input
                type="number"
                min="0"
                placeholder="扣除經費（例如：0）"
                value={expenses}
                onChange={(e) =>
                  setExpenses(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Exchange Rate (if not JPY) */}
            {currency !== 'JPY' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  對日圓匯率
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Overseas Toggle and Foreign Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={isOverseas}
                onChange={(e) => setIsOverseas(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-purple-600" />
                註記為「海外所得」（外國來源所得）
              </span>
            </label>

            {isOverseas && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  海外已扣繳稅額 ({currency}):
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="例如：美股 10% 預扣稅"
                  value={overseasTaxWithheld}
                  onChange={(e) =>
                    setOverseasTaxWithheld(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition"
            >
              確認登錄此筆收入
            </button>
          </div>
        </form>
      )}

      {/* Income Records List */}
      {displayedIncomes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <Globe2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            目前無此分類的額外收入記錄
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            若您有接案業務委託、技術顧問、國內外股息、海外遠端兼職或虛擬貨幣收益，請點擊上方「快速直覺輸入」按鈕輕鬆登錄。
          </p>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs"
          >
            立即登錄一筆收入
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedIncomes.map((item) => {
            const cat = categories.find((c) => c.key === item.type);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-slate-300"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      item.isOverseas
                        ? 'bg-purple-50 dark:bg-purple-950 text-purple-600'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-600'
                    }`}
                  >
                    {item.isOverseas ? (
                      <Globe2 className="w-5 h-5" />
                    ) : (
                      <Building className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          item.isOverseas
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {cat ? cat.label : item.type}
                      </span>
                      {item.isOverseas && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-600 text-white rounded">
                          海外所得
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{item.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {item.title}
                    </h4>

                    {item.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.note}
                      </p>
                    )}

                    {item.currency !== 'JPY' && (
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        原幣金額: {item.currency} {item.originalAmount.toLocaleString()} (匯率: {item.exchangeRate})
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      毛收 ¥{item.amountJpy.toLocaleString()} - 經費 ¥{item.expensesJpy.toLocaleString()}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      淨所得 ¥{item.netIncomeJpy.toLocaleString()}
                    </div>
                    {item.overseasTaxWithheldJpy > 0 && (
                      <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                        海外預扣稅: ¥{item.overseasTaxWithheldJpy.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteExtraIncome(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
