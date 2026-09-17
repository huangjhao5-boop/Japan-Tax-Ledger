import React, { useState } from 'react';
import { MedicalExpenseRecord } from '../../types/tax';
import { X, HeartPulse } from 'lucide-react';

interface AddMedicalModalProps {
  currentYear: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MedicalExpenseRecord) => void;
}

export const AddMedicalModal: React.FC<AddMedicalModalProps> = ({
  currentYear,
  isOpen,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState<string>(`${currentYear}-05-10`);
  const [hospitalOrPharmacy, setHospitalOrPharmacy] = useState<string>('東京綜合齒科診所');
  const [patientName, setPatientName] = useState<string>('本人');
  const [amount, setAmount] = useState<number>(45_000);
  const [insuranceReimbursement, setInsuranceReimbursement] = useState<number>(0);
  const [note, setNote] = useState<string>('自費陶瓷齒列矯正治療');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: MedicalExpenseRecord = {
      id: `med_${Date.now()}`,
      date,
      hospitalOrPharmacy,
      patientName,
      amount,
      insuranceReimbursement,
      note,
    };
    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">登記醫療費用收據</h3>
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
                看診就醫日期
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
                患者對象 (同居生計)
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                placeholder="例如：本人、配偶、長男"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              醫院・診所・藥局名稱
            </label>
            <input
              type="text"
              value={hospitalOrPharmacy}
              onChange={(e) => setHospitalOrPharmacy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              placeholder="例如：慶應義塾大學病院、松本清藥局"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                自費支付金額 (JPY)
              </label>
              <input
                type="number"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-rose-600 dark:text-rose-400"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                保險給付補填 (JPY)
              </label>
              <input
                type="number"
                step="500"
                value={insuranceReimbursement}
                onChange={(e) => setInsuranceReimbursement(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">備註說明</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：齒列矯正、處方藥、住院手術自費等"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
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
              登記醫療費
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
