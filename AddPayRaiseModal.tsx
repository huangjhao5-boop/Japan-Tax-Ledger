import React, { useState, useEffect } from 'react';
import { PayRaiseRecord } from '../../types/tax';
import { X } from 'lucide-react';

interface AddPayRaiseModalProps {
  currentYear: number;
  initialRaise?: PayRaiseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (raise: PayRaiseRecord) => void;
}

export const AddPayRaiseModal: React.FC<AddPayRaiseModalProps> = ({
  currentYear,
  initialRaise,
  isOpen,
  onClose,
  onSave,
}) => {
  const [effectiveDate, setEffectiveDate] = useState<string>(`${currentYear}-04`);
  const [previousBaseSalary, setPreviousBaseSalary] = useState<number>(205_000);
  const [newBaseSalary, setNewBaseSalary] = useState<number>(215_000);
  const [reason, setReason] = useState<string>('定期昇給 + 業績改定');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialRaise) {
        setEffectiveDate(initialRaise.effectiveDate);
        setPreviousBaseSalary(initialRaise.previousBaseSalary);
        setNewBaseSalary(initialRaise.newBaseSalary);
        setReason(initialRaise.reason);
        setNote(initialRaise.note || '');
      } else {
        setEffectiveDate(`${currentYear}-04`);
        setPreviousBaseSalary(205_000);
        setNewBaseSalary(215_000);
        setReason('定期昇給 + 業績改定');
        setNote('');
      }
    }
  }, [isOpen, initialRaise, currentYear]);

  if (!isOpen) return null;

  const monthlyIncrease = Math.max(0, newBaseSalary - previousBaseSalary);
  const annualIncrease = monthlyIncrease * 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: PayRaiseRecord = {
      id: initialRaise ? initialRaise.id : `raise_${Date.now()}`,
      effectiveDate,
      previousBaseSalary,
      newBaseSalary,
      monthlyIncrease,
      annualIncreaseEstimate: annualIncrease,
      reason,
      note,
    };
    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialRaise ? '編輯 / 校正調薪升薪紀錄' : '記錄調薪升薪事件'}
          </h3>
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
              生效年月 (YYYY-MM)
            </label>
            <input
              type="month"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                調薪前基本給 (JPY)
              </label>
              <input
                type="number"
                step="5000"
                value={previousBaseSalary}
                onChange={(e) => setPreviousBaseSalary(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                調薪後新基本給 (JPY)
              </label>
              <input
                type="number"
                step="5000"
                value={newBaseSalary}
                onChange={(e) => setNewBaseSalary(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-emerald-600 dark:text-emerald-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              調薪理由
            </label>
            <input
              type="text"
              placeholder="例如：職級晉升 (Promotion)、春闘 Base-up、定期昇給"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              備註說明
            </label>
            <input
              type="text"
              placeholder="例如：晉升為主管職、標準報酬月額將於9月改定"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400">每月基本薪增額:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              +¥{monthlyIncrease.toLocaleString()} / 月 (年額面 +¥{annualIncrease.toLocaleString()})
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
              儲存調薪紀錄
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
