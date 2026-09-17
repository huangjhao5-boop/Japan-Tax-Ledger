import React, { useState } from 'react';
import { FurusatoDonation } from '../../types/tax';
import { X, Gift } from 'lucide-react';

interface AddFurusatoModalProps {
  currentYear: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (donation: FurusatoDonation) => void;
}

export const AddFurusatoModal: React.FC<AddFurusatoModalProps> = ({
  currentYear,
  isOpen,
  onClose,
  onSave,
}) => {
  const [municipality, setMunicipality] = useState<string>('北海道白糠町');
  const [amount, setAmount] = useState<number>(20_000);
  const [returnGift, setReturnGift] = useState<string>('北海道特級特大鮭魚卵醬油漬 500g');
  const [date, setDate] = useState<string>(`${currentYear}-10-20`);
  const [oneStopApplied, setOneStopApplied] = useState<boolean>(true);
  const [receiptReceived, setReceiptReceived] = useState<boolean>(true);
  const [note, setNote] = useState<string>('樂天故鄉納稅');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donation: FurusatoDonation = {
      id: `fur_${Date.now()}`,
      municipality,
      amount,
      returnGift,
      date,
      oneStopApplied,
      receiptReceived,
      note,
    };
    onSave(donation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">登記故鄉納稅 (ふるさと納税)</h3>
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
              寄附自治體名稱 (地方政府)
            </label>
            <input
              type="text"
              placeholder="例如：山形縣天童市、北海道白糠町"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                寄附金額 (JPY)
              </label>
              <input
                type="number"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-amber-600 dark:text-amber-400"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                寄附日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              返禮品內容 (特產品)
            </label>
            <input
              type="text"
              placeholder="例如：山形特選牛燒肉片 1kg、麝香葡萄"
              value={returnGift}
              onChange={(e) => setReturnGift(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              required
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={oneStopApplied}
                onChange={(e) => setOneStopApplied(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                已寄送或申請「One-Stop 特例」申請書
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={receiptReceived}
                onChange={(e) => setReceiptReceived(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                已取得「寄附金受領証明書」或下載 XML
              </span>
            </label>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">備註</label>
            <input
              type="text"
              placeholder="例如：樂天故鄉納稅、Satoful、Furunavi"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              登記寄附
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
