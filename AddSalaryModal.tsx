import React, { useState, useEffect, useRef } from 'react';
import { MonthlySalarySlip } from '../../types/tax';
import { estimateMonthlySocialInsurance } from '../../utils/taxCalculator';
import { extractTextFromPdf, parseDocumentText } from '../../utils/pdfParser';
import { learnFromSalarySlip } from '../../utils/templateLearning';
import { X, Wand2, Upload, Sparkles, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface AddSalaryModalProps {
  currentYear: number;
  initialSlip?: MonthlySalarySlip | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (slip: MonthlySalarySlip) => void;
}

export const AddSalaryModal: React.FC<AddSalaryModalProps> = ({
  currentYear,
  initialSlip,
  isOpen,
  onClose,
  onSave,
}) => {
  const [month, setMonth] = useState<number>(initialSlip?.month || new Date().getMonth() + 1);
  const [companyName, setCompanyName] = useState<string>(initialSlip?.companyName || '');
  const [employeeName, setEmployeeName] = useState<string>(initialSlip?.employeeName || '');

  // Income items
  const [baseSalary, setBaseSalary] = useState<number>(initialSlip?.baseSalary || 205_000);
  const [roleAllowance, setRoleAllowance] = useState<number>(initialSlip?.roleAllowance || 0);
  const [substituteHolidayPayA, setSubstituteHolidayPayA] = useState<number>(
    initialSlip?.substituteHolidayPayA || 0
  );
  const [substituteHolidayPayB, setSubstituteHolidayPayB] = useState<number>(
    initialSlip?.substituteHolidayPayB || 0
  );
  const [lastMonthShortage, setLastMonthShortage] = useState<number>(
    initialSlip?.lastMonthShortage || 0
  );
  const [absenceDeduction, setAbsenceDeduction] = useState<number>(
    initialSlip?.absenceDeduction || 0
  );
  const [lateEarlyLeaveDeduction, setLateEarlyLeaveDeduction] = useState<number>(
    initialSlip?.lateEarlyLeaveDeduction || 0
  );
  const [childcareLeaveDeduction, setChildcareLeaveDeduction] = useState<number>(
    initialSlip?.childcareLeaveDeduction || 0
  );

  const [overtimePay, setOvertimePay] = useState<number>(initialSlip?.overtimePay || 0);
  const [holidayOvertimePay, setHolidayOvertimePay] = useState<number>(
    initialSlip?.holidayOvertimePay || 0
  );
  const [holidayWorkPay, setHolidayWorkPay] = useState<number>(
    initialSlip?.holidayWorkPay || 0
  );
  const [nightAllowance, setNightAllowance] = useState<number>(
    initialSlip?.nightAllowance || 0
  );
  const [familyAllowance, setFamilyAllowance] = useState<number>(
    initialSlip?.familyAllowance || 0
  );
  const [specialAllowance, setSpecialAllowance] = useState<number>(
    initialSlip?.specialAllowance || 0
  );
  const [allowances, setAllowances] = useState<number>(initialSlip?.allowances || 0);

  // Non-taxable items (非課稅項目)
  const [commuteAllowance, setCommuteAllowance] = useState<number>(
    initialSlip?.commuteAllowance || 0
  );
  const [businessTripAllowance, setBusinessTripAllowance] = useState<number>(
    initialSlip?.businessTripAllowance || 0
  );

  // Deduction items (控除項目)
  const [healthInsurance, setHealthInsurance] = useState<number>(
    initialSlip?.healthInsurance || 0
  );
  const [welfarePension, setWelfarePension] = useState<number>(
    initialSlip?.welfarePension || 0
  );
  const [welfarePensionFund, setWelfarePensionFund] = useState<number>(
    initialSlip?.welfarePensionFund || 0
  );
  const [nursingCareInsurance, setNursingCareInsurance] = useState<number>(
    initialSlip?.nursingCareInsurance || 0
  );
  const [employmentInsurance, setEmploymentInsurance] = useState<number>(
    initialSlip?.employmentInsurance || 0
  );
  const [incomeTax, setIncomeTax] = useState<number>(initialSlip?.incomeTax || 0);
  const [residentTax, setResidentTax] = useState<number>(initialSlip?.residentTax || 0);
  const [travelSavings, setTravelSavings] = useState<number>(
    initialSlip?.travelSavings || initialSlip?.otherDeductions || 0
  );
  const [otherDeductions, setOtherDeductions] = useState<number>(
    initialSlip?.otherDeductions || 0
  );
  const [otherDeductionsNote, setOtherDeductionsNote] = useState<string>(
    initialSlip?.otherDeductionsNote || ''
  );

  // Attendance (勤怠項目)
  const [workDays, setWorkDays] = useState<number>(initialSlip?.attendance?.workDays || 20);
  const [actualWorkDays, setActualWorkDays] = useState<number>(
    initialSlip?.attendance?.actualWorkDays || 20
  );
  const [absenceDays, setAbsenceDays] = useState<number>(initialSlip?.attendance?.absenceDays || 0);
  const [substituteHolidays, setSubstituteHolidays] = useState<number>(
    initialSlip?.attendance?.substituteHolidays || 0
  );
  const [holidayWorkDays, setHolidayWorkDays] = useState<number>(
    initialSlip?.attendance?.holidayWorkDays || 0
  );
  const [transferHolidays, setTransferHolidays] = useState<number>(
    initialSlip?.attendance?.transferHolidays || 0
  );
  const [paidLeaveUsed, setPaidLeaveUsed] = useState<number>(
    initialSlip?.attendance?.paidLeaveUsed || 0
  );
  const [paidLeaveRemaining, setPaidLeaveRemaining] = useState<number>(
    initialSlip?.attendance?.paidLeaveRemaining || 0
  );

  const [overtimeHours, setOvertimeHours] = useState<number>(
    initialSlip?.attendance?.overtimeHours || 0
  );
  const [holidayOvertimeHours, setHolidayOvertimeHours] = useState<number>(
    initialSlip?.attendance?.holidayOvertimeHours || 0
  );
  const [holidayWorkHours, setHolidayWorkHours] = useState<number>(
    initialSlip?.attendance?.holidayWorkHours || 0
  );
  const [nightHours, setNightHours] = useState<number>(
    initialSlip?.attendance?.nightHours || 0
  );

  const [commuteDays, setCommuteDays] = useState<number>(
    initialSlip?.attendance?.commuteDays || 20
  );
  const [commuteDaysCar, setCommuteDaysCar] = useState<number>(
    initialSlip?.attendance?.commuteDaysCar || 20
  );
  const [businessTripDistanceKm, setBusinessTripDistanceKm] = useState<number>(
    initialSlip?.attendance?.businessTripDistanceKm || 0
  );
  const [substituteHolidayADays, setSubstituteHolidayADays] = useState<number>(
    initialSlip?.attendance?.substituteHolidayADays || 0
  );
  const [substituteHolidayBDays, setSubstituteHolidayBDays] = useState<number>(
    initialSlip?.attendance?.substituteHolidayBDays || 0
  );
  const [childcareLeaveDays, setChildcareLeaveDays] = useState<number>(
    initialSlip?.attendance?.childcareLeaveDays || 0
  );
  const [substituteHolidayDailyRate, setSubstituteHolidayDailyRate] = useState<number>(
    initialSlip?.attendance?.substituteHolidayDailyRate || 9760
  );
  const [dependentsCount, setDependentsCount] = useState<number>(
    initialSlip?.attendance?.dependentsCount || 0
  );
  const [careInsuranceApplicable, setCareInsuranceApplicable] = useState<string>(
    initialSlip?.attendance?.careInsuranceApplicable || '非該当'
  );
  const [travelSavingsPeriod, setTravelSavingsPeriod] = useState<string>(
    initialSlip?.attendance?.travelSavingsPeriod || ''
  );

  const [note, setNote] = useState<string>(initialSlip?.note || '');
  const [isReidentifying, setIsReidentifying] = useState<boolean>(false);
  const [reidentifySuccess, setReidentifySuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialSlip) {
        setMonth(initialSlip.month);
        setCompanyName(initialSlip.companyName || '');
        setEmployeeName(initialSlip.employeeName || '');
        setBaseSalary(initialSlip.baseSalary);
        setRoleAllowance(initialSlip.roleAllowance || 0);
        setSubstituteHolidayPayA(initialSlip.substituteHolidayPayA || 0);
        setSubstituteHolidayPayB(initialSlip.substituteHolidayPayB || 0);
        setLastMonthShortage(initialSlip.lastMonthShortage || 0);
        setAbsenceDeduction(initialSlip.absenceDeduction || 0);
        setLateEarlyLeaveDeduction(initialSlip.lateEarlyLeaveDeduction || 0);
        setChildcareLeaveDeduction(initialSlip.childcareLeaveDeduction || 0);

        setOvertimePay(initialSlip.overtimePay);
        setHolidayOvertimePay(initialSlip.holidayOvertimePay || 0);
        setHolidayWorkPay(initialSlip.holidayWorkPay || 0);
        setNightAllowance(initialSlip.nightAllowance || 0);
        setFamilyAllowance(initialSlip.familyAllowance || 0);
        setSpecialAllowance(initialSlip.specialAllowance || 0);
        setAllowances(initialSlip.allowances || 0);

        setCommuteAllowance(initialSlip.commuteAllowance || 0);
        setBusinessTripAllowance(initialSlip.businessTripAllowance || 0);

        setHealthInsurance(initialSlip.healthInsurance || 0);
        setWelfarePension(initialSlip.welfarePension || 0);
        setWelfarePensionFund(initialSlip.welfarePensionFund || 0);
        setNursingCareInsurance(initialSlip.nursingCareInsurance || 0);
        setEmploymentInsurance(initialSlip.employmentInsurance || 0);
        setIncomeTax(initialSlip.incomeTax || 0);
        setResidentTax(initialSlip.residentTax || 0);
        setTravelSavings(initialSlip.travelSavings || initialSlip.otherDeductions || 0);
        setOtherDeductions(initialSlip.otherDeductions || 0);
        setOtherDeductionsNote(initialSlip.otherDeductionsNote || '');

        setWorkDays(initialSlip.attendance?.workDays ?? 20);
        setActualWorkDays(initialSlip.attendance?.actualWorkDays ?? 20);
        setAbsenceDays(initialSlip.attendance?.absenceDays ?? 0);
        setSubstituteHolidays(initialSlip.attendance?.substituteHolidays ?? 0);
        setHolidayWorkDays(initialSlip.attendance?.holidayWorkDays ?? 0);
        setTransferHolidays(initialSlip.attendance?.transferHolidays ?? 0);
        setPaidLeaveUsed(initialSlip.attendance?.paidLeaveUsed ?? 0);
        setPaidLeaveRemaining(initialSlip.attendance?.paidLeaveRemaining ?? 0);

        setOvertimeHours(initialSlip.attendance?.overtimeHours ?? 0);
        setHolidayOvertimeHours(initialSlip.attendance?.holidayOvertimeHours ?? 0);
        setHolidayWorkHours(initialSlip.attendance?.holidayWorkHours ?? 0);
        setNightHours(initialSlip.attendance?.nightHours ?? 0);

        setCommuteDays(initialSlip.attendance?.commuteDays ?? 20);
        setCommuteDaysCar(initialSlip.attendance?.commuteDaysCar ?? 20);
        setBusinessTripDistanceKm(initialSlip.attendance?.businessTripDistanceKm ?? 0);
        setSubstituteHolidayADays(initialSlip.attendance?.substituteHolidayADays ?? 0);
        setSubstituteHolidayBDays(initialSlip.attendance?.substituteHolidayBDays ?? 0);
        setChildcareLeaveDays(initialSlip.attendance?.childcareLeaveDays ?? 0);
        setSubstituteHolidayDailyRate(initialSlip.attendance?.substituteHolidayDailyRate ?? 9760);
        setDependentsCount(initialSlip.attendance?.dependentsCount ?? 0);
        setCareInsuranceApplicable(initialSlip.attendance?.careInsuranceApplicable ?? '非該当');
        setTravelSavingsPeriod(initialSlip.attendance?.travelSavingsPeriod ?? '');

        setNote(initialSlip.note || '');
      } else {
        setMonth(new Date().getMonth() + 1);
        setCompanyName('');
        setEmployeeName('');
        setBaseSalary(205_000);
        setRoleAllowance(0);
        setSubstituteHolidayPayA(0);
        setSubstituteHolidayPayB(0);
        setLastMonthShortage(0);
        setAbsenceDeduction(0);
        setLateEarlyLeaveDeduction(0);
        setChildcareLeaveDeduction(0);

        setOvertimePay(0);
        setHolidayOvertimePay(0);
        setHolidayWorkPay(0);
        setNightAllowance(0);
        setFamilyAllowance(0);
        setSpecialAllowance(0);
        setAllowances(0);

        setCommuteAllowance(0);
        setBusinessTripAllowance(0);

        setHealthInsurance(11_724);
        setWelfarePension(21_960);
        setWelfarePensionFund(0);
        setNursingCareInsurance(0);
        setEmploymentInsurance(1_264);
        setIncomeTax(3_270);
        setResidentTax(0);
        setTravelSavings(0);
        setOtherDeductions(0);
        setOtherDeductionsNote('');

        setWorkDays(20);
        setActualWorkDays(20);
        setAbsenceDays(0);
        setSubstituteHolidays(0);
        setHolidayWorkDays(0);
        setTransferHolidays(0);
        setPaidLeaveUsed(0);
        setPaidLeaveRemaining(0);

        setOvertimeHours(0);
        setHolidayOvertimeHours(0);
        setHolidayWorkHours(0);
        setNightHours(0);

        setCommuteDays(20);
        setCommuteDaysCar(20);
        setBusinessTripDistanceKm(0);
        setSubstituteHolidayADays(0);
        setSubstituteHolidayBDays(0);
        setChildcareLeaveDays(0);
        setSubstituteHolidayDailyRate(9760);
        setDependentsCount(0);
        setCareInsuranceApplicable('非該当');
        setTravelSavingsPeriod('');

        setNote('');
      }
      setReidentifySuccess(null);
    }
  }, [isOpen, initialSlip]);

  if (!isOpen) return null;

  // Re-identification via PDF upload directly in modal
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReidentifying(true);
    setReidentifySuccess(null);
    try {
      let extractedText = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        extractedText = await extractTextFromPdf(arrayBuffer);
      } else {
        extractedText = await file.text();
      }

      const parsed = parseDocumentText(extractedText, file.name, 'salary');
      if (parsed.salaryData) {
        const d = parsed.salaryData;
        setMonth(d.month || month);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.employeeName) setEmployeeName(d.employeeName);
        setBaseSalary(d.baseSalary);
        setRoleAllowance(d.roleAllowance || 0);
        setSubstituteHolidayPayA(d.substituteHolidayPayA || 0);
        setSubstituteHolidayPayB(d.substituteHolidayPayB || 0);
        setLastMonthShortage(d.lastMonthShortage || 0);
        setAbsenceDeduction(d.absenceDeduction || 0);
        setLateEarlyLeaveDeduction(d.lateEarlyLeaveDeduction || 0);
        setChildcareLeaveDeduction(d.childcareLeaveDeduction || 0);

        setOvertimePay(d.overtimePay || 0);
        setHolidayOvertimePay(d.holidayOvertimePay || 0);
        setHolidayWorkPay(d.holidayWorkPay || 0);
        setNightAllowance(d.nightAllowance || 0);
        setFamilyAllowance(d.familyAllowance || 0);
        setSpecialAllowance(d.specialAllowance || 0);
        setAllowances(d.allowances || 0);

        setCommuteAllowance(d.commuteAllowance || 0);
        setBusinessTripAllowance(d.businessTripAllowance || 0);

        setHealthInsurance(d.healthInsurance || 0);
        setWelfarePension(d.welfarePension || 0);
        setWelfarePensionFund(d.welfarePensionFund || 0);
        setNursingCareInsurance(d.nursingCareInsurance || 0);
        setEmploymentInsurance(d.employmentInsurance || 0);
        setIncomeTax(d.incomeTax || 0);
        setResidentTax(d.residentTax || 0);
        setTravelSavings(d.travelSavings || d.otherDeductions || 0);
        setOtherDeductions(d.otherDeductions || 0);
        setOtherDeductionsNote(d.otherDeductionsNote || '');

        if (d.attendance) {
          if (d.attendance.workDays !== undefined) setWorkDays(d.attendance.workDays);
          if (d.attendance.actualWorkDays !== undefined) setActualWorkDays(d.attendance.actualWorkDays);
          if (d.attendance.absenceDays !== undefined) setAbsenceDays(d.attendance.absenceDays);
          if (d.attendance.substituteHolidays !== undefined) setSubstituteHolidays(d.attendance.substituteHolidays);
          if (d.attendance.holidayWorkDays !== undefined) setHolidayWorkDays(d.attendance.holidayWorkDays);
          if (d.attendance.transferHolidays !== undefined) setTransferHolidays(d.attendance.transferHolidays);
          if (d.attendance.paidLeaveUsed !== undefined) setPaidLeaveUsed(d.attendance.paidLeaveUsed);
          if (d.attendance.paidLeaveRemaining !== undefined) setPaidLeaveRemaining(d.attendance.paidLeaveRemaining);

          if (d.attendance.overtimeHours !== undefined) setOvertimeHours(d.attendance.overtimeHours);
          if (d.attendance.holidayOvertimeHours !== undefined) setHolidayOvertimeHours(d.attendance.holidayOvertimeHours);
          if (d.attendance.holidayWorkHours !== undefined) setHolidayWorkHours(d.attendance.holidayWorkHours);
          if (d.attendance.nightHours !== undefined) setNightHours(d.attendance.nightHours);

          if (d.attendance.commuteDays !== undefined) setCommuteDays(d.attendance.commuteDays);
          if (d.attendance.commuteDaysCar !== undefined) setCommuteDaysCar(d.attendance.commuteDaysCar);
          if (d.attendance.businessTripDistanceKm !== undefined) setBusinessTripDistanceKm(d.attendance.businessTripDistanceKm);
          if (d.attendance.substituteHolidayADays !== undefined) setSubstituteHolidayADays(d.attendance.substituteHolidayADays);
          if (d.attendance.substituteHolidayBDays !== undefined) setSubstituteHolidayBDays(d.attendance.substituteHolidayBDays);
          if (d.attendance.childcareLeaveDays !== undefined) setChildcareLeaveDays(d.attendance.childcareLeaveDays);
          if (d.attendance.substituteHolidayDailyRate !== undefined) setSubstituteHolidayDailyRate(d.attendance.substituteHolidayDailyRate);
          if (d.attendance.dependentsCount !== undefined) setDependentsCount(d.attendance.dependentsCount);
          if (d.attendance.careInsuranceApplicable !== undefined) setCareInsuranceApplicable(d.attendance.careInsuranceApplicable);
          if (d.attendance.travelSavingsPeriod !== undefined) setTravelSavingsPeriod(d.attendance.travelSavingsPeriod);
        }
        setNote(d.note || `自 ${file.name} 重新辨識更新`);
        setReidentifySuccess(`✅ 成功辨識 ${file.name}！已自動帶入全數金額（含出張旅費等）與勤怠項目。`);
      }
    } catch (err: any) {
      console.error('Re-identification failed:', err);
    } finally {
      setIsReidentifying(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Auto calculation helper
  const handleAutoEstimate = () => {
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

    const taxableApprox = Math.max(0, gross - soc.total - 40_000);
    const taxApprox = Math.round(taxableApprox * 0.05);
    setIncomeTax(taxApprox);
  };

  // Live calculations & formulas
  const taxableGross =
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

  const nonTaxableTotal = commuteAllowance + businessTripAllowance;
  const totalGross = taxableGross + nonTaxableTotal;

  const socialInsuranceTotal =
    healthInsurance +
    welfarePension +
    welfarePensionFund +
    nursingCareInsurance +
    employmentInsurance;

  const taxDeductionTotal = incomeTax + residentTax;
  const paperDeductionTotal = socialInsuranceTotal + taxDeductionTotal;
  const effectiveOtherDeduction = travelSavings > 0 ? travelSavings : otherDeductions;
  const totalDeductions = paperDeductionTotal + effectiveOtherDeduction;
  const netTakeHome = totalGross - totalDeductions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slip: MonthlySalarySlip = {
      id: initialSlip ? initialSlip.id : `sal_${currentYear}_${month}_${Date.now()}`,
      year: currentYear,
      month,
      companyName: companyName || '勤務先会社',
      employeeName: employeeName || '社員 様',
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
      taxableGross,
      commuteAllowance,
      businessTripAllowance,
      nonTaxableTotal,
      totalGross,
      healthInsurance,
      welfarePension,
      welfarePensionFund,
      nursingCareInsurance,
      employmentInsurance,
      socialInsuranceTotal,
      incomeTax,
      residentTax,
      taxDeductionTotal,
      paperDeductionTotal,
      travelSavings,
      otherDeductions: effectiveOtherDeduction,
      otherDeductionsNote:
        otherDeductionsNote || (travelSavings > 0 ? `旅行積立金: ¥${travelSavings.toLocaleString()}` : ''),
      totalDeductions,
      netPay: netTakeHome,
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
      confidenceScore: 1.0,
      note,
    };
    learnFromSalarySlip(slip);
    onSave(slip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>{initialSlip ? `編輯 / 校正 ${month} 月薪資明細` : '登記月給薪資明細'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {currentYear} 年薪資明細（支援欠勤控除、非課稅通勤、勤怠紀錄與重新辨識）
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick PDF Re-Identification Banner */}
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-blue-950 dark:text-blue-200 block">
                  重新辨識此月份 PDF
                </span>
                <span className="text-[11px] text-blue-800/80 dark:text-blue-300">
                  若項目有缺漏或想重新上傳原版明細，點擊右側按鈕自動替換欄位。
                </span>
              </div>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.txt"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isReidentifying}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isReidentifying ? '解析中...' : '選取 PDF 重新辨識'}</span>
              </button>
            </div>
          </div>

          {reidentifySuccess && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reidentifySuccess}</span>
            </div>
          )}

          {/* Month, Company, and Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                發放月份
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m} 月份給與
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                公司名稱
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例如：株式会社 アイペック"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                社員姓名
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="例如：黄 兆宇 様"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* SECTION 1: 支給項目 (Taxable Earnings & Deductions from Earnings) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                支給項目（課税対象額・各種手当・割増・休業控除）
              </span>
              <button
                type="button"
                onClick={handleAutoEstimate}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Wand2 className="w-3 h-3" />
                依課稅薪資試算社保
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5 font-semibold">
                  基本給
                </label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  役職・役割達成手当
                </label>
                <input
                  type="number"
                  value={roleAllowance}
                  onChange={(e) => setRoleAllowance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5 font-semibold">
                  平日残業手当 (加班)
                </label>
                <input
                  type="number"
                  value={overtimePay}
                  onChange={(e) => setOvertimePay(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  休日残業手当
                </label>
                <input
                  type="number"
                  value={holidayOvertimePay}
                  onChange={(e) => setHolidayOvertimePay(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  休日出勤手当
                </label>
                <input
                  type="number"
                  value={holidayWorkPay}
                  onChange={(e) => setHolidayWorkPay(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  深夜割増手当
                </label>
                <input
                  type="number"
                  value={nightAllowance}
                  onChange={(e) => setNightAllowance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  代休買取手当 A
                </label>
                <input
                  type="number"
                  value={substituteHolidayPayA}
                  onChange={(e) => setSubstituteHolidayPayA(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  代休買取手当 B
                </label>
                <input
                  type="number"
                  value={substituteHolidayPayB}
                  onChange={(e) => setSubstituteHolidayPayB(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  先月不足分 (追給)
                </label>
                <input
                  type="number"
                  value={lastMonthShortage}
                  onChange={(e) => setLastMonthShortage(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  扶養手当
                </label>
                <input
                  type="number"
                  value={familyAllowance}
                  onChange={(e) => setFamilyAllowance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  特別手当
                </label>
                <input
                  type="number"
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  その他手当
                </label>
                <input
                  type="number"
                  value={allowances}
                  onChange={(e) => setAllowances(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              {/* 減算控除項目 (欠勤、遅刻早退、育休) */}
              <div>
                <label className="text-rose-600 dark:text-rose-400 block mb-0.5 font-semibold">
                  欠勤控除
                </label>
                <input
                  type="number"
                  value={absenceDeduction}
                  onChange={(e) => setAbsenceDeduction(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-lg font-mono text-rose-600 dark:text-rose-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-rose-600 dark:text-rose-400 block mb-0.5 font-semibold">
                  遅刻早退控除
                </label>
                <input
                  type="number"
                  value={lateEarlyLeaveDeduction}
                  onChange={(e) => setLateEarlyLeaveDeduction(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-lg font-mono text-rose-600 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="text-rose-600 dark:text-rose-400 block mb-0.5 font-semibold">
                  育児休業控除
                </label>
                <input
                  type="number"
                  value={childcareLeaveDeduction}
                  onChange={(e) => setChildcareLeaveDeduction(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-lg font-mono text-rose-600 dark:text-rose-400"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-200 dark:border-blue-900 flex flex-col justify-center">
                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">課税対象支給額</span>
                <span className="font-mono font-bold text-blue-800 dark:text-blue-200 text-sm">
                  ¥{taxableGross.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1.5: 非課税項目 (Non-Taxable: Commute & Business Trip Expenses) */}
          <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-xs sm:text-sm">
                非課税支給項目（非課税通勤費・出張旅費等・預留輸入欄位）
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                所得稅免稅範疇
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-0.5 font-semibold">
                  非課税通勤費 (交通費)
                </label>
                <input
                  type="number"
                  value={commuteAllowance}
                  onChange={(e) => setCommuteAllowance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-emerald-800 dark:text-emerald-300 font-semibold">
                    非課税出張費 (出張旅費)
                  </label>
                  {businessTripDistanceKm > 0 && (
                    <button
                      type="button"
                      onClick={() => setBusinessTripAllowance(businessTripDistanceKm * 25)}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      依{businessTripDistanceKm}Km試算
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={businessTripAllowance}
                  onChange={(e) => setBusinessTripAllowance(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg font-mono font-semibold text-emerald-800 dark:text-emerald-200"
                />
              </div>

              <div className="bg-emerald-100/60 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 flex flex-col justify-center">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
                  非課税計 / 總支給合計
                </span>
                <span className="font-mono font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                  ¥{nonTaxableTotal.toLocaleString()} / ¥{totalGross.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: 控除項目 (Deductions: Social Insurance, Taxes, Savings) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
              控除項目（社會保險、所得稅、住民稅、基金、旅行積立金）
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">健康保険料</label>
                <input
                  type="number"
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">厚生年金保険</label>
                <input
                  type="number"
                  value={welfarePension}
                  onChange={(e) => setWelfarePension(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">厚生年金基金</label>
                <input
                  type="number"
                  value={welfarePensionFund}
                  onChange={(e) => setWelfarePensionFund(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">介護保険料</label>
                <input
                  type="number"
                  value={nursingCareInsurance}
                  onChange={(e) => setNursingCareInsurance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">雇用保険料</label>
                <input
                  type="number"
                  value={employmentInsurance}
                  onChange={(e) => setEmploymentInsurance(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-rose-600 dark:text-rose-400 block mb-0.5 font-semibold">
                  源泉所得税
                </label>
                <input
                  type="number"
                  value={incomeTax}
                  onChange={(e) => setIncomeTax(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-rose-600 dark:text-rose-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-indigo-600 dark:text-indigo-400 block mb-0.5 font-semibold">
                  住民税 (特別徴収)
                </label>
                <input
                  type="number"
                  value={residentTax}
                  onChange={(e) => setResidentTax(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div>
                <label className="text-amber-700 dark:text-amber-400 block mb-0.5 font-semibold">
                  旅行積立金
                </label>
                <input
                  type="number"
                  value={travelSavings}
                  onChange={(e) => setTravelSavings(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg font-mono text-amber-700 dark:text-amber-300"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-0.5">
                  その他控除 (社宅・組合等)
                </label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">控除明細備註說明</label>
              <input
                type="text"
                placeholder="例如：旅行積立金: ¥1,000、親睦会費: ¥500..."
                value={otherDeductionsNote}
                onChange={(e) => setOtherDeductionsNote(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* SECTION 3: 勤怠資訊 (Attendance - Full Slots with Zero Preserved) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                勤怠情報（勤務日数、欠勤、代休買取、出張距離、残業時間等全格預留）
              </span>
              <span className="text-[11px] text-slate-500">
                出張旅費：25円/km 自動連動
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">要勤務日数</label>
                <input
                  type="number"
                  value={workDays}
                  onChange={(e) => setWorkDays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">出勤日数</label>
                <input
                  type="number"
                  value={actualWorkDays}
                  onChange={(e) => setActualWorkDays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-rose-500 block mb-0.5 font-semibold">欠勤日数</label>
                <input
                  type="number"
                  value={absenceDays}
                  onChange={(e) => setAbsenceDays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-rose-600"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">代休日数</label>
                <input
                  type="number"
                  value={substituteHolidays}
                  onChange={(e) => setSubstituteHolidays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">休日出勤日数</label>
                <input
                  type="number"
                  value={holidayWorkDays}
                  onChange={(e) => setHolidayWorkDays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">振休日数</label>
                <input
                  type="number"
                  value={transferHolidays}
                  onChange={(e) => setTransferHolidays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">有給消化</label>
                <input
                  type="number"
                  value={paidLeaveUsed}
                  onChange={(e) => setPaidLeaveUsed(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">有給残日数</label>
                <input
                  type="number"
                  value={paidLeaveRemaining}
                  onChange={(e) => setPaidLeaveRemaining(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">平日残業(h)</label>
                <input
                  type="number"
                  step="0.25"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">休日残業(h)</label>
                <input
                  type="number"
                  step="0.25"
                  value={holidayOvertimeHours}
                  onChange={(e) => setHolidayOvertimeHours(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">深夜割増(h)</label>
                <input
                  type="number"
                  step="0.25"
                  value={nightHours}
                  onChange={(e) => setNightHours(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">通勤日数</label>
                <input
                  type="number"
                  value={commuteDays}
                  onChange={(e) => setCommuteDays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">マイカー通勤日数</label>
                <input
                  type="number"
                  value={commuteDaysCar}
                  onChange={(e) => setCommuteDaysCar(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mb-0.5">
                  出張旅費(Km)
                </label>
                <input
                  type="number"
                  value={businessTripDistanceKm}
                  onChange={(e) => {
                    const km = Number(e.target.value) || 0;
                    setBusinessTripDistanceKm(km);
                    if (km > 0 && businessTripAllowance === 0) {
                      setBusinessTripAllowance(km * 25);
                    }
                  }}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-md font-mono text-emerald-700 dark:text-emerald-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">代休買取A日数</label>
                <input
                  type="number"
                  value={substituteHolidayADays}
                  onChange={(e) => setSubstituteHolidayADays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">代休買取B日数</label>
                <input
                  type="number"
                  value={substituteHolidayBDays}
                  onChange={(e) => setSubstituteHolidayBDays(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">代休買取日額(単価)</label>
                <input
                  type="number"
                  value={substituteHolidayDailyRate}
                  onChange={(e) => setSubstituteHolidayDailyRate(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">扶養親族等の数</label>
                <input
                  type="number"
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              備註說明
            </label>
            <input
              type="text"
              placeholder="例如：自 PDF 智慧解析匯入（員工：黄 兆宇 様）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {/* Mathematical Reconciliation Summary Strip */}
          <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className="text-slate-600 dark:text-slate-400">
                課税支給: ¥{taxableGross.toLocaleString()} + 非課税 (通勤: ¥{commuteAllowance.toLocaleString()} + 出張: ¥{businessTripAllowance.toLocaleString()}) ={' '}
                <strong className="text-slate-900 dark:text-white">総支給 ¥{totalGross.toLocaleString()}</strong>
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                控除計 (社保 ¥{socialInsuranceTotal.toLocaleString()} + 稅款 ¥{taxDeductionTotal.toLocaleString()} + その他 ¥{effectiveOtherDeduction.toLocaleString()}):{' '}
                <strong className="text-rose-600 dark:text-rose-400">¥{totalDeductions.toLocaleString()}</strong>
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                差引支給額 (實領手取り):
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base font-mono">
                ¥{netTakeHome.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs cursor-pointer"
            >
              儲存薪資明細
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
