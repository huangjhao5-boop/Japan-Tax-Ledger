import React, { useState } from 'react';
import {
  RefreshCw,
  X,
  FileText,
  Gift,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Check,
} from 'lucide-react';

interface ItemReparseModalProps {
  fileName: string;
  currentType: 'salary' | 'bonus' | 'pay_raise';
  rawText: string;
  isOpen: boolean;
  onClose: () => void;
  onReparse: (
    forcedType?: 'salary' | 'bonus' | 'pay_raise',
    editedRawText?: string
  ) => void;
}

export const ItemReparseModal: React.FC<ItemReparseModalProps> = ({
  fileName,
  currentType,
  rawText,
  isOpen,
  onClose,
  onReparse,
}) => {
  const [selectedType, setSelectedType] = useState<
    'auto' | 'salary' | 'bonus' | 'pay_raise'
  >('auto');
  const [editableText, setEditableText] = useState<string>(rawText || '');
  const [showRawTextEditor, setShowRawTextEditor] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExecuteReparse = () => {
    const forced = selectedType === 'auto' ? undefined : selectedType;
    onReparse(forced, editableText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                重新辨識文件：<span className="font-mono text-blue-600 dark:text-blue-400">{fileName}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                指定辨識規則或調整文字內容，讓系統重新進行智慧分析
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Force Type Option */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            1. 選擇重新解析的文件類別模式：
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedType('auto')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                selectedType === 'auto'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">自動智慧辨識 (Auto)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  由系統關鍵字引擎自動綜合判定
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('salary')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                selectedType === 'salary'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">強制為【給与明細書】</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  月薪、殘業、通勤與各項法定控除
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('bonus')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                selectedType === 'bonus'
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-900 dark:text-purple-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Gift className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">強制為【賞与明細書】</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  夏季/冬季獎金、特別決算賞與
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('pay_raise')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                selectedType === 'pay_raise'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">強制為【昇給・労働条件】</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  定期昇給通知、聘用薪資條件書
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Collapsible Raw OCR Text Editor */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowRawTextEditor((prev) => !prev)}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:text-blue-600"
            >
              <span>2. 檢視或修正 PDF 抽出的文字 (OCR Text)</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                {showRawTextEditor ? '（收合）' : '（展開編輯）'}
              </span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              約 {editableText.length} 字元
            </span>
          </div>

          {showRawTextEditor ? (
            <div className="space-y-1.5 animate-fadeIn">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                若 PDF 內文字排版錯位、黏字或漏字，您可在此直接補齊或修改，點擊「執行重新辨識」將以最新文字為準：
              </p>
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                rows={7}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 leading-relaxed"
                placeholder="在此貼上或修正 PDF 文字..."
              />
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              底層已快取原始 PDF 文字。若您懷疑有字元抽取不全，可展開直接檢視。
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleExecuteReparse}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>執行重新辨識</span>
          </button>
        </div>
      </div>
    </div>
  );
};
