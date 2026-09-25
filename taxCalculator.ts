import {
  MonthlySalarySlip,
  BonusSlip,
  ExtraIncomeRecord,
  FurusatoDonation,
  MedicalExpenseRecord,
  TaxDeductionSettings,
  CompleteTaxReport,
} from '../types/tax';

/**
 * 給與所得控除 (Salary Income Deduction) - 日本国税庁現行算式
 */
export function calculateEmploymentDeduction(salaryGross: number): number {
  if (salaryGross <= 0) return 0;
  if (salaryGross <= 1_625_000) {
    return 550_000;
  } else if (salaryGross <= 1_800_000) {
    return Math.floor(salaryGross * 0.4 - 100_000);
  } else if (salaryGross <= 3_600_000) {
    return Math.floor(salaryGross * 0.3 + 80_000);
  } else if (salaryGross <= 6_600_000) {
    return Math.floor(salaryGross * 0.2 + 440_000);
  } else if (salaryGross <= 8_500_000) {
    return Math.floor(salaryGross * 0.1 + 1_100_000);
  } else {
    return 1_950_000; // 上限 195 万円
  }
}

/**
 * 日本所得稅累進稅率表 (所得税の速算表)
 */
export function calculateBaseIncomeTax(taxableIncome: number): {
  tax: number;
  rate: number;
  deduction: number;
} {
  if (taxableIncome <= 0) return { tax: 0, rate: 0, deduction: 0 };

  // 所得税は1,000円未満切り捨て
  const roundedTaxable = Math.floor(taxableIncome / 1000) * 1000;

  if (roundedTaxable <= 1_950_000) {
    return { tax: Math.floor(roundedTaxable * 0.05), rate: 0.05, deduction: 0 };
  } else if (roundedTaxable <= 3_300_000) {
    return { tax: Math.floor(roundedTaxable * 0.1 - 97_500), rate: 0.1, deduction: 97_500 };
  } else if (roundedTaxable <= 6_950_000) {
    return { tax: Math.floor(roundedTaxable * 0.2 - 427_500), rate: 0.2, deduction: 427_500 };
  } else if (roundedTaxable <= 9_000_000) {
    return { tax: Math.floor(roundedTaxable * 0.23 - 636_000), rate: 0.23, deduction: 636_000 };
  } else if (roundedTaxable <= 18_000_000) {
    return { tax: Math.floor(roundedTaxable * 0.33 - 1_536_000), rate: 0.33, deduction: 1_536_000 };
  } else if (roundedTaxable <= 40_000_000) {
    return { tax: Math.floor(roundedTaxable * 0.4 - 2_796_000), rate: 0.4, deduction: 2_796_000 };
  } else {
    return { tax: Math.floor(roundedTaxable * 0.45 - 4_796_000), rate: 0.45, deduction: 4_796_000 };
  }
}

/**
 * 生命保険料控除の計算 (新契約制度)
 */
export function calculateLifeInsuranceDeduction(
  general: number,
  nursing: number,
  pension: number
): { incomeTaxDeduction: number; residentTaxDeduction: number } {
  const calcCategory = (amount: number, maxIncome: number, maxResident: number) => {
    let inc = 0;
    let res = 0;
    if (amount <= 20_000) {
      inc = amount;
      res = amount;
    } else if (amount <= 40_000) {
      inc = Math.floor(amount * 0.5 + 10_000);
      res = Math.floor(amount * 0.5 + 10_000);
    } else if (amount <= 80_000) {
      inc = Math.floor(amount * 0.25 + 20_000);
      res = Math.min(maxResident, Math.floor(amount * 0.25 + 20_000));
    } else {
      inc = maxIncome;
      res = maxResident;
    }
    return { inc: Math.min(inc, maxIncome), res: Math.min(res, maxResident) };
  };

  const gen = calcCategory(general, 40_000, 28_000);
  const nur = calcCategory(nursing, 40_000, 28_000);
  const pen = calcCategory(pension, 40_000, 28_000);

  const totalInc = Math.min(120_000, gen.inc + nur.inc + pen.inc);
  const totalRes = Math.min(70_000, gen.res + nur.res + pen.res);

  return { incomeTaxDeduction: totalInc, residentTaxDeduction: totalRes };
}

/**
 * 醫療費控除計算
 */
export function calculateMedicalExpenseDeduction(
  records: MedicalExpenseRecord[],
  totalIncome: number
): number {
  if (records.length === 0) return 0;
  const totalPaid = records.reduce((sum, r) => sum + (r.amount - r.insuranceReimbursement), 0);
  if (totalPaid <= 0) return 0;

  // 門檻：總所得 × 5% 與 10 萬日圓取小者 (通常為 10 萬)
  const threshold = totalIncome < 2_000_000 ? Math.floor(totalIncome * 0.05) : 100_000;
  const deduction = Math.max(0, totalPaid - threshold);
  return Math.min(2_000_000, deduction); // 最高上限 200 萬
}

/**
 * 扶養控除計算
 */
export function calculateDependentDeductions(dependents: TaxDeductionSettings['dependents']): {
  incomeTaxDeduction: number;
  residentTaxDeduction: number;
  spouseIncomeTaxDeduction: number;
  spouseResidentTaxDeduction: number;
} {
  let incomeTaxDep = 0;
  let residentTaxDep = 0;

  // 一般扶養 (16~18歲)
  incomeTaxDep += dependents.children16to18 * 380_000;
  residentTaxDep += dependents.children16to18 * 330_000;

  // 特定扶養 (19~22歲)
  incomeTaxDep += dependents.children19to22 * 630_000;
  residentTaxDep += dependents.children19to22 * 450_000;

  // 老人扶養 (70歲以上，以平均 48萬/38萬 估算)
  incomeTaxDep += dependents.elderly70plus * 480_000;
  residentTaxDep += dependents.elderly70plus * 380_000;

  // 配偶者控除
  let spouseIncome = 0;
  let spouseResident = 0;
  if (dependents.spouseType === 'general') {
    spouseIncome = 380_000;
    spouseResident = 330_000;
  } else if (dependents.spouseType === 'special') {
    spouseIncome = 380_000;
    spouseResident = 330_000;
  }

  return {
    incomeTaxDeduction: incomeTaxDep,
    residentTaxDeduction: residentTaxDep,
    spouseIncomeTaxDeduction: spouseIncome,
    spouseResidentTaxDeduction: spouseResident,
  };
}

/**
 * 日本標準社會保險估算 (根據月給標準報酬月額，東京都協會けんぽ標準)
 * 健康保險約 4.99% + 厚生年金約 9.15% (折半雇員負擔) + 雇用保險 0.6%
 */
export function estimateMonthlySocialInsurance(monthlyGross: number, isOver40 = false) {
  // 健康保險 (東京 2025/2026 年約 9.98% / 2 = 4.99%, 40歲以上加介護約 1.6% / 2 = 5.79%)
  const healthRate = isOver40 ? 0.0579 : 0.0499;
  const healthInsurance = Math.round(monthlyGross * healthRate);

  // 厚生年金 18.3% / 2 = 9.15%, 上限標準報酬月額 650,000 円 (上限保費約 59,475 円)
  const pensionCappedGross = Math.min(monthlyGross, 650_000);
  const welfarePension = Math.round(pensionCappedGross * 0.0915);

  // 雇用保險 0.6%
  const employmentInsurance = Math.round(monthlyGross * 0.006);

  return {
    healthInsurance,
    welfarePension,
    employmentInsurance,
    total: healthInsurance + welfarePension + employmentInsurance,
  };
}

/**
 * 完整日本稅務年度總結報告計算
 */
export function calculateCompleteTaxReport(
  year: number,
  salarySlips: MonthlySalarySlip[],
  bonusSlips: BonusSlip[],
  extraIncomes: ExtraIncomeRecord[],
  furusatoDonations: FurusatoDonation[],
  medicalExpenses: MedicalExpenseRecord[],
  settings: TaxDeductionSettings
): CompleteTaxReport {
  // Defensive guarantees against malformed or non-array inputs
  const safeSalarySlips = Array.isArray(salarySlips) ? salarySlips : [];
  const safeBonusSlips = Array.isArray(bonusSlips) ? bonusSlips : [];
  const safeExtraIncomes = Array.isArray(extraIncomes) ? extraIncomes : [];
  const safeFurusato = Array.isArray(furusatoDonations) ? furusatoDonations : [];
  const safeMedical = Array.isArray(medicalExpenses)
    ? medicalExpenses
    : (medicalExpenses && typeof medicalExpenses === 'object' && Array.isArray((medicalExpenses as any).records)
      ? (medicalExpenses as any).records
      : []);

  // 1. 給與收入與實際社保/源泉稅合計
  const filteredSalarySlips = safeSalarySlips.filter((s) => s && s.year === year);
  const filteredBonusSlips = safeBonusSlips.filter((b) => b && b.year === year);
  const filteredExtraIncomes = safeExtraIncomes.filter((e) => {
    if (!e || !e.date) return false;
    const itemYear = new Date(e.date).getFullYear();
    return itemYear === year;
  });
  const filteredFurusato = safeFurusato.filter((f) => {
    if (!f || !f.date) return false;
    const itemYear = new Date(f.date).getFullYear();
    return itemYear === year;
  });
  const filteredMedical = safeMedical.filter((m) => {
    if (!m || !m.date) return false;
    const itemYear = new Date(m.date).getFullYear();
    return itemYear === year;
  });

  const annualSalaryGross = filteredSalarySlips.reduce((sum, s) => {
    if (s.taxableGross !== undefined && s.taxableGross > 0) {
      return sum + s.taxableGross;
    }
    return sum + (s.baseSalary + s.overtimePay + s.allowances - (s.absenceDeduction || 0));
  }, 0);
  const annualBonusGross = filteredBonusSlips.reduce((sum, b) => sum + b.grossAmount, 0);
  const annualEmploymentGross = annualSalaryGross + annualBonusGross;

  // 實際扣繳社保
  const salaryHealth = filteredSalarySlips.reduce((sum, s) => sum + s.healthInsurance, 0);
  const bonusHealth = filteredBonusSlips.reduce((sum, b) => sum + b.healthInsurance, 0);
  const totalHealthInsurance = salaryHealth + bonusHealth;

  const salaryPension = filteredSalarySlips.reduce((sum, s) => sum + s.welfarePension, 0);
  const bonusPension = filteredBonusSlips.reduce((sum, b) => sum + b.welfarePension, 0);
  const totalWelfarePension = salaryPension + bonusPension;

  const salaryEmp = filteredSalarySlips.reduce((sum, s) => sum + s.employmentInsurance, 0);
  const bonusEmp = filteredBonusSlips.reduce((sum, b) => sum + b.employmentInsurance, 0);
  const totalEmploymentInsurance = salaryEmp + bonusEmp;

  const totalSocialInsurance = totalHealthInsurance + totalWelfarePension + totalEmploymentInsurance;

  // 2. 額外收入 (國內副業 + 海外所得)
  let annualSideIncomeGross = 0;
  let annualSideExpenses = 0;
  let annualOverseasIncomeGross = 0;
  let annualOverseasExpenses = 0;
  let annualOverseasTaxPaid = 0;

  filteredExtraIncomes.forEach((item) => {
    if (item.isOverseas) {
      annualOverseasIncomeGross += item.amountJpy;
      annualOverseasExpenses += item.expensesJpy;
      annualOverseasTaxPaid += item.overseasTaxWithheldJpy;
    } else {
      annualSideIncomeGross += item.amountJpy;
      annualSideExpenses += item.expensesJpy;
    }
  });

  // 青色申告特別控除 (若有副業營業所得，扣除 10萬/55萬/65萬)
  const blueDeduction = settings.blueReturnDeduction || 0;
  const rawSideNet = Math.max(0, annualSideIncomeGross - annualSideExpenses);
  const annualSideNetIncome = Math.max(0, rawSideNet - blueDeduction);

  const annualOverseasNetIncome = Math.max(0, annualOverseasIncomeGross - annualOverseasExpenses);

  const totalGrossIncome = annualEmploymentGross + annualSideIncomeGross + annualOverseasIncomeGross;

  // 3. 給與所得控除與總所得金額 (Gross - Deductions)
  const employmentDeduction = calculateEmploymentDeduction(annualEmploymentGross);
  const salaryNetIncome = Math.max(0, annualEmploymentGross - employmentDeduction);
  const aggregateGrossIncome = salaryNetIncome + annualSideNetIncome + annualOverseasNetIncome;

  // 4. 所得控除 (Income Deductions)
  // 基礎控除: 所得稅 48萬 (合計所得 2400萬以下), 住民稅 43萬
  const basicDeduction = aggregateGrossIncome <= 24_000_000 ? 480_000 : 0;
  const basicDeductionResident = aggregateGrossIncome <= 24_000_000 ? 430_000 : 0;

  // 社會保險料控除
  const socialInsuranceDeduction = totalSocialInsurance;

  // iDeCo 小規模企業共済等掛金控除 (全額控除)
  const idecoDeduction = (settings.idecoMonthlyContribution || 0) * 12;

  // 醫療費控除
  const medicalDeduction = calculateMedicalExpenseDeduction(filteredMedical, aggregateGrossIncome);

  // 生命保險料控除
  const lifeDeductions = calculateLifeInsuranceDeduction(
    settings.insurance.generalLifeInsurance,
    settings.insurance.nursingCareInsurance,
    settings.insurance.privatePensionInsurance
  );
  const lifeInsuranceDeduction = lifeDeductions.incomeTaxDeduction;
  const lifeInsuranceResidentDeduction = lifeDeductions.residentTaxDeduction;

  // 地震保險料控除 (最高 50,000 JPY 所得稅, 25,000 JPY 住民稅)
  const earthquakeDeduction = Math.min(50_000, settings.insurance.earthquakeInsurance);
  const earthquakeResidentDeduction = Math.min(25_000, Math.floor(settings.insurance.earthquakeInsurance * 0.5));

  // 扶養與配偶者控除
  const depDeductions = calculateDependentDeductions(settings.dependents);
  const spouseDeduction = depDeductions.spouseIncomeTaxDeduction;
  const dependentDeduction = depDeductions.incomeTaxDeduction;

  const totalIncomeDeductions =
    basicDeduction +
    socialInsuranceDeduction +
    idecoDeduction +
    medicalDeduction +
    lifeInsuranceDeduction +
    earthquakeDeduction +
    spouseDeduction +
    dependentDeduction;

  const totalResidentDeductions =
    basicDeductionResident +
    socialInsuranceDeduction +
    idecoDeduction +
    medicalDeduction +
    lifeInsuranceResidentDeduction +
    earthquakeResidentDeduction +
    depDeductions.spouseResidentTaxDeduction +
    depDeductions.residentTaxDeduction;

  // 5. 課稅所得金額 (千圓未滿切捨)
  const taxableIncomeForIncomeTax = Math.max(
    0,
    Math.floor((aggregateGrossIncome - totalIncomeDeductions) / 1000) * 1000
  );
  const taxableIncomeForResidentTax = Math.max(
    0,
    Math.floor((aggregateGrossIncome - totalResidentDeductions) / 1000) * 1000
  );

  // 6. 所得稅計算 (含復興特別所得稅 2.1%)
  const incomeTaxInfo = calculateBaseIncomeTax(taxableIncomeForIncomeTax);
  const calculatedIncomeTax = incomeTaxInfo.tax;
  const marginalIncomeTaxRate = incomeTaxInfo.rate;
  const reconstructionTax = Math.floor(calculatedIncomeTax * 0.021);
  const totalIncomeTaxBeforeCredits = calculatedIncomeTax + reconstructionTax;

  // 7. 稅額控除 (住宅ローン控除 + 外國稅額控除)
  let housingLoanCreditIncomeTax = 0;
  let housingLoanCreditResidentTax = 0;

  if (settings.housingLoan.hasLoan && settings.housingLoan.balanceYearEnd > 0) {
    const rawCredit = Math.floor(
      settings.housingLoan.balanceYearEnd * (settings.housingLoan.deductionRate || 0.007)
    );
    const maxCredit = settings.housingLoan.deductionLimit || 210_000;
    const effectiveCredit = Math.min(rawCredit, maxCredit);

    // 首先抵扣所得稅
    housingLoanCreditIncomeTax = Math.min(effectiveCredit, totalIncomeTaxBeforeCredits);
    // 剩餘額度可抵減住民稅 (現行上限最高 97,500 円)
    const remainingCredit = effectiveCredit - housingLoanCreditIncomeTax;
    housingLoanCreditResidentTax = Math.min(remainingCredit, 97_500);
  }

  // 外國稅額控除 (Foreign Tax Credit - 防止雙重課稅)
  let foreignTaxCreditIncomeTax = 0;
  if (annualOverseasTaxPaid > 0 && aggregateGrossIncome > 0) {
    const foreignCreditLimit = Math.floor(
      calculatedIncomeTax * (annualOverseasNetIncome / aggregateGrossIncome)
    );
    foreignTaxCreditIncomeTax = Math.min(annualOverseasTaxPaid, foreignCreditLimit);
  }

  const finalIncomeTax = Math.max(
    0,
    totalIncomeTaxBeforeCredits - housingLoanCreditIncomeTax - foreignTaxCreditIncomeTax
  );

  // 8. 住民稅計算 (所得割 10% + 均等割 5000)
  const residentTaxIncomePortion = Math.floor(taxableIncomeForResidentTax * 0.1);
  const residentTaxEqualPortion = 5_000; // 含森林環境稅 1,000 円

  // 9. ふるさと納税 (Furusato Nozei) 限度額試算與抵減
  // 限度額公式: (住民税所得割額 × 20%) / (90% - 所得税率 × 1.021) + 2,000円
  const divisor = 0.9 - marginalIncomeTaxRate * 1.021;
  const furusatoLimitEstimate =
    divisor > 0
      ? Math.floor((residentTaxIncomePortion * 0.2) / divisor) + 2_000
      : Math.floor(residentTaxIncomePortion * 0.2) + 2_000;

  const actualFurusatoDonations = filteredFurusato.reduce((sum, f) => sum + f.amount, 0);
  const remainingFurusatoQuota = Math.max(0, furusatoLimitEstimate - actualFurusatoDonations);

  // 故鄉納稅扣除額 (自負2,000円): 抵所得稅 + 抵住民稅
  const effectiveFurusatoDonated = Math.min(actualFurusatoDonations, furusatoLimitEstimate);
  const furusatoDeductible = Math.max(0, effectiveFurusatoDonated - 2_000);
  const furusatoDeductionResidentTax = Math.floor(furusatoDeductible * 0.9); // 大部分由住民稅扣除
  const furusatoEffectiveSavings = furusatoDeductible;

  const finalResidentTax = Math.max(
    residentTaxEqualPortion,
    residentTaxIncomePortion +
      residentTaxEqualPortion -
      housingLoanCreditResidentTax -
      furusatoDeductionResidentTax
  );

  // 10. 實質手取り額與稅費合計
  const totalTaxesAndSocialSecurity = totalSocialInsurance + finalIncomeTax + finalResidentTax;
  const netTakeHomePay = Math.max(0, totalGrossIncome - totalTaxesAndSocialSecurity);
  const takeHomeRate = totalGrossIncome > 0 ? (netTakeHomePay / totalGrossIncome) * 100 : 0;

  // 11. 節稅總成效 (Tax Savings from Strategies)
  // iDeCo 節稅 = iDeCo年間額 × (所得稅率×1.021 + 住民稅10%)
  const idecoTaxSavings = Math.floor(idecoDeduction * (marginalIncomeTaxRate * 1.021 + 0.1));
  // 故鄉納稅節稅效益 = 捐款抵稅額 (除自負2000円外)
  const furusatoSavings = Math.max(0, actualFurusatoDonations - 2_000);
  // 房貸扣除直接抵稅額
  const housingLoanSavings = housingLoanCreditIncomeTax + housingLoanCreditResidentTax;
  // 醫療費節稅額
  const medicalSavings = Math.floor(medicalDeduction * (marginalIncomeTaxRate * 1.021 + 0.1));
  // 青色申告節稅額
  const blueSavings = Math.floor(blueDeduction * (marginalIncomeTaxRate * 1.021 + 0.1));

  const totalTaxSavings =
    idecoTaxSavings +
    furusatoSavings +
    housingLoanSavings +
    medicalSavings +
    blueSavings +
    foreignTaxCreditIncomeTax;

  // 12. 確定申告診斷分析 (Need Final Tax Return Analysis)
  const taxReturnReasons: string[] = [];

  // 副業所得 > 20萬判定
  const totalSideNetIncome = annualSideNetIncome + annualOverseasNetIncome;
  const sideIncomeOver200k = totalSideNetIncome > 200_000;

  if (sideIncomeOver200k) {
    taxReturnReasons.push(
      `副業及海外所得淨額達 ¥${totalSideNetIncome.toLocaleString()}，已超過 20 萬日圓國稅申告門檻，必須辦理確定申告。`
    );
  } else if (totalSideNetIncome > 0) {
    taxReturnReasons.push(
      `副業淨所得 ¥${totalSideNetIncome.toLocaleString()} 未滿 20 萬日圓，免所得稅申告，但仍須向居住地區役所提交「住民稅申告」。`
    );
  }

  // 故鄉納稅自治體 > 5
  const uniqueMunicipalities = new Set(filteredFurusato.map((f) => f.municipality.trim())).size;
  const hasNotAppliedOneStop = filteredFurusato.some((f) => !f.oneStopApplied);
  if (uniqueMunicipalities > 5) {
    taxReturnReasons.push(
      `故鄉納稅捐贈自治體達 ${uniqueMunicipalities} 個（超過 5 個上限），無法適用 One-Stop 特例，必須辦理確定申告方能享有減稅！`
    );
  } else if (hasNotAppliedOneStop && actualFurusatoDonations > 0) {
    taxReturnReasons.push(`有故鄉納稅捐款尚未申請 One-Stop 特例，若未申請需透過確定申告抵減。`);
  }

  // 房貸第1年
  if (settings.housingLoan.hasLoan && settings.housingLoan.entryYear === year) {
    taxReturnReasons.push(`住宅貸款扣除首年度（入居第 1 年）依法必須自行辦理確定申告，第 2 年起方可透過公司年末調整。`);
  }

  // 醫療費控除 > 0
  if (medicalDeduction > 0) {
    taxReturnReasons.push(
      `醫療費自費額扣除門檻後有 ¥${medicalDeduction.toLocaleString()} 可申報扣除，此項目無法在年末調整辦理，需確定申告退稅。`
    );
  }

  // 海外稅額扣除
  if (annualOverseasTaxPaid > 0) {
    taxReturnReasons.push(`海外已扣繳稅額（如美股 10% 股息稅），需透過確定申告申請「外國稅額控除」防止雙重課稅。`);
  }

  // 年收超過 2000 萬日圓
  if (annualEmploymentGross > 20_000_000) {
    taxReturnReasons.push(`年薪給與總額超過 2,000 萬日圓，公司無法進行年末調整，必須自行確定申告。`);
  }

  const needsFinalTaxReturn = taxReturnReasons.length > 0 && !taxReturnReasons.every((r) => r.includes('免所得稅申告'));

  return {
    year,
    annualSalaryGross,
    annualBonusGross,
    annualEmploymentGross,
    annualSideIncomeGross,
    annualSideExpenses,
    annualSideNetIncome,
    annualOverseasIncomeGross,
    annualOverseasNetIncome,
    annualOverseasTaxPaid,
    totalGrossIncome,

    employmentDeduction,
    salaryNetIncome,
    aggregateGrossIncome,

    basicDeduction,
    socialInsuranceDeduction,
    idecoDeduction,
    medicalDeduction,
    lifeInsuranceDeduction,
    earthquakeDeduction,
    spouseDeduction,
    dependentDeduction,
    totalIncomeDeductions,

    taxableIncomeForIncomeTax,
    taxableIncomeForResidentTax,

    marginalIncomeTaxRate,
    calculatedIncomeTax,
    reconstructionTax,
    totalIncomeTaxBeforeCredits,
    housingLoanCreditIncomeTax,
    foreignTaxCreditIncomeTax,
    finalIncomeTax,

    residentTaxIncomePortion,
    residentTaxEqualPortion,
    housingLoanCreditResidentTax,
    furusatoDeductionResidentTax,
    finalResidentTax,

    totalHealthInsurance,
    totalWelfarePension,
    totalEmploymentInsurance,
    totalSocialInsurance,

    totalTaxesAndSocialSecurity,
    netTakeHomePay,
    takeHomeRate,
    totalTaxSavings,

    furusatoLimitEstimate,
    actualFurusatoDonations,
    remainingFurusatoQuota,
    furusatoEffectiveSavings,

    sideIncomeOver200k,
    needsFinalTaxReturn,
    taxReturnReasons,
  };
}

/**
 * 升薪前後手取り模擬器 (Pay Raise Take-Home Simulator)
 * 解決日本上班族最在意的「加薪後邊際稅率與社保增加，實際手取多了多少？」
 */
export function simulatePayRaise(
  currentBaseSalaryMonthly: number,
  monthlyRaiseAmount: number,
  annualBonusGross: number,
  settings: TaxDeductionSettings
) {
  const currentAnnualSalary = currentBaseSalaryMonthly * 12;
  const newAnnualSalary = (currentBaseSalaryMonthly + monthlyRaiseAmount) * 12;

  const createDummySlips = (monthly: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const soc = estimateMonthlySocialInsurance(monthly);
      return {
        id: `sim_${i}`,
        year: 2026,
        month: i + 1,
        baseSalary: monthly,
        overtimePay: 0,
        allowances: 0,
        commuteAllowance: 10_000,
        healthInsurance: soc.healthInsurance,
        welfarePension: soc.welfarePension,
        employmentInsurance: soc.employmentInsurance,
        incomeTax: 0,
        residentTax: 0,
        otherDeductions: 0,
      } as MonthlySalarySlip;
    });
  };

  const createDummyBonus = () => [
    {
      id: 'sim_b1',
      year: 2026,
      month: 6,
      bonusType: 'summer' as const,
      title: '夏季獎金',
      grossAmount: Math.floor(annualBonusGross / 2),
      healthInsurance: Math.floor(annualBonusGross * 0.5 * 0.05),
      welfarePension: Math.floor(annualBonusGross * 0.5 * 0.0915),
      employmentInsurance: Math.floor(annualBonusGross * 0.5 * 0.006),
      incomeTax: 0,
      otherDeductions: 0,
    },
    {
      id: 'sim_b2',
      year: 2026,
      month: 12,
      bonusType: 'winter' as const,
      title: '冬季獎金',
      grossAmount: Math.floor(annualBonusGross / 2),
      healthInsurance: Math.floor(annualBonusGross * 0.5 * 0.05),
      welfarePension: Math.floor(annualBonusGross * 0.5 * 0.0915),
      employmentInsurance: Math.floor(annualBonusGross * 0.5 * 0.006),
      incomeTax: 0,
      otherDeductions: 0,
    },
  ];

  const beforeReport = calculateCompleteTaxReport(
    2026,
    createDummySlips(currentBaseSalaryMonthly),
    createDummyBonus(),
    [],
    [],
    [],
    settings
  );

  const afterReport = calculateCompleteTaxReport(
    2026,
    createDummySlips(currentBaseSalaryMonthly + monthlyRaiseAmount),
    createDummyBonus(),
    [],
    [],
    [],
    settings
  );

  const annualGrossIncrease = monthlyRaiseAmount * 12;
  const annualNetIncrease = afterReport.netTakeHomePay - beforeReport.netTakeHomePay;
  const monthlyNetIncrease = Math.round(annualNetIncrease / 12);
  const marginalTaxDrag = annualGrossIncrease - annualNetIncrease;
  const effectiveTakeHomeRatio = annualGrossIncrease > 0 ? (annualNetIncrease / annualGrossIncrease) * 100 : 0;

  return {
    annualGrossIncrease,
    monthlyGrossIncrease: monthlyRaiseAmount,
    annualNetIncrease,
    monthlyNetIncrease,
    marginalTaxDrag,
    effectiveTakeHomeRatio,
    beforeReport,
    afterReport,
  };
}
