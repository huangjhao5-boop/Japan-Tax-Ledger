import React, { useState, useEffect } from 'react';
import { BonusSlip, BonusType } from '../../types/tax';
import { X, Wand2, Edit2 } from 'lucide-react';

interface AddBonusModalProps {
  currentYear: number;
  initialBonus?: BonusSlip | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bonus: BonusSlip) => void;
}

export const AddBonusModal: React.FC<AddBonusModalProps> = ({
  currentYear,
  initialBonus,
  isOpen,
  onClose,
  onSave,
}) => {
  const [bonusType, setBonusType] = useState<BonusType>('summer');
  const [month, setMonth] = useState<number>(6);
  const [title, setTitle] = useState<string>('夏季賞與（夏季獎金）');
  const [grossAmount, setGrossAmount] = useState<number>(750_000);
  const [healthInsurance, setHealthInsurance] = useState<number>(37_425);
  const [welfarePension, setWelfarePension] = useState<number>(68_625);
  const [employmentInsurance, setEmploymentInsurance] = useState<number>(4_500);
  const [incomeTax, setIncomeTax] = useState<number>(42_300);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialBonus) {
        setBonusType(initialBonus.bonusType);
        setMonth(initialBonus.month);
        setTitle(initialBonus.title);
        setGrossAmount(initialBonus.grossAmount);
        setHealthInsurance(initialBonus.healthInsurance);
        setWelfarePension(initialBonus.welfarePension);
        setEmploymentInsurance(initialBonus.employmentInsurance);
        setIncomeTax(initialBonus.incomeTax);
        setOtherDeductions(initialBonus.otherDeductions || 0);
        setNote(initialBonus.note || '');
      } else {
        setBonusType('summer');
        setMonth(6);
        setTitle('夏季賞與（夏季獎金）');
        setGrossAmount(400_000);
        setHealthInsurance(20_000);
        setWelfarePension(36_600);
        setEmploymentInsurance(2_400);
        setIncomeTax(15_000);
        setOtherDeductions(0);
        setNote('');
      }
    }
  }, [isOpen, initialBonus]);

  if (!isOpen) return null;

  const handleTypeChange = (type: BonusType) => {
    setBonusType(type);
    if (type === 'summer') {
      setTitle('夏季賞與（夏季獎金）');
      setMonth(6);
    } else if (type === 'winter') {
      setTitle('冬季賞與（冬季獎金）');
      setMonth(12);
    } else if (type === 'performance') {
      setTitle('業績決算特別賞與');
      setMonth(3);
    }
  };

  const handleAutoEstimate = () => {
    // Standard Kenpo Tokyo bonus rates:
    // Health Insurance: 4.99% (max 5,730,000 yen/year)
    const health = Math.round(grossAmount * 0.0499);
    // Welfare pension: 9.15% (capped at 1,500,000 yen per bonus event)
    const pensionCapped = Math.min(grossAmount, 1_500_000);
    const pension = Math.round(pensionCapped * 0.0915);
    // Employment insurance: 0.6%
    const emp = Math.round(grossAmount * 0.006);
    // Bonus withholding tax: approx 5% - 10% depending on previous month salary
    const tax = Math.round(grossAmount * 0.06);

    setHealthInsurance(health);
    setWelfarePension(pension);
    setEmploymentInsurance(emp);
    setIncomeTax(tax);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bonus: BonusSlip = {
      id: initialBonus ? initialBonus.id : `bonus_${currentYear}_${Date.now()}`,
      year: currentYear,
      month,
      bonusType,
      title,
      grossAmount,
      healthInsurance,
      welfarePension,
      employmentInsurance,
      incomeTax,
      otherDeductions,
      note,
    };
    onSave(bonus);
    onClose();
  };

  const totalDeductions =
    healthInsurance + welfarePension + employmentInsurance + incomeTax + otherDeductions;
  const netTakeHome = grossAmount - totalDeductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialBonus ? '編輯 / 校正賞與 (獎金) 明細' : '登記獎金 (賞与) 明細'}
            </h3>
            <p className="text-xs text-slate-400">
              {currentYear} 年度賞與收入與法定扣除明細
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                獎金類型
              </label>
              <select
                value={bonusType}
                onChange={(e) => handleTypeChange(e.target.value as BonusType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="summer">夏季賞與 (Summer)</option>
                <option value="winter">冬季賞與 (Winter)</option>
                <option value="performance">業績決算特別賞與</option>
                <option value="other">其他獎金</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                發放月份
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m} 月
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              獎金名稱標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-1/2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                賞與額面 (JPY)
              </label>
              <input
                type="number"
                step="10000"
                value={grossAmount}
                onChange={(e) => setGrossAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-sm"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleAutoEstimate}
              className="mt-5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              自動推算獎金扣繳
            </button>
          </div>

          {/* Deductions */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <span className="font-bold text-slate-900 dark:text-white block">賞與法定扣除額</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">健康保險料</label>
                <input
                  type="number"
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">厚生年金保險 (上限150萬)</label>
                <input
                  type="number"
                  value={welfarePension}
                  onChange={(e) => setWelfarePension(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">雇用保險料 (0.6%)</label>
                <input
                  type="number"
                  value={employmentInsurance}
                  onChange={(e) => setEmploymentInsurance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">源泉所得稅</label>
                <input
                  type="number"
                  value={incomeTax}
                  onChange={(e) => setIncomeTax(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs">
            <span className="text-slate-500">扣除總計: ¥{totalDeductions.toLocaleString()}</span>
            <div className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              實領手取り: ¥{netTakeHome.toLocaleString()}
            </div>
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
              儲存獎金單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
