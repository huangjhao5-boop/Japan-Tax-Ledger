export type IncomeCategory = 'salary' | 'bonus';

export interface MonthlySalarySlip {
  id: string;
  year: number;
  month: number; // 1 - 12
  companyName?: string; // 勤務先会社
  employeeName?: string; // 社員名
  // 支給項目 (Earnings)
  baseSalary: number; // 基本給 (JPY)
  roleAllowance?: number; // 役割達成手当
  substituteHolidayPayA?: number; // 代休買取A手当
  substituteHolidayPayB?: number; // 代休買取B手当
  lastMonthShortage?: number; // 先月不足分
  childcareLeaveDeduction?: number; // 育児休業控除 (支給側控除)
  lateEarlyLeaveDeduction?: number; // 遅刻早退控除 (支給側控除)
  absenceDeduction?: number; // 欠勤控除 (支給側控除)
  overtimePay: number; // 平日残業手当 (JPY)
  holidayOvertimePay?: number; // 休日残業手当
  holidayWorkPay?: number; // 休日出勤手当 (差額)
  nightAllowance?: number; // 深夜割増手当
  familyAllowance?: number; // 扶養手当
  specialAllowance?: number; // 特別手当
  allowances: number; // その他役職・家族・諸手当等 (課税対象)
  taxableGross?: number; // 課税合計・課税支給額合計 (JPY)
  commuteAllowance: number; // 非課税通勤費 (通常15万円/月まで非課税)
  businessTripAllowance?: number; // 非課税出張旅費 (用戶特別指定需預留格子)
  nonTaxableTotal?: number; // 非課税合計 (通勤費 + 出張旅費)
  totalGross?: number; // 総支給額合計 (課税合計 + 非課税合計)
  // Deductions (控除項目：社保・税金・積立)
  healthInsurance: number; // 健康保険料
  welfarePension: number; // 厚生年金保険料
  welfarePensionFund?: number; // 厚生年金基金
  nursingCareInsurance?: number; // 介護保険料 (40歲以上第2號被保險者)
  employmentInsurance: number; // 雇用保険料
  socialInsuranceTotal?: number; // 社会保険合計
  incomeTax: number; // 源泉所得税
  residentTax: number; // 市県民税・住民税 (特別徴収)
  taxDeductionTotal?: number; // 税金控除合計
  taxableBase?: number; // 課税対象額 (課税合計 - 社会保険合計)
  paperDeductionTotal?: number; // 票面印字「控除合計」(通常為社保計 + 税金計)
  travelSavings?: number; // 旅行積立金 (勤怠欄外但實質為扣除項目)
  otherDeductions: number; // その他控除 (旅行積立金・財形・組合費・自社株等)
  otherDeductionsNote?: string; // 控除項目明細
  totalDeductions?: number; // 差引総控除額 (法定控除 + その他控除)
  netPay?: number; // 差引支給額 (手取り実質支給額)
  // Attendance records (勤怠明細項目)
  attendance?: {
    workDays?: number; // 要勤務日数
    actualWorkDays?: number; // 出勤日数
    absenceDays?: number; // 欠勤日数
    substituteHolidays?: number; // 代休日数
    holidayWorkDays?: number; // 休日出勤日数
    transferHolidays?: number; // 振休日数
    paidLeaveUsed?: number; // 有給・特休消化
    paidLeaveRemaining?: number; // 有給・特休残
    overtimeHours?: number; // 平日残業時間
    holidayOvertimeHours?: number; // 休日残業時間
    holidayWorkHours?: number; // 休日出勤(該当)時間
    nightHours?: number; // 深夜割増時間
    commuteDays?: number; // 通勤日数
    commuteDaysCar?: number; // 通勤日数(マイカー)
    businessTripDistanceKm?: number; // 出張旅費(Km)
    substituteHolidayADays?: number; // 代休買取A日数
    substituteHolidayBDays?: number; // 代休買取B日数
    childcareLeaveDays?: number; // 育児休業日数
    substituteHolidayDailyRate?: number; // 代休買い取り額(1日分)
    travelSavingsPeriod?: string; // 旅行積立金 徴収期間
    dependentsCount?: number; // 扶養親族等の数
    careInsuranceApplicable?: string; // 介護保険第2号被保険者
  };
  confidenceScore?: number; // 辨識精準度評分
  checks?: {
    name: string;
    passed: boolean;
    formula: string;
  }[];
  note?: string;
}

export type BonusType = 'summer' | 'winter' | 'performance' | 'other';

export interface BonusSlip {
  id: string;
  year: number;
  month: number;
  bonusType: BonusType;
  title: string;
  grossAmount: number; // 賞与額面 (JPY)
  healthInsurance: number; // 賞与健康保険料
  welfarePension: number; // 賞与厚生年金料 (上限有)
  employmentInsurance: number; // 賞与雇用保険料
  incomeTax: number; // 賞与源泉所得税
  otherDeductions: number;
  note?: string;
}

export interface PayRaiseRecord {
  id: string;
  effectiveDate: string; // YYYY-MM
  previousBaseSalary: number;
  newBaseSalary: number;
  monthlyIncrease: number;
  annualIncreaseEstimate: number;
  reason: string; // e.g. 定期昇給, 役職昇進, 転職, ベースアップ
  note?: string;
}

export type ExtraIncomeType =
  | 'domestic_side_gig' // 國內副業 (業務委託・雜所得)
  | 'domestic_dividend' // 國內股息/配當
  | 'overseas_dividend' // 海外股息 (如美股/海外ETF)
  | 'overseas_salary' // 海外遠端顧問/薪酬
  | 'overseas_crypto' // 海外虛擬貨幣收益
  | 'other';

export type TaxCategory = 'business' | 'miscellaneous' | 'dividend' | 'capital_gain';

export interface ExtraIncomeRecord {
  id: string;
  date: string;
  type: ExtraIncomeType;
  title: string;
  taxCategory: TaxCategory;
  currency: 'JPY' | 'USD' | 'TWD' | 'EUR' | 'CNY';
  originalAmount: number;
  exchangeRate: number; // to JPY
  amountJpy: number; // 換算日幣毛收入
  expensesJpy: number; // 必要經費 (日圓)
  netIncomeJpy: number; // 淨所得 (日圓) = amountJpy - expensesJpy
  overseasTaxWithheldJpy: number; // 海外已扣繳稅額 (日圓, 用於外國稅額控除)
  isOverseas: boolean;
  note?: string;
}

export interface FurusatoDonation {
  id: string;
  date: string;
  municipality: string; // 自治体名 (e.g. 北海道紋別市)
  amount: number; // 寄附金額 (JPY)
  returnGift: string; // 返礼品 (e.g. ホタテ 1kg)
  oneStopApplied: boolean; // 是否已送出 One-Stop 特例申請書
  receiptReceived: boolean; // 是否已收到寄附金受領証明書
  note?: string;
}

export interface MedicalExpenseRecord {
  id: string;
  date: string;
  patientName: string;
  hospitalOrPharmacy: string;
  amount: number;
  insuranceReimbursement: number; // 保険給付等で補填された金額
  note?: string;
}

export interface HousingLoanConfig {
  hasLoan: boolean;
  balanceYearEnd: number; // 年末ローン残高 (JPY)
  deductionRate: number; // 現行通常 0.7%
  deductionLimit: number; // 最大控除額 (一般住宅 14-21萬, 省エネ・ZEH等 28-35萬)
  housingType: 'general' | 'energy_efficient' | 'zeh' | 'certified_long_life';
  entryYear: number; // 借入居住開始年 (第1年需確定申告)
}

export interface DependentsConfig {
  spouseType: 'none' | 'general' | 'special'; // 配偶者控除 / 配偶者特別控除
  children16to18: number; // 一般扶養親族 (38万円)
  children19to22: number; // 特定扶養親族 (63万円)
  elderly70plus: number; // 老人扶養親族 (同居58万/別居48万)
  otherDependents: number; // その他扶養
}

export interface InsuranceDeductionConfig {
  generalLifeInsurance: number; // 一般生命保険料 (年間支払額)
  nursingCareInsurance: number; // 介護医療保険料
  privatePensionInsurance: number; // 個人年金保険料
  earthquakeInsurance: number; // 地震保険料
}

export interface TaxDeductionSettings {
  idecoMonthlyContribution: number; // iDeCo 月繳掛金 (12,000 ~ 68,000 JPY)
  nisaAnnualInvestment: number; // 新NISA 年投資額 (非課稅利益對照)
  housingLoan: HousingLoanConfig;
  dependents: DependentsConfig;
  insurance: InsuranceDeductionConfig;
  blueReturnDeduction: 0 | 100000 | 550000 | 650000; // 青色申告特別控除 (副業事業所得)
}

export interface CompleteTaxReport {
  year: number;
  // Incomes
  annualSalaryGross: number; // 年間給與額面 (含加班手當、課稅手當，不含非課稅通勤費)
  annualBonusGross: number; // 年間獎金額面
  annualEmploymentGross: number; // 給與+獎金總額
  annualSideIncomeGross: number; // 副業毛收入
  annualSideExpenses: number; // 副業經費
  annualSideNetIncome: number; // 副業淨所得
  annualOverseasIncomeGross: number; // 海外所得毛額
  annualOverseasNetIncome: number; // 海外淨所得
  annualOverseasTaxPaid: number; // 海外已繳稅額 (外國稅額控除計算用)
  totalGrossIncome: number; // 全部毛收入

  // Deductions from Income
  employmentDeduction: number; // 給與所得控除 (Salary Income Deduction)
  salaryNetIncome: number; // 給與所得金額 = 給與總額 - 給與所得控除
  aggregateGrossIncome: number; // 總所得金額 (給與所得 + 副業營業/雜所得等)

  // Income Deductions (所得控除)
  basicDeduction: number; // 基礎控除 (所得稅 48萬, 住民稅 43萬)
  socialInsuranceDeduction: number; // 社會保險料控除
  idecoDeduction: number; // 小規模企業共済等掛金控除 (iDeCo年間合計)
  medicalDeduction: number; // 醫療費控除
  lifeInsuranceDeduction: number; // 生命保險料控除
  earthquakeDeduction: number; // 地震保險料控除
  spouseDeduction: number; // 配偶者(特別)控除
  dependentDeduction: number; // 扶養控除
  totalIncomeDeductions: number; // 所得控除合計

  // Taxable Income (課稅所得)
  taxableIncomeForIncomeTax: number; // 課稅所得金額 (千円未満切捨)
  taxableIncomeForResidentTax: number; // 住民稅課稅所得金額

  // Taxes
  marginalIncomeTaxRate: number; // 邊際所得稅率 (%)
  calculatedIncomeTax: number; // 基準所得稅額
  reconstructionTax: number; // 復興特別所得稅 (2.1%)
  totalIncomeTaxBeforeCredits: number; // 稅額控除前所得稅額
  housingLoanCreditIncomeTax: number; // 住宅借入金等特別控除 (所得稅抵減)
  foreignTaxCreditIncomeTax: number; // 外國稅額控除 (所得稅抵減)
  finalIncomeTax: number; // 確定應納所得稅

  // Resident Tax (住民稅)
  residentTaxIncomePortion: number; // 住民稅所得割 (10%)
  residentTaxEqualPortion: number; // 住民稅均等割 (約 5,000 JPY 含森林環境稅)
  housingLoanCreditResidentTax: number; // 住宅貸款抵減住民稅部分 (上限有)
  furusatoDeductionResidentTax: number; // 故鄉納稅抵減住民稅額 (基本控除+特例控除)
  finalResidentTax: number; // 確定應納住民稅

  // Social Insurance Total
  totalHealthInsurance: number; // 健康保險
  totalWelfarePension: number; // 厚生年金
  totalEmploymentInsurance: number; // 雇用保險
  totalSocialInsurance: number; // 社會保險合計

  // Take-Home & Savings
  totalTaxesAndSocialSecurity: number; // 稅金與社保總負擔
  netTakeHomePay: number; // 實際手取り額
  takeHomeRate: number; // 手取り率 (%)
  totalTaxSavings: number; // 因各項減稅對策所節省之稅金合計 (iDeCo, 故鄉納稅, 房貸, 醫療費等)

  // Furusato Nozei Optimization
  furusatoLimitEstimate: number; // 故鄉納稅最佳限度額 (自負2,000円上限)
  actualFurusatoDonations: number; // 實際已捐贈金額
  remainingFurusatoQuota: number; // 剩餘可用限度額
  furusatoEffectiveSavings: number; // 故鄉納稅節稅效益 (寄附額 - 2000円)

  // Side Gig 20-Man Alert
  sideIncomeOver200k: boolean; // 是否超過20萬円申告門檻
  needsFinalTaxReturn: boolean; // 是否必須辦理確定申告
  taxReturnReasons: string[]; // 需確定申告的具體理由清單
}
