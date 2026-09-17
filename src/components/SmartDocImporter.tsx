import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileCheck,
  Building,
  UserCheck,
  Zap,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  CheckSquare,
  Square,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import {
  extractTextFromPdf,
  parseDocumentText,
  ParsedDocumentResult,
} from '../utils/pdfParser';
import {
  MonthlySalarySlip,
  BonusSlip,
  PayRaiseRecord,
} from '../types/tax';
import { learnFromSalarySlip, getAllLearnedTemplates } from '../utils/templateLearning';
import { ItemEditDrawer } from './Importer/ItemEditDrawer';
import { ItemReparseModal } from './Importer/ItemReparseModal';

export interface BatchItem {
  id: string;
  file?: File;
  fileName: string;
  fileSize?: string;
  rawText?: string;
  parsed: ParsedDocumentResult;
  selected: boolean;
  isExpanded: boolean;
  isCustomEdited?: boolean;
  isReidentified?: boolean;
}

interface SmartDocImporterProps {
  onImportSalary: (slip: MonthlySalarySlip) => void;
  onImportBonus: (bonus: BonusSlip) => void;
  onImportPayRaise: (raise: PayRaiseRecord) => void;
  onImportBatchAll: (
    salary: MonthlySalarySlip,
    bonus: BonusSlip,
    raise: PayRaiseRecord,
    employeeName?: string
  ) => void;
  onImportBatchMultiple?: (items: {
    salaries: MonthlySalarySlip[];
    bonuses: BonusSlip[];
    payRaises: PayRaiseRecord[];
    employeeName?: string;
  }) => void;
  onClose?: () => void;
  onNavigateTab?: (tab: string) => void;
  isCleanMode: boolean;
  onToggleCleanMode: (clean: boolean) => void;
  userName?: string;
  onUpdateUserName?: (name: string) => void;
}

export const SmartDocImporter: React.FC<SmartDocImporterProps> = ({
  onImportSalary,
  onImportBonus,
  onImportPayRaise,
  onImportBatchAll,
  onImportBatchMultiple,
  onClose,
  onNavigateTab,
  isCleanMode,
  onToggleCleanMode,
  userName = '給与所得者 様',
  onUpdateUserName,
}) => {
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [reparsingItemId, setReparsingItemId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [autoSwitchClean, setAutoSwitchClean] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Process a list of files (from multiple input selection or drag-and-drop)
  const handleFilesSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsParsing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const newBatchItems: BatchItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessingProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
      });

      try {
        let extractedText = '';
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          extractedText = await extractTextFromPdf(arrayBuffer);
        } else {
          extractedText = await file.text();
        }

        const result = parseDocumentText(extractedText, file.name);
        newBatchItems.push({
          id: `batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          rawText: extractedText,
          parsed: result,
          selected: true,
          isExpanded: false,
        });
      } catch (err: any) {
        console.warn(`Fallback extraction for ${file.name}:`, err);
        const fallbackResult = parseDocumentText(file.name, file.name);
        newBatchItems.push({
          id: `batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          rawText: file.name,
          parsed: fallbackResult,
          selected: true,
          isExpanded: false,
        });
      }
    }

    setBatchItems((prev) => [...prev, ...newBatchItems]);
    setIsParsing(false);
    setProcessingProgress(null);
  };

  // HTML5 Drag and Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      await handleFilesSelected(droppedFiles);
    }
  };

  // Item List Actions
  const handleToggleSelect = (id: string) => {
    setBatchItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleToggleExpand = (id: string) => {
    setBatchItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setBatchItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleRemoveItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setBatchItems([]);
    setEditingItemId(null);
    setReparsingItemId(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Re-Identify Handler
  const handleReparseItem = (
    id: string,
    forcedType?: 'salary' | 'bonus' | 'pay_raise',
    editedRawText?: string
  ) => {
    setBatchItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const textToUse =
          editedRawText !== undefined
            ? editedRawText
            : item.rawText || item.parsed.rawText || item.fileName;
        const newParsed = parseDocumentText(textToUse, item.fileName, forcedType);
        return {
          ...item,
          rawText: textToUse,
          parsed: newParsed,
          isReidentified: true,
        };
      })
    );
    setReparsingItemId(null);
    setSuccessMessage('文件已成功重新辨識！請檢查更新後的明細內容。');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Manual Edit / Correction Handler
  const handleSaveItemEdit = (id: string, updatedParsed: ParsedDocumentResult) => {
    setBatchItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          parsed: updatedParsed,
          isCustomEdited: true,
        };
      })
    );
    setEditingItemId(null);
    setSuccessMessage('明細項目已成功校正並保存！');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Confirm and Commit Selected Items
  const handleConfirmBatchImport = () => {
    const selectedItems = batchItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      setErrorMessage('請至少勾選一筆要匯入的文件！');
      return;
    }

    if (autoSwitchClean && !isCleanMode) {
      onToggleCleanMode(true);
    }

    // Extract employee name from the first valid record
    const detectedName = selectedItems.find((i) => i.parsed.employeeName)?.parsed.employeeName;
    if (detectedName && onUpdateUserName) {
      onUpdateUserName(detectedName);
    }

    const salaries: MonthlySalarySlip[] = [];
    const bonuses: BonusSlip[] = [];
    const payRaises: PayRaiseRecord[] = [];

    for (const item of selectedItems) {
      if (item.parsed.docType === 'salary' && item.parsed.salaryData) {
        salaries.push(item.parsed.salaryData);
        // Automatically learn company slip characteristics for future uploads
        learnFromSalarySlip(item.parsed.salaryData);
      } else if (item.parsed.docType === 'bonus' && item.parsed.bonusData) {
        bonuses.push(item.parsed.bonusData);
      } else if (item.parsed.docType === 'pay_raise' && item.parsed.payRaiseData) {
        payRaises.push(item.parsed.payRaiseData);
      }
    }

    if (onImportBatchMultiple) {
      onImportBatchMultiple({
        salaries,
        bonuses,
        payRaises,
        employeeName: detectedName,
      });
    } else {
      // Fallback: loop through each
      salaries.forEach((s) => onImportSalary(s));
      bonuses.forEach((b) => onImportBonus(b));
      payRaises.forEach((r) => onImportPayRaise(r));
    }

    setSuccessMessage(
      `🎉 成功大量匯入！共新增 ${salaries.length} 筆給與明細、${bonuses.length} 筆賞與明細、${payRaises.length} 筆升薪通知。已同步切換至「純淨個人模式」！`
    );

    // Clear processed items
    setBatchItems([]);
  };

  // Aggregate stats from batch items
  const selectedCount = batchItems.filter((i) => i.selected).length;
  const totalSalaries = batchItems.filter((i) => i.parsed.docType === 'salary').length;
  const totalBonuses = batchItems.filter((i) => i.parsed.docType === 'bonus').length;
  const totalRaises = batchItems.filter((i) => i.parsed.docType === 'pay_raise').length;
  const detectedEmployeeName =
    batchItems.find((i) => i.parsed.employeeName)?.parsed.employeeName || userName;

  const totalSelectedGross = batchItems
    .filter((i) => i.selected)
    .reduce((sum, item) => {
      if (item.parsed.docType === 'salary' && item.parsed.salaryData) {
        return (
          sum +
          (item.parsed.salaryData.totalGross ??
            item.parsed.salaryData.baseSalary +
              item.parsed.salaryData.overtimePay +
              item.parsed.salaryData.commuteAllowance +
              item.parsed.salaryData.allowances -
              (item.parsed.salaryData.absenceDeduction || 0))
        );
      }
      if (item.parsed.docType === 'bonus' && item.parsed.bonusData) {
        return sum + item.parsed.bonusData.grossAmount;
      }
      return sum;
    }, 0);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 relative transition-all"
    >
      {/* Full-card Drag Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/20 backdrop-blur-xs border-3 border-dashed border-blue-500 rounded-2xl z-30 flex flex-col items-center justify-center pointer-events-none transition animate-pulse">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg mb-3 scale-110 transition">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            放開滑鼠即可批次加入這批 PDF 文件！
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            支援多檔案同時拖曳・自動辨識年月、支給額、社保與稅額
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            智慧批次文件辨識 (Bulk PDF Drag & Drop Importer)
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            大量匯入給與明細・賞與・昇給通知書
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            第一次使用？可<span className="font-semibold text-blue-600 dark:text-blue-400">一次選取或拖曳多個月份的 PDF</span>（如整年12個月薪資單與夏冬獎金），系統將全自動批次解析並條列供您一次匯入。
          </p>
        </div>

        {/* Clean Mode Switch Callout */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 text-left sm:text-right">
          <label className="flex items-center sm:justify-end gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSwitchClean}
              onChange={(e) => setAutoSwitchClean(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>匯入後自動啟用純淨模式</span>
          </label>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            自動隱藏模擬假資料，只呈現您的真實薪資明細
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('salary')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
              >
                <span>前往薪資台帳檢視</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition"
              >
                關閉
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Learned Template Feedback Banner */}
      {(() => {
        const templates = getAllLearnedTemplates();
        if (templates.length === 0) return null;
        return (
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                <strong className="font-bold">自適應學習庫已就緒：</strong>
                已記憶 {templates.length} 家公司版型（包含 {templates.map((t) => t.companyName).join('、')}，已鎖定基本給基準、欠勤控除與旅行積立金 ¥1,000 等特徵），上傳同公司 PDF 將自動套用特徵庫加權提升辨識度！
              </span>
            </div>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 shrink-0 self-end sm:self-auto bg-blue-100/60 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
              累計已驗證 {templates.reduce((acc, t) => acc + t.sampleCount, 0)} 份明細
            </span>
          </div>
        );
      })()}

      {/* Drag & Drop Bulk Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group relative overflow-hidden ${
          isDraggingOver
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-4 ring-blue-500/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
          <Upload className="w-7 h-7" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
            <span>支援「拖曳加入」以及「複數多選加入」PDF</span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-600 text-white rounded-full">
              多檔批次
            </span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
            可將 1 ~ 20+ 個給與明細書、賞與明細書、昇給通知書 PDF 直接整批拖拉進來，或點擊以「Shift / Ctrl 多選」一次加入。
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            自動比對年份月份
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            自動辨識支給額・健保厚年・所得稅
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            匯入前可逐筆預覽與微調
          </span>
        </div>

        {/* Hidden Multiple File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,image/*,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesSelected(Array.from(e.target.files) as File[]);
              e.target.value = ''; // Reset for re-selection
            }
          }}
        />
      </div>

      {/* Parsing Progress Indicator */}
      {isParsing && processingProgress && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-blue-600" />
              正在批次解析第 {processingProgress.current} / {processingProgress.total} 份文件...
            </span>
            <span className="font-mono">
              {Math.round((processingProgress.current / processingProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{
                width: `${(processingProgress.current / processingProgress.total) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 truncate font-mono">
            目前處理：{processingProgress.fileName}
          </p>
        </div>
      )}

      {/* Batch Review Staging Area (批次文件待確認台) */}
      {batchItems.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          {/* Summary Bar */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-md">
                  待匯入文件清單：共 {batchItems.length} 份
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  （給與 {totalSalaries} 份、賞與 {totalBonuses} 份、調薪 {totalRaises} 份）
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                所屬員工：<strong className="text-slate-900 dark:text-white">{detectedEmployeeName}</strong>
                {totalSelectedGross > 0 && (
                  <>
                    {' '}• 已勾選項目額面合計：
                    <strong className="text-blue-700 dark:text-blue-300 font-mono text-sm ml-1">
                      ¥{totalSelectedGross.toLocaleString()}
                    </strong>
                  </>
                )}
              </p>
            </div>

            {/* Batch Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleSelectAll(selectedCount !== batchItems.length)}
                className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                {selectedCount === batchItems.length ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                    取消全選
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                    全選 ({batchItems.length})
                  </>
                )}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                追加更多 PDF
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-lg hover:bg-rose-50 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空清單
              </button>

              <button
                onClick={handleConfirmBatchImport}
                disabled={selectedCount === 0}
                className={`px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 ${
                  selectedCount > 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>一鍵匯入已選取項目 ({selectedCount} 筆)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cards List for Each Document */}
          <div className="space-y-3">
            {batchItems.map((item, index) => {
              const { parsed } = item;
              const isSalary = parsed.docType === 'salary';
              const isBonus = parsed.docType === 'bonus';
              const isRaise = parsed.docType === 'pay_raise';

              let docBadgeColor =
                'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200';
              let docBadgeLabel = '給与明細書';

              if (isBonus) {
                docBadgeColor =
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200';
                docBadgeLabel = '賞与明細書';
              } else if (isRaise) {
                docBadgeColor =
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
                docBadgeLabel = '労働条件通知書';
              }

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition p-4 ${
                    item.selected
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Checkbox and Meta */}
                    <div className="flex items-start sm:items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-1 sm:mt-0 cursor-pointer"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${docBadgeColor}`}
                          >
                            {docBadgeLabel}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                            {parsed.year}年 {parsed.month}月
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.fileName}
                          </span>
                          {item.fileSize && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({item.fileSize})
                            </span>
                          )}
                          {item.isCustomEdited && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              已手動校正
                            </span>
                          )}
                          {item.isReidentified && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              已重新辨識
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{parsed.companyName}</span>
                          <span>•</span>
                          <span>員工：{parsed.employeeName}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            信心度：{(parsed.confidenceScore * 100).toFixed(0)}%
                          </span>
                          {parsed.checks?.some((c) => c.name.includes('學習')) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded border border-blue-200 dark:border-blue-800">
                              <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                              已套用自適應版型特徵
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Highlights & Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto flex-wrap">
                      {/* Key Value summary */}
                      {isSalary && parsed.salaryData && (
                        <div className="text-right mr-1">
                          <span className="text-[10px] text-slate-400 block">總支給（手取）</span>
                          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white">
                            ¥
                            {(
                              parsed.salaryData.totalGross ??
                              parsed.salaryData.baseSalary +
                                parsed.salaryData.overtimePay +
                                parsed.salaryData.commuteAllowance -
                                (parsed.salaryData.absenceDeduction || 0)
                            ).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 ml-1">
                            (手取 ¥
                            {(
                              parsed.salaryData.netPay ??
                              (parsed.salaryData.totalGross || 0) -
                                (parsed.salaryData.totalDeductions || 0)
                            ).toLocaleString()}
                            )
                          </span>
                        </div>
                      )}

                      {isBonus && parsed.bonusData && (
                        <div className="text-right mr-1">
                          <span className="text-[10px] text-slate-400 block">賞與總額（手取）</span>
                          <span className="text-xs sm:text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                            ¥{parsed.bonusData.grossAmount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {isRaise && parsed.payRaiseData && (
                        <div className="text-right mr-1">
                          <span className="text-[10px] text-slate-400 block">新基本給</span>
                          <span className="text-xs sm:text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                            ¥{parsed.payRaiseData.newBaseSalary.toLocaleString()} (調升 +¥
                            {parsed.payRaiseData.monthlyIncrease.toLocaleString()})
                          </span>
                        </div>
                      )}

                      {/* Re-Identify Action Button */}
                      <button
                        onClick={() => setReparsingItemId(item.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 cursor-pointer"
                        title="重新辨識此文件（指定分類或修正抽出的文字）"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>重新辨識</span>
                      </button>

                      {/* Manual Edit Action Button */}
                      <button
                        onClick={() =>
                          setEditingItemId(editingItemId === item.id ? null : item.id)
                        }
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                          editingItemId === item.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800'
                        }`}
                        title="手動校正項目、金額與分類"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{editingItemId === item.id ? '收合校正' : '手動修正'}</span>
                      </button>

                      {/* Expand Button */}
                      <button
                        onClick={() => handleToggleExpand(item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="查看/收合明細"
                      >
                        {item.isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="自批次清單排除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Manual Correction Drawer */}
                  {editingItemId === item.id && (
                    <ItemEditDrawer
                      fileName={item.fileName}
                      parsed={item.parsed}
                      onSave={(updatedParsed) => handleSaveItemEdit(item.id, updatedParsed)}
                      onCancel={() => setEditingItemId(null)}
                    />
                  )}

                  {/* Expanded Details Panel */}
                  {item.isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn">
                      {parsed.highlights.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/80"
                        >
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            {h.label}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                            {h.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Confirm Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              提示：按下確認後，系統會自動切換為「純淨模式」並將全部勾選文件精準寫入薪資台帳與年度稅務計算中。
            </p>
            <button
              onClick={handleConfirmBatchImport}
              disabled={selectedCount === 0}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                selectedCount > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>確認全數匯入帳本 ({selectedCount} 筆)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Item Reparse Modal */}
      {reparsingItemId && (() => {
        const itemToReparse = batchItems.find((i) => i.id === reparsingItemId);
        if (!itemToReparse) return null;
        return (
          <ItemReparseModal
            fileName={itemToReparse.fileName}
            currentType={itemToReparse.parsed.docType}
            rawText={itemToReparse.rawText || itemToReparse.parsed.rawText || ''}
            isOpen={true}
            onClose={() => setReparsingItemId(null)}
            onReparse={(forcedType, editedRawText) =>
              handleReparseItem(itemToReparse.id, forcedType, editedRawText)
            }
          />
        );
      })()}
    </div>
  );
};
