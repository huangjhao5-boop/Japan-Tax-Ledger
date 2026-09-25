import React, { useState } from 'react';
import { CompleteTaxReport } from '../types/tax';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  ShieldAlert,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface TaxChecklistProps {
  taxReport: CompleteTaxReport;
}

export const TaxChecklist: React.FC<TaxChecklistProps> = ({ taxReport }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const documentChecklist = [
    {
      id: 'doc_gensen',
      title: '給與所得の源泉徴収票',
      desc: '公司於 12 月底或 1 月初發放，載明全年給與總額、已扣繳社保與源泉所得稅。',
      required: true,
    },
    {
      id: 'doc_furusato',
      title: '故鄉納稅「寄附金受領証明書」或 XML 電子證明',
      desc: '若未適用 One-Stop 或超過 5 個自治體，需檢附各地方政府寄發的證明書或由樂天/Satoful下載之 XML 檔。',
      required: taxReport.actualFurusatoDonations > 0,
    },
    {
      id: 'doc_ideco',
      title: '小規模企業共済等掛金払込証明書 (iDeCo)',
      desc: '每年 10~11 月由國民年金基金連合會寄發，年末調整或確定申告均需檢附。',
      required: taxReport.idecoDeduction > 0,
    },
    {
      id: 'doc_housing',
      title: '住宅ローン年末残高証明書 ＋ 登記事項證明書',
      desc: '購屋入居第 1 年申報時需檢附金融機構發行之殘高證明書、契約書影本與建物謄本。',
      required: taxReport.housingLoanCreditIncomeTax > 0,
    },
    {
      id: 'doc_medical',
      title: '醫療費控除の明細書 (或健康保險醫療費通知)',
      desc: '記載全年醫療自費額扣除保險給付超過 10 萬日圓之領收書收據明細。',
      required: taxReport.medicalDeduction > 0,
    },
    {
      id: 'doc_overseas',
      title: '海外所得與外國稅額證明 (美股券商 1042-S / 年間取引報告書)',
      desc: '申報海外股息配當與外國稅額控除時，需備妥券商發給之配當明細與扣繳憑證。',
      required: taxReport.annualOverseasIncomeGross > 0,
    },
    {
      id: 'doc_mynumber',
      title: '個人番號卡 (MyNumber Card) 與讀卡機或智慧型手機',
      desc: '用於 e-Tax 電子申告身分認證，無需親自排隊前往稅務署。',
      required: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div
        className={`p-5 rounded-xl border ${
          taxReport.needsFinalTaxReturn
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-emerald-500/5 border-emerald-500/20'
        } shadow-xs space-y-3`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                taxReport.needsFinalTaxReturn
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {taxReport.needsFinalTaxReturn ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {taxReport.needsFinalTaxReturn
                  ? '診斷結果：您本年度【需要】向國稅局提出確定申告'
                  : '診斷結果：您本年度【無需】確定申告，公司年末調整即可'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                申告受付期間：翌年 2 月 16 日 ～ 3 月 15 日（利用 e-Tax 可於 1 月上旬提早電子申告）
              </p>
            </div>
          </div>

          <a
            href="https://www.keisan.nta.go.jp/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            國稅廳 e-Tax 申告書作成
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Reason checklist items */}
        {taxReport.taxReturnReasons.length > 0 && (
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              符合下列申報與稅務觸發條件：
            </span>
            <div className="space-y-1.5">
              {taxReport.taxReturnReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Critical Expat/Worker Guide: "How to prevent side-gig from leaking to company" */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
          <Info className="w-4 h-4" />
          <h4>日本在住上班族必讀：副業如何避免被正職公司發現？</h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          日本公司通常透過每年 5~6 月區役所寄來的<strong>「住民稅特別徴収稅額決定通知書」</strong>
          得知員工是否有副業。若副業所得增加了住民稅，公司人資會發現您的住民稅高於本薪水準。
        </p>
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900 text-xs space-y-2 text-slate-800 dark:text-slate-200">
          <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-4 h-4" />
            確定申告書第二表之核心秘訣：
          </div>
          <p className="leading-relaxed">
            填寫確定申告書第二表時，在<strong>「給与・公的年金等以外の所得に係る住民税の徴収方法」</strong>
            欄位，務必勾選<strong>【自分で納付（普通徴収）】</strong>！
            如此一來，副業部分的住民稅單會直接寄到您家中自行繳納，而不會併入公司每月薪資扣繳，即可安心兼職。
          </p>
        </div>
      </div>

      {/* Preparation Document Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              確定申告與減稅必備文件檢核清單
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              點擊以標記您已備妥的文件，完成度：
              {Object.values(checkedItems).filter(Boolean).length} / {documentChecklist.length}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {documentChecklist.map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-4 flex items-start gap-3 cursor-pointer transition ${
                  isChecked
                    ? 'bg-slate-50/80 dark:bg-slate-800/30'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                />

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isChecked
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.required && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
                        建議備妥
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
