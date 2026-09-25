import React, { useState } from 'react';
import { ExtraIncomeRecord, ExtraIncomeType, TaxCategory } from '../../types/tax';
import { X, Globe2 } from 'lucide-react';

interface AddExtraIncomeModalProps {
  currentYear: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ExtraIncomeRecord) => void;
}

export const AddExtraIncomeModal: React.FC<AddExtraIncomeModalProps> = ({
  currentYear,
  isOpen,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<ExtraIncomeType>('domestic_side_gig');
  const [title, setTitle] = useState<string>('技術諮詢顧問 (業務委託)');
  const [taxCategory, setTaxCategory] = useState<TaxCategory>('miscellaneous');
  const [date, setDate] = useState<string>(`${currentYear}-06-15`);
  const [currency, setCurrency] = useState<'JPY' | 'USD' | 'TWD' | 'EUR' | 'CNY'>('JPY');
  const [originalAmount, setOriginalAmount] = useState<number>(150_000);
  const [exchangeRate, setExchangeRate] = useState<number>(1.0);
  const [expensesJpy, setExpensesJpy] = useState<number>(20_000);
  const [overseasTaxWithheldJpy, setOverseasTaxWithheldJpy] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const isOverseas = type.startsWith('overseas_');

  const handleTypeChange = (newType: ExtraIncomeType) => {
    setType(newType);
    if (newType === 'overseas_dividend') {
      setTitle('美股股息配當 (VOO / AAPL)');
      setTaxCategory('dividend');
      setCurrency('USD');
      setExchangeRate(155.0);
      setOriginalAmount(500);
      setExpensesJpy(0);
      setOverseasTaxWithheldJpy(Math.round(500 * 0.1 * 155)); // 10% US withholding tax
    } else if (newType === 'overseas_salary') {
      setTitle('海外遠端諮詢薪酬');
      setTaxCategory('miscellaneous');
      setCurrency('USD');
      setExchangeRate(155.0);
      setOriginalAmount(1000);
      setExpensesJpy(15000);
    } else if (newType === 'domestic_side_gig') {
      setTitle('國內技術顧問業務委託');
      setTaxCategory('miscellaneous');
      setCurrency('JPY');
      setExchangeRate(1.0);
      setOriginalAmount(150_000);
      setOverseasTaxWithheldJpy(0);
    }
  };

  const handleCurrencyChange = (curr: 'JPY' | 'USD' | 'TWD' | 'EUR' | 'CNY') => {
    setCurrency(curr);
    if (curr === 'USD') setExchangeRate(155.0);
    else if (curr === 'TWD') setExchangeRate(4.85);
    else if (curr === 'EUR') setExchangeRate(165.0);
    else if (curr === 'CNY') setExchangeRate(21.5);
    else setExchangeRate(1.0);
  };

  const amountJpy = Math.round(originalAmount * exchangeRate);
  const netIncomeJpy = Math.max(0, amountJpy - expensesJpy);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: ExtraIncomeRecord = {
      id: `extra_${Date.now()}`,
      date,
      type,
      title,
      taxCategory,
      currency,
      originalAmount,
      exchangeRate,
      amountJpy,
      expensesJpy,
      netIncomeJpy,
      overseasTaxWithheldJpy,
      isOverseas,
      note,
    };
    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              登記額外或海外所得
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              所得分類
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ExtraIncomeType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="domestic_side_gig">國內副業 (業務委託・稿費・顧問)</option>
              <option value="domestic_dividend">國內股息 / 配當金</option>
              <option value="overseas_dividend">海外股息 (美股・海外ETF配當)</option>
              <option value="overseas_salary">海外遠端顧問 / 兼職薪資</option>
              <option value="overseas_crypto">海外虛擬貨幣收益 (雜所得)</option>
              <option value="other">其他額外所得</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                入帳日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                計稅項目性質
              </label>
              <select
                value={taxCategory}
                onChange={(e) => setTaxCategory(e.target.value as TaxCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="miscellaneous">雜所得 (兼職/業務委託一般推薦)</option>
                <option value="business">事業所得 (青色申告專用)</option>
                <option value="dividend">配當所得 (股息)</option>
                <option value="capital_gain">讓渡所得 (資本利得)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              項目名稱標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              required
            />
          </div>

          {/* Currency & Amount */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <span className="font-bold text-slate-900 dark:text-white block">金額與外幣換算</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">幣別</label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="JPY">JPY 日圓</option>
                  <option value="USD">USD 美元</option>
                  <option value="TWD">TWD 台幣</option>
                  <option value="EUR">EUR 歐元</option>
                  <option value="CNY">CNY 人民幣</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">原幣金額</label>
                <input
                  type="number"
                  step="0.01"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">匯率 (兌 JPY)</label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  disabled={currency === 'JPY'}
                />
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 font-mono">
              換算日圓毛收入: <strong className="text-slate-900 dark:text-white">¥{amountJpy.toLocaleString()}</strong>
            </div>
          </div>

          {/* Expenses & Foreign Tax */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                必要經費 (日圓 JPY)
              </label>
              <input
                type="number"
                step="1000"
                value={expensesJpy}
                onChange={(e) => setExpensesJpy(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">書籍、硬體、軟體月費、專案交通等</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                海外已預扣稅額 (外國稅額)
              </label>
              <input
                type="number"
                value={overseasTaxWithheldJpy}
                onChange={(e) => setOverseasTaxWithheldJpy(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">如美股 10% 預扣稅（外國稅額控除用）</p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">備註說明</label>
            <input
              type="text"
              placeholder="例如：客戶名稱、美股券商 Firstrade/IBKR 等"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">計稅淨所得額:</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">
              ¥{netIncomeJpy.toLocaleString()} (計入年度所得)
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs"
            >
              儲存額外收入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
