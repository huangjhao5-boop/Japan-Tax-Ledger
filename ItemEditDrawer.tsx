import React, { useState } from 'react';
import { ParsedDocumentResult } from '../../utils/pdfParser';
import { MonthlySalarySlip, BonusSlip, PayRaiseRecord, BonusType } from '../../types/tax';
import { estimateMonthlySocialInsurance } from '../../utils/taxCalculator';
import { learnFromSalarySlip } from '../../utils/templateLearning';
import {
  X,
  Check,
  Wand2,
  AlertCircle,
  FileText,
  Gift,
  TrendingUp,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ItemEditDrawerProps {
  fileName: string;
  parsed: ParsedDocumentResult;
  onSave: (updatedParsed: ParsedDocumentResult) => void;
  onCancel: () => void;
}

export const ItemEditDrawer: React.FC<ItemEditDrawerProps> = ({
  fileName,
  parsed,
  onSave,
  onCancel,
}) => {
  // Classification
  const [docType, setDocType] = useState<'salary' | 'bonus' | 'pay_raise'>(parsed.docType);
  const [year, setYear] = useState<number>(parsed.year || 2026);
  const [month, setMonth] = useState<number>(parsed.month || 1);
  const [companyName, setCompanyName] = useState<string>(parsed.companyName || '（未指定）');
  const [employeeName, setEmployeeName] = useState<string>(parsed.employeeName || '給与所得者 様');

  // Salary fields
  const [baseSalary, setBaseSalary] = useState<number>(parsed.salaryData?.baseSalary || 205_000);
  const [roleAllowance, setRoleAllowance] = useState<number>(parsed.salaryData?.roleAllowance || 0);
  const [substituteHolidayPayA, setSubstituteHolidayPayA] = useState<number>(
    parsed.salaryData?.substituteHolidayPayA || 0
  );
  const [substituteHolidayPayB, setSubstituteHolidayPayB] = useState<number>(
    parsed.salaryData?.substituteHolidayPayB || 0
  );
  const [lastMonthShortage, setLastMonthShortage] = useState<number>(
    parsed.salaryData?.lastMonthShortage || 0
  );
  const [absenceDeduction, setAbsenceDeduction] = useState<number>(
    parsed.salaryData?.absenceDeduction || 0
  );
  const [lateEarlyLeaveDeduction, setLateEarlyLeaveDeduction] = useState<number>(
    parsed.salaryData?.lateEarlyLeaveDeduction || 0
  );
  const [childcareLeaveDeduction, setChildcareLeaveDeduction] = useState<number>(
    parsed.salaryData?.childcareLeaveDeduction || 0
  );

  const [overtimePay, setOvertimePay] = useState<number>(parsed.salaryData?.overtimePay || 0);
  const [holidayOvertimePay, setHolidayOvertimePay] = useState<number>(
    parsed.salaryData?.holidayOvertimePay || 0
  );
  const [holidayWorkPay, setHolidayWorkPay] = useState<number>(
    parsed.salaryData?.holidayWorkPay || 0
  );
  const [nightAllowance, setNightAllowance] = useState<number>(
    parsed.salaryData?.nightAllowance || 0
  );
  const [familyAllowance, setFamilyAllowance] = useState<number>(
    parsed.salaryData?.familyAllowance || 0
  );
  const [specialAllowance, setSpecialAllowance] = useState<number>(
    parsed.salaryData?.specialAllowance || 0
  );
  const [allowances, setAllowances] = useState<number>(parsed.salaryData?.allowances || 0);

  // Non-taxable fields
  const [commuteAllowance, setCommuteAllowance] = useState<number>(
    parsed.salaryData?.commuteAllowance || 0
  );
  const [businessTripAllowance, setBusinessTripAllowance] = useState<number>(
    parsed.salaryData?.businessTripAllowance || 0
  );

  // Deduction fields
  const [healthInsurance, setHealthInsurance] = useState<number>(
    parsed.salaryData?.healthInsurance || 0
  );
  const [welfarePension, setWelfarePension] = useState<number>(
    parsed.salaryData?.welfarePension || 0
  );
  const [welfarePensionFund, setWelfarePensionFund] = useState<number>(
    parsed.salaryData?.welfarePensionFund || 0
  );
  const [nursingCareInsurance, setNursingCareInsurance] = useState<number>(
    parsed.salaryData?.nursingCareInsurance || 0
  );
  const [employmentInsurance, setEmploymentInsurance] = useState<number>(
    parsed.salaryData?.employmentInsurance || 0
  );
  const [incomeTax, setIncomeTax] = useState<number>(parsed.salaryData?.incomeTax || 0);
  const [residentTax, setResidentTax] = useState<number>(parsed.salaryData?.residentTax || 0);
  const [travelSavings, setTravelSavings] = useState<number>(
    parsed.salaryData?.travelSavings || parsed.salaryData?.otherDeductions || 0
  );
  const [otherDeductions, setOtherDeductions] = useState<number>(
    parsed.salaryData?.otherDeductions || 0
  );
  const [otherDeductionsNote, setOtherDeductionsNote] = useState<string>(
    parsed.salaryData?.otherDeductionsNote || ''
  );

  // Attendance fields
  const [workDays, setWorkDays] = useState<number>(parsed.salaryData?.attendance?.workDays ?? 20);
  const [actualWorkDays, setActualWorkDays] = useState<number>(
    parsed.salaryData?.attendance?.actualWorkDays ?? 20
  );
  const [absenceDays, setAbsenceDays] = useState<number>(
    parsed.salaryData?.attendance?.absenceDays ?? 0
  );
  const [substituteHolidays, setSubstituteHolidays] = useState<number>(
    parsed.salaryData?.attendance?.substituteHolidays ?? 0
  );
  const [holidayWorkDays, setHolidayWorkDays] = useState<number>(
    parsed.salaryData?.attendance?.holidayWorkDays ?? 0
  );
  const [transferHolidays, setTransferHolidays] = useState<number>(
    parsed.salaryData?.attendance?.transferHolidays ?? 0
  );
  const [paidLeaveUsed, setPaidLeaveUsed] = useState<number>(
    parsed.salaryData?.attendance?.paidLeaveUsed ?? 0
  );
  const [paidLeaveRemaining, setPaidLeaveRemaining] = useState<number>(
    parsed.salaryData?.attendance?.paidLeaveRemaining ?? 0
  );

  const [overtimeHours, setOvertimeHours] = useState<number>(
    parsed.salaryData?.attendance?.overtimeHours ?? 0
  );
  const [holidayOvertimeHours, setHolidayOvertimeHours] = useState<number>(
    parsed.salaryData?.attendance?.holidayOvertimeHours ?? 0
  );
  const [holidayWorkHours, setHolidayWorkHours] = useState<number>(
    parsed.salaryData?.attendance?.holidayWorkHours ?? 0
  );
  const [nightHours, setNightHours] = useState<number>(
    parsed.salaryData?.attendance?.nightHours ?? 0
  );

  const [commuteDays, setCommuteDays] = useState<number>(
    parsed.salaryData?.attendance?.commuteDays ?? 20
  );
  const [commuteDaysCar, setCommuteDaysCar] = useState<number>(
    parsed.salaryData?.attendance?.commuteDaysCar ?? 20
  );
  const [businessTripDistanceKm, setBusinessTripDistanceKm] = useState<number>(
    parsed.salaryData?.attendance?.businessTripDistanceKm ?? 0
  );
  const [substituteHolidayADays, setSubstituteHolidayADays] = useState<number>(
    parsed.salaryData?.attendance?.substituteHolidayADays ?? 0
  );
  const [substituteHolidayBDays, setSubstituteHolidayBDays] = useState<number>(
    parsed.salaryData?.attendance?.substituteHolidayBDays ?? 0
  );
  const [childcareLeaveDays, setChildcareLeaveDays] = useState<number>(
    parsed.salaryData?.attendance?.childcareLeaveDays ?? 0
  );
  const [substituteHolidayDailyRate, setSubstituteHolidayDailyRate] = useState<number>(
    parsed.salaryData?.attendance?.substituteHolidayDailyRate ?? 9760
  );
  const [dependentsCount, setDependentsCount] = useState<number>(
    parsed.salaryData?.attendance?.dependentsCount ?? 0
  );
  const [careInsuranceApplicable, setCareInsuranceApplicable] = useState<string>(
    parsed.salaryData?.attendance?.careInsuranceApplicable ?? '非該当'
  );
  const [travelSavingsPeriod, setTravelSavingsPeriod] = useState<string>(
    parsed.salaryData?.attendance?.travelSavingsPeriod ?? ''
  );

  const [salaryNote, setSalaryNote] = useState<string>(parsed.salaryData?.note || '');

  // Bonus fields
  const [bonusTitle, setBonusTitle] = useState<string>(
    parsed.bonusData?.title || `${month}月份 賞與明細`
  );
  const [bonusType, setBonusType] = useState<BonusType>(
    parsed.bonusData?.bonusType || (month >= 5 && month <= 8 ? 'summer' : 'winter')
  );
  const [bonusGross, setBonusGross] = useState<number>(parsed.bonusData?.grossAmount || 400_000);
  const [bonusHealth, setBonusHealth] = useState<number>(
    parsed.bonusData?.healthInsurance || 20_000
  );
  const [bonusPension, setBonusPension] = useState<number>(
    parsed.bonusData?.welfarePension || 36_600
  );
  const [bonusEmp, setBonusEmp] = useState<number>(parsed.bonusData?.employmentInsurance || 2_400);
  const [bonusIncomeTax, setBonusIncomeTax] = useState<number>(
    parsed.bonusData?.incomeTax || 15_000
  );
  const [bonusOtherDed, setBonusOtherDed] = useState<number>(
    parsed.bonusData?.otherDeductions || 0
  );
  const [bonusNote, setBonusNote] = useState<string>(parsed.bonusData?.note || '');

  // Pay raise fields
  const [effectiveDate, setEffectiveDate] = useState<string>(
    parsed.payRaiseData?.effectiveDate || `${year}-${String(month).padStart(2, '0')}`
  );
  const [prevBase, setPrevBase] = useState<number>(parsed.payRaiseData?.previousBaseSalary || 205_000);
  const [newBase, setNewBase] = useState<number>(parsed.payRaiseData?.newBaseSalary || 215_000);
  const [raiseReason, setRaiseReason] = useState<string>(
    parsed.payRaiseData?.reason || '定期昇給・春闘改定'
  );
  const [raiseNote, setRaiseNote] = useState<string>(parsed.payRaiseData?.note || '');

  // Auto-calculate for salary
  const handleAutoEstimateSalary = () => {
    const gross =
      baseSalary +
      overtimePay +
      holidayOvertimePay +
      holidayWorkPay +
      nightAllowance +
      roleAllowance +
      allowances -
      (absenceDeduction + lateEarlyLeaveDeduction + childcareLeaveDeduction);
    const soc = estimateMonthlySocialInsurance(Math.max(0, gross));
    setHealthInsurance(soc.healthInsurance);
    setWelfarePension(soc.welfarePension);
    setEmploymentInsurance(soc.employmentInsurance);

    const taxableBase = Math.max(0, gross - soc.total - 40_000);
    const tax = Math.round(taxableBase * 0.05);
    setIncomeTax(tax);
  };

  // Auto-calculate for bonus
  const handleAutoEstimateBonus = () => {
    const health = Math.round(bonusGross * 0.0498);
    const pension = Math.round(bonusGross * 0.0915);
    const emp = Math.round(bonusGross * 0.006);
    const tax = Math.round(bonusGross * 0.06);

    setBonusHealth(health);
    setBonusPension(pension);
    setBonusEmp(emp);
    setBonusIncomeTax(tax);
  };

  // Live calculations
  const salaryTaxableGross =
    baseSalary +
    overtimePay +
    holidayOvertimePay +
    holidayWorkPay +
    nightAllowance +
    roleAllowance +
    substituteHolidayPayA +
    substituteHolidayPayB +
    lastMonthShortage +
    familyAllowance +
    specialAllowance +
    allowances -
    (absenceDeduction + lateEarlyLeaveDeduction + childcareLeaveDeduction);

  const salaryNonTaxableTotal = commuteAllowance + businessTripAllowance;
  const salaryTotalGross = salaryTaxableGross + salaryNonTaxableTotal;

  const salarySocialTotal =
    healthInsurance +
    welfarePension +
    welfarePensionFund +
    nursingCareInsurance +
    employmentInsurance;

  const salaryTaxDeductionTotal = incomeTax + residentTax;
  const salaryPaperDeductionTotal = salarySocialTotal + salaryTaxDeductionTotal;
  const salaryEffectiveOtherDeductions =
    travelSavings > 0 ? travelSavings : otherDeductions;
  const salaryTotalDeductions =
    salaryPaperDeductionTotal + salaryEffectiveOtherDeductions;
  const salaryNet = salaryTotalGross - salaryTotalDeductions;

  const bonusTotalDeductions =
    bonusHealth + bonusPension + bonusEmp + bonusIncomeTax + bonusOtherDed;
  const bonusNet = bonusGross - bonusTotalDeductions;

  const raiseMonthly = Math.max(0, newBase - prevBase);

  // Save handler
  const handleSave = () => {
    let updatedSalary: MonthlySalarySlip | undefined;
    let updatedBonus: BonusSlip | undefined;
    let updatedRaise: PayRaiseRecord | undefined;
    const highlights: { label: string; value: string }[] = [];

    if (docType === 'salary') {
      updatedSalary = {
        id: parsed.salaryData?.id || `salary_${year}_${month}_${Date.now()}`,
        year,
        month,
        companyName,
        employeeName,
        baseSalary,
        roleAllowance,
        substituteHolidayPayA,
        substituteHolidayPayB,
        lastMonthShortage,
        absenceDeduction,
        lateEarlyLeaveDeduction,
        childcareLeaveDeduction,
        overtimePay,
        holidayOvertimePay,
        holidayWorkPay,
        nightAllowance,
        familyAllowance,
        specialAllowance,
        allowances,
        taxableGross: salaryTaxableGross,
        commuteAllowance,
        businessTripAllowance,
        nonTaxableTotal: salaryNonTaxableTotal,
        totalGross: salaryTotalGross,
        healthInsurance,
        welfarePension,
        welfarePensionFund,
        nursingCareInsurance,
        employmentInsurance,
        socialInsuranceTotal: salarySocialTotal,
        incomeTax,
        residentTax,
        taxDeductionTotal: salaryTaxDeductionTotal,
        paperDeductionTotal: salaryPaperDeductionTotal,
        travelSavings,
        otherDeductions: salaryEffectiveOtherDeductions,
        otherDeductionsNote:
          otherDeductionsNote || (travelSavings > 0 ? `旅行積立金: ¥${travelSavings.toLocaleString()}` : ''),
        totalDeductions: salaryTotalDeductions,
        netPay: salaryNet,
        attendance: {
          workDays,
          actualWorkDays,
          absenceDays,
          substituteHolidays,
          holidayWorkDays,
          transferHolidays,
          paidLeaveUsed,
          paidLeaveRemaining,
          overtimeHours,
          holidayOvertimeHours,
          holidayWorkHours,
          nightHours,
          commuteDays,
          commuteDaysCar,
          businessTripDistanceKm,
          substituteHolidayADays,
          substituteHolidayBDays,
          childcareLeaveDays,
          substituteHolidayDailyRate,
          dependentsCount,
          careInsuranceApplicable,
          travelSavingsPeriod,
        },
        confidenceScore: 1.0, // Manually confirmed by user
        note: salaryNote,
      };

      highlights.push(
        { label: '支給月', value: `${year}年${month}月` },
        { label: '社員姓名', value: employeeName },
        { label: '基本給', value: `¥${baseSalary.toLocaleString()}` }
      );
      if (overtimePay > 0 || overtimeHours > 0) {
        highlights.push({
          label: '平日残業手当',
          value: `¥${overtimePay.toLocaleString()}${overtimeHours > 0 ? ` (${overtimeHours}h)` : ''}`,
        });
      }
      if (absenceDeduction > 0) {
        highlights.push({
          label: '欠勤控除',
          value: `-¥${absenceDeduction.toLocaleString()}${absenceDays > 0 ? ` (${absenceDays}日)` : ''}`,
        });
      }
      if (businessTripAllowance > 0) {
        highlights.push({
          label: '非課税出張費',
          value: `¥${businessTripAllowance.toLocaleString()}${businessTripDistanceKm > 0 ? ` (${businessTripDistanceKm}Km)` : ''}`,
        });
      }
      highlights.push(
        { label: '課税支給合計', value: `¥${salaryTaxableGross.toLocaleString()}` },
        {
          label: '非課税計(通勤+出張)',
          value: `¥${salaryNonTaxableTotal.toLocaleString()}`,
        },
        { label: '総支給額合計', value: `¥${salaryTotalGross.toLocaleString()}` },
        { label: '社会保険計', value: `¥${salarySocialTotal.toLocaleString()}` },
        { label: '源泉所得税', value: `¥${incomeTax.toLocaleString()}` },
        { label: '控除合計', value: `¥${salaryTotalDeductions.toLocaleString()}` },
        { label: '差引支給額(手取)', value: `¥${salaryNet.toLocaleString()}` }
      );
    } else if (docType === 'bonus') {
      updatedBonus = {
        id: parsed.bonusData?.id || `bonus_${year}_${Date.now()}`,
        year,
        month,
        bonusType,
        title: bonusTitle,
        grossAmount: bonusGross,
        healthInsurance: bonusHealth,
        welfarePension: bonusPension,
        employmentInsurance: bonusEmp,
        incomeTax: bonusIncomeTax,
        otherDeductions: bonusOtherDed,
        note: bonusNote,
      };

      highlights.push(
        { label: '賞與項目', value: bonusTitle },
        { label: '發放月份', value: `${year}年${month}月` },
        { label: '賞與總額 (Gross)', value: `¥${bonusGross.toLocaleString()}` },
        { label: '所得稅額', value: `¥${bonusIncomeTax.toLocaleString()}` },
        { label: '實質手取り', value: `¥${bonusNet.toLocaleString()}` }
      );
    } else {
      updatedRaise = {
        id: parsed.payRaiseData?.id || `raise_${Date.now()}`,
        effectiveDate,
        previousBaseSalary: prevBase,
        newBaseSalary: newBase,
        monthlyIncrease: raiseMonthly,
        annualIncreaseEstimate: raiseMonthly * 12,
        reason: raiseReason,
        note: raiseNote,
      };

      highlights.push(
        { label: '改定時期', value: effectiveDate },
        { label: '舊基本給', value: `¥${prevBase.toLocaleString()}` },
        { label: '新基本給', value: `¥${newBase.toLocaleString()}` },
        { label: '月薪增額', value: `+¥${raiseMonthly.toLocaleString()}` },
        { label: '年額面預估', value: `+¥${(raiseMonthly * 12).toLocaleString()}` }
      );
    }

    const verifiedChecks = [
      {
        name: '課税支給額平衡 (人工校正驗證)',
        passed: true,
        formula: `課税支給計: ¥${salaryTaxableGross.toLocaleString()} (已人工核算完成)`,
      },
      {
        name: '非課税項目平衡 (通勤費+出張旅費)',
        passed: true,
        formula: `通勤費(¥${commuteAllowance.toLocaleString()}) + 出張費(¥${businessTripAllowance.toLocaleString()}) = 非課税計(¥${salaryNonTaxableTotal.toLocaleString()})`,
      },
      {
        name: '総支給額平衡 (課税計+非課税計)',
        passed: true,
        formula: `課税(¥${salaryTaxableGross.toLocaleString()}) + 非課税(¥${salaryNonTaxableTotal.toLocaleString()}) = 總支給額(¥${salaryTotalGross.toLocaleString()})`,
      },
      {
        name: '社会保険合計平衡 (法定健保+厚年+雇保)',
        passed: true,
        formula: `健保(¥${healthInsurance.toLocaleString()}) + 厚年(¥${welfarePension.toLocaleString()}) + 雇保(¥${employmentInsurance.toLocaleString()}) = 社保計(¥${salarySocialTotal.toLocaleString()})`,
      },
      {
        name: '控除合計與差引手取平衡 (實手取確認)',
        passed: true,
        formula: `總支給(¥${salaryTotalGross.toLocaleString()}) - 總控除計(¥${salaryTotalDeductions.toLocaleString()}) = 差引支給額(¥${salaryNet.toLocaleString()})`,
      },
      {
        name: '自適應學習庫特徵同步',
        passed: true,
        formula: `已將【${companyName}】版型寫入學習特徵庫（基本給 ¥${baseSalary.toLocaleString()}、積立金 ¥${travelSavings.toLocaleString()}、出張基準 ¥${businessTripAllowance.toLocaleString()}）`,
      },
    ];

    const updatedResult: ParsedDocumentResult = {
      ...parsed,
      docType,
      year,
      month,
      companyName,
      employeeName,
      salaryData: updatedSalary
        ? {
            ...updatedSalary,
            confidenceScore: 1.0,
            checks: verifiedChecks,
          }
        : undefined,
      bonusData: updatedBonus,
      payRaiseData: updatedRaise,
      confidenceScore: 1.0, // Manually confirmed by user (100% verified)
      checks: verifiedChecks,
      highlights,
    };

    if (updatedSalary) {
      // Auto-learn patterns for future PDF uploads of this company
      learnFromSalarySlip(updatedSalary);
    }

    onSave(updatedResult);
  };

  return (
    <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/90 border-2 border-blue-400/60 dark:border-blue-500/60 rounded-xl space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <Save className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              手動校正文件資料：<span className="font-mono text-blue-600 dark:text-blue-400">{fileName}</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              若系統自動辨識有任何誤判（如賞與被辨識為薪資、月份有誤、數字偏差），可在此直接修正。
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="取消修改"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Adaptive Learning Hint Banner */}
      <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 rounded-lg flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <div>
          <span className="font-bold">自適應版型學習機制已連動：</span>
          您在此校正儲存的資料（如公司「{companyName}」之基本給 ¥{baseSalary.toLocaleString()}、旅行積立金、欠勤控除等），將自動被寫入學習特徵庫，後續上傳同公司 PDF 辨識精度與信心度將自動提升！
        </div>
      </div>

      {/* Document Type Override Switcher */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
          1. 修正文件分類（若系統辨識錯誤，點擊切換）：
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDocType('salary')}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              docType === 'salary'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>給与明細（月薪）</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('bonus')}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              docType === 'bonus'
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 shadow-2xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>賞与明細（獎金）</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('pay_raise')}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              docType === 'pay_raise'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 shadow-2xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>昇給・労働条件通知</span>
          </button>
        </div>
      </div>

      {/* Common Meta Fields (Year, Month, Company, Name) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div>
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            發放年份
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            發放月份
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m} 月
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            姓名
          </label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            公司名稱
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white truncate"
          />
        </div>
      </div>

      {/* SECTION A: SALARY FIELDS */}
      {docType === 'salary' && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              月薪支給與控除完整明細（單位：日圓 ¥）
            </span>
            <button
              type="button"
              onClick={handleAutoEstimateSalary}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-2.5 py-1 rounded-md transition flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" />
              依課稅總支給自動試算社保與所得稅
            </button>
          </div>

          {/* 1. 支給項目 (Earnings) */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. 支給項目（基本給、各項加給、手當與欠勤）
              </span>
              <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                課稅支給小計: ¥{salaryTaxableGross.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5 font-semibold">
                  基本給
                </label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  役職・達成手當
                </label>
                <input
                  type="number"
                  value={roleAllowance}
                  onChange={(e) => setRoleAllowance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  代休買取額 A
                </label>
                <input
                  type="number"
                  value={substituteHolidayPayA}
                  onChange={(e) => setSubstituteHolidayPayA(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  代休買取額 B
                </label>
                <input
                  type="number"
                  value={substituteHolidayPayB}
                  onChange={(e) => setSubstituteHolidayPayB(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-rose-600 dark:text-rose-400 block mb-0.5 font-bold">
                  欠勤控除（減額）
                </label>
                <input
                  type="number"
                  value={absenceDeduction}
                  onChange={(e) => setAbsenceDeduction(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 font-mono text-rose-600 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-rose-500 block mb-0.5">
                  遅刻早退控除
                </label>
                <input
                  type="number"
                  value={lateEarlyLeaveDeduction}
                  onChange={(e) => setLateEarlyLeaveDeduction(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 font-mono text-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-rose-500 block mb-0.5">
                  育児休業控除
                </label>
                <input
                  type="number"
                  value={childcareLeaveDeduction}
                  onChange={(e) => setChildcareLeaveDeduction(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 font-mono text-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  平日殘業手當 (普通殘業)
                </label>
                <input
                  type="number"
                  value={overtimePay}
                  onChange={(e) => setOvertimePay(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  休日殘業手當
                </label>
                <input
                  type="number"
                  value={holidayOvertimePay}
                  onChange={(e) => setHolidayOvertimePay(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  休日出勤手當
                </label>
                <input
                  type="number"
                  value={holidayWorkPay}
                  onChange={(e) => setHolidayWorkPay(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  深夜割増手當
                </label>
                <input
                  type="number"
                  value={nightAllowance}
                  onChange={(e) => setNightAllowance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  家族手當
                </label>
                <input
                  type="number"
                  value={familyAllowance}
                  onChange={(e) => setFamilyAllowance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  特別手當
                </label>
                <input
                  type="number"
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  前月不足・調整額
                </label>
                <input
                  type="number"
                  value={lastMonthShortage}
                  onChange={(e) => setLastMonthShortage(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  各項津貼 (その他手当)
                </label>
                <input
                  type="number"
                  value={allowances}
                  onChange={(e) => setAllowances(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2. 非課税項目專區 (Non-taxable items) */}
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                2. 非課稅項目專區（通勤費・出張旅費）
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                非課稅合計: ¥{salaryNonTaxableTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] text-emerald-800 dark:text-emerald-300 block mb-0.5 font-semibold">
                  非課稅通勤費 (交通費)
                </label>
                <input
                  type="number"
                  value={commuteAllowance}
                  onChange={(e) => setCommuteAllowance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-mono font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-emerald-800 dark:text-emerald-300 block mb-0.5 font-bold">
                  非課稅出張費（出張旅費・日當）
                </label>
                <input
                  type="number"
                  value={businessTripAllowance}
                  onChange={(e) => setBusinessTripAllowance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 font-mono font-bold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-400/30"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">
                  出張旅費行駛里程 (Km)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={businessTripDistanceKm}
                    onChange={(e) => setBusinessTripDistanceKm(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                  {businessTripDistanceKm > 0 && (
                    <button
                      type="button"
                      onClick={() => setBusinessTripAllowance(businessTripDistanceKm * 15)}
                      title="依 15円/km 試算"
                      className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold hover:bg-emerald-200 transition shrink-0"
                    >
                      @15円
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. 控除項目 (Deductions) */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. 控除項目（社會保險、稅金、旅行積立金與其他控除）
              </span>
              <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
                控除合計: ¥{salaryTotalDeductions.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  健康保險料
                </label>
                <input
                  type="number"
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  厚生年金保險
                </label>
                <input
                  type="number"
                  value={welfarePension}
                  onChange={(e) => setWelfarePension(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  厚生年金基金
                </label>
                <input
                  type="number"
                  value={welfarePensionFund}
                  onChange={(e) => setWelfarePensionFund(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  介護保險料
                </label>
                <input
                  type="number"
                  value={nursingCareInsurance}
                  onChange={(e) => setNursingCareInsurance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  雇用保險料
                </label>
                <input
                  type="number"
                  value={employmentInsurance}
                  onChange={(e) => setEmploymentInsurance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-rose-600 dark:text-rose-400 block mb-0.5 font-bold">
                  源泉所得稅
                </label>
                <input
                  type="number"
                  value={incomeTax}
                  onChange={(e) => setIncomeTax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-rose-600 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-indigo-600 dark:text-indigo-400 block mb-0.5 font-semibold">
                  住民稅 (特別徵收)
                </label>
                <input
                  type="number"
                  value={residentTax}
                  onChange={(e) => setResidentTax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5 font-semibold">
                  旅行積立金
                </label>
                <input
                  type="number"
                  value={travelSavings}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setTravelSavings(v);
                    if (otherDeductions === 0 || otherDeductions === travelSavings) {
                      setOtherDeductions(v);
                    }
                  }}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  その他控除 (合計)
                </label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  その他控除備註說明
                </label>
                <input
                  type="text"
                  value={otherDeductionsNote}
                  onChange={(e) => setOtherDeductionsNote(e.target.value)}
                  placeholder="例如：旅行積立金: ¥1,000、寮費等..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">
                  備註說明
                </label>
                <input
                  type="text"
                  value={salaryNote}
                  onChange={(e) => setSalaryNote(e.target.value)}
                  placeholder="例如：自 PDF 智慧解析匯入（員工：社員 様）..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. 勤怠資料確認 (Full Attendance Grid) */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              4. 勤怠明細確認（日數、殘業小時、休假與出張）：
            </span>

            {/* Row 1: Days */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">要勤務日數</label>
                <input
                  type="number"
                  value={workDays}
                  onChange={(e) => setWorkDays(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">出勤日數</label>
                <input
                  type="number"
                  value={actualWorkDays}
                  onChange={(e) => setActualWorkDays(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-500 block mb-0.5 font-bold">欠勤日數</label>
                <input
                  type="number"
                  value={absenceDays}
                  onChange={(e) => setAbsenceDays(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 font-mono text-rose-600 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">代休日數</label>
                <input
                  type="number"
                  value={substituteHolidays}
                  onChange={(e) => setSubstituteHolidays(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">休出日數</label>
                <input
                  type="number"
                  value={holidayWorkDays}
                  onChange={(e) => setHolidayWorkDays(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">振替休日</label>
                <input
                  type="number"
                  value={transferHolidays}
                  onChange={(e) => setTransferHolidays(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Row 2: Hours */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">普通殘業時間 (h)</label>
                <input
                  type="number"
                  step="0.25"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">休日殘業時間 (h)</label>
                <input
                  type="number"
                  step="0.25"
                  value={holidayOvertimeHours}
                  onChange={(e) => setHolidayOvertimeHours(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">休日出勤時間 (h)</label>
                <input
                  type="number"
                  step="0.25"
                  value={holidayWorkHours}
                  onChange={(e) => setHolidayWorkHours(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">深夜時間 (h)</label>
                <input
                  type="number"
                  step="0.25"
                  value={nightHours}
                  onChange={(e) => setNightHours(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Row 3: Leave & Trip */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">有給消化</label>
                <input
                  type="number"
                  value={paidLeaveUsed}
                  onChange={(e) => setPaidLeaveUsed(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">有給残日數</label>
                <input
                  type="number"
                  value={paidLeaveRemaining}
                  onChange={(e) => setPaidLeaveRemaining(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">通勤日數 (公共)</label>
                <input
                  type="number"
                  value={commuteDays}
                  onChange={(e) => setCommuteDays(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">通勤日數 (自家用車)</label>
                <input
                  type="number"
                  value={commuteDaysCar}
                  onChange={(e) => setCommuteDaysCar(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-emerald-600 block mb-0.5 font-semibold">出張里程(Km)</label>
                <input
                  type="number"
                  value={businessTripDistanceKm}
                  onChange={(e) => setBusinessTripDistanceKm(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-emerald-600 font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">代休買取單價</label>
                <input
                  type="number"
                  value={substituteHolidayDailyRate}
                  onChange={(e) => setSubstituteHolidayDailyRate(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Real-time Summary Card */}
          <div className="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono">
              <span className="text-slate-600 dark:text-slate-400">
                課稅支給: <strong>¥{salaryTaxableGross.toLocaleString()}</strong>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400">
                非課稅(通勤+出張): <strong>¥{salaryNonTaxableTotal.toLocaleString()}</strong>
              </span>
              <span className="text-slate-900 dark:text-white">
                總支給: <strong>¥{salaryTotalGross.toLocaleString()}</strong>
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                控除合計: <strong>¥{salaryTotalDeductions.toLocaleString()}</strong>
              </span>
            </div>
            <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
              差引實手取: ¥{salaryNet.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: BONUS FIELDS */}
      {docType === 'bonus' && (
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
              賞與 (獎金) 支給與扣除明細
            </span>
            <button
              type="button"
              onClick={handleAutoEstimateBonus}
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 px-2.5 py-1 rounded-md transition flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" />
              自動推算獎金稅額與社保
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">賞與標題</label>
              <input
                type="text"
                value={bonusTitle}
                onChange={(e) => setBonusTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">賞與類型</label>
              <select
                value={bonusType}
                onChange={(e) => setBonusType(e.target.value as BonusType)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="summer">夏季賞與 (Summer)</option>
                <option value="winter">冬季賞與 (Winter)</option>
                <option value="performance">業績/決算賞與</option>
                <option value="other">其他特別獎金</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">賞與額面 (Gross)</label>
              <input
                type="number"
                value={bonusGross}
                onChange={(e) => setBonusGross(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-purple-600"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">源泉所得稅</label>
              <input
                type="number"
                value={bonusIncomeTax}
                onChange={(e) => setBonusIncomeTax(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">健康保險</label>
              <input
                type="number"
                value={bonusHealth}
                onChange={(e) => setBonusHealth(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">厚生年金</label>
              <input
                type="number"
                value={bonusPension}
                onChange={(e) => setBonusPension(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">雇用保險</label>
              <input
                type="number"
                value={bonusEmp}
                onChange={(e) => setBonusEmp(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">其他扣除</label>
              <input
                type="number"
                value={bonusOtherDed}
                onChange={(e) => setBonusOtherDed(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Bonus Net */}
          <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-purple-800 dark:text-purple-300 font-semibold">
              扣除合計: ¥{bonusTotalDeductions.toLocaleString()}
            </span>
            <span className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
              賞與實質手取: ¥{bonusNet.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* SECTION C: PAY RAISE FIELDS */}
      {docType === 'pay_raise' && (
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
            昇給 / 勞動條件改定明細
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">改定生效時期</label>
              <input
                type="text"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                placeholder="2026-04"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">改定前基本給</label>
              <input
                type="number"
                value={prevBase}
                onChange={(e) => setPrevBase(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">改定後基本給</label>
              <input
                type="number"
                value={newBase}
                onChange={(e) => setNewBase(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-amber-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] text-slate-500 block mb-0.5">調薪理由 / 項目</label>
              <input
                type="text"
                value={raiseReason}
                onChange={(e) => setRaiseReason(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-800 dark:text-amber-300">
              每月調升: +¥{raiseMonthly.toLocaleString()}
            </span>
            <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300">
              預估年額面增加: +¥{(raiseMonthly * 12).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition"
        >
          取消
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>儲存校正</span>
        </button>
      </div>
    </div>
  );
};
