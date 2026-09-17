import {
  MonthlySalarySlip,
  BonusSlip,
  PayRaiseRecord,
  ExtraIncomeRecord,
  FurusatoDonation,
  MedicalExpenseRecord,
  TaxDeductionSettings,
} from '../types/tax';

export const DEFAULT_TAX_SETTINGS: TaxDeductionSettings = {
  idecoMonthlyContribution: 20_000, // 20,000 円 / 月 (企業年金なし会社員上限23,000等)
  nisaAnnualInvestment: 1_200_000, // 年間 120 萬円投資
  housingLoan: {
    hasLoan: true,
    balanceYearEnd: 31_500_000, // 房貸年末餘額 3150 萬円
    deductionRate: 0.007, // 0.7%
    deductionLimit: 210_000, // 一般・省エネ住宅
    housingType: 'energy_efficient',
    entryYear: 2024,
  },
  dependents: {
    spouseType: 'none',
    children16to18: 0,
    children19to22: 0,
    elderly70plus: 0,
    otherDependents: 0,
  },
  insurance: {
    generalLifeInsurance: 80_000, // 一般生命保険
    nursingCareInsurance: 40_000, // 介護医療保険
    privatePensionInsurance: 40_000, // 個人年金保険
    earthquakeInsurance: 25_000, // 地震保険
  },
  blueReturnDeduction: 0,
};

// Clean Mode Default Settings: 0 demo loans, 0 demo insurance, ready for real inputs
export const CLEAN_TAX_SETTINGS: TaxDeductionSettings = {
  idecoMonthlyContribution: 0,
  nisaAnnualInvestment: 0,
  housingLoan: {
    hasLoan: false,
    balanceYearEnd: 0,
    deductionRate: 0.007,
    deductionLimit: 210_000,
    housingType: 'general',
    entryYear: 2025,
  },
  dependents: {
    spouseType: 'none',
    children16to18: 0,
    children19to22: 0,
    elderly70plus: 0,
    otherDependents: 0,
  },
  insurance: {
    generalLifeInsurance: 0,
    nursingCareInsurance: 0,
    privatePensionInsurance: 0,
    earthquakeInsurance: 0,
  },
  blueReturnDeduction: 0,
};

// Helper to determine if an ID originates from the demo simulation dataset
export const isDemoRecordId = (id?: string): boolean => {
  if (!id) return false;
  return (
    id.startsWith('sal_2026_') ||
    id.startsWith('bonus_2026_') ||
    id.startsWith('raise_2025_') ||
    (id.startsWith('raise_2026_') && !id.includes('user')) ||
    id.startsWith('extra_') ||
    id.startsWith('furu_') ||
    id.startsWith('med_') ||
    id.includes('demo')
  );
};

export const DEFAULT_SALARY_SLIPS_2026: MonthlySalarySlip[] = [
  {
    id: 'sal_2026_01',
    year: 2026,
    month: 1,
    baseSalary: 420_000,
    overtimePay: 38_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 23_852,
    welfarePension: 43_920,
    employmentInsurance: 2_868,
    incomeTax: 12_450,
    residentTax: 21_300,
    otherDeductions: 2_000,
    note: '1月份薪資（含跨年專案加班）',
  },
  {
    id: 'sal_2026_02',
    year: 2026,
    month: 2,
    baseSalary: 420_000,
    overtimePay: 22_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 23_053,
    welfarePension: 43_920,
    employmentInsurance: 2_772,
    incomeTax: 11_800,
    residentTax: 21_300,
    otherDeductions: 2_000,
  },
  {
    id: 'sal_2026_03',
    year: 2026,
    month: 3,
    baseSalary: 420_000,
    overtimePay: 45_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_201,
    welfarePension: 43_920,
    employmentInsurance: 2_910,
    incomeTax: 13_100,
    residentTax: 21_300,
    otherDeductions: 2_000,
    note: '年度決算專案加班較多',
  },
  {
    id: 'sal_2026_04',
    year: 2026,
    month: 4,
    baseSalary: 445_000, // 升薪 +25,000 円
    overtimePay: 30_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_700,
    welfarePension: 43_920,
    employmentInsurance: 2_970,
    incomeTax: 13_800,
    residentTax: 21_300,
    otherDeductions: 2_000,
    note: '4月度定期昇給（基本給 +25,000円）',
  },
  {
    id: 'sal_2026_05',
    year: 2026,
    month: 5,
    baseSalary: 445_000,
    overtimePay: 25_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_451,
    welfarePension: 43_920,
    employmentInsurance: 2_940,
    incomeTax: 13_200,
    residentTax: 21_300,
    otherDeductions: 2_000,
  },
  {
    id: 'sal_2026_06',
    year: 2026,
    month: 6,
    baseSalary: 445_000,
    overtimePay: 28_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_600,
    welfarePension: 43_920,
    employmentInsurance: 2_958,
    incomeTax: 13_500,
    residentTax: 22_100, // 6月新年度住民稅決定額更新
    otherDeductions: 2_000,
  },
  {
    id: 'sal_2026_07',
    year: 2026,
    month: 7,
    baseSalary: 445_000,
    overtimePay: 18_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_101,
    welfarePension: 43_920,
    employmentInsurance: 2_898,
    incomeTax: 12_900,
    residentTax: 22_100,
    otherDeductions: 2_000,
  },
  {
    id: 'sal_2026_08',
    year: 2026,
    month: 8,
    baseSalary: 445_000,
    overtimePay: 15_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 23_952,
    welfarePension: 43_920,
    employmentInsurance: 2_880,
    incomeTax: 12_600,
    residentTax: 22_100,
    otherDeductions: 2_000,
    note: '夏季お盆休假',
  },
  {
    id: 'sal_2026_09',
    year: 2026,
    month: 9,
    baseSalary: 445_000,
    overtimePay: 32_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_800,
    welfarePension: 45_750, // 9月定時決定 (4,5,6月標準報酬月額改定)
    employmentInsurance: 2_982,
    incomeTax: 13_700,
    residentTax: 22_100,
    otherDeductions: 2_000,
  },
  {
    id: 'sal_2026_10',
    year: 2026,
    month: 10,
    baseSalary: 445_000,
    overtimePay: 26_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_501,
    welfarePension: 45_750,
    employmentInsurance: 2_946,
    incomeTax: 13_300,
    residentTax: 22_100,
    otherDeductions: 2_000,
  },
  {
    id: 'sal_2026_11',
    year: 2026,
    month: 11,
    baseSalary: 445_000,
    overtimePay: 30_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_700,
    welfarePension: 45_750,
    employmentInsurance: 2_970,
    incomeTax: 13_600,
    residentTax: 22_100,
    otherDeductions: 2_000,
  },
  {
    id: 'sal_2026_12',
    year: 2026,
    month: 12,
    baseSalary: 445_000,
    overtimePay: 35_000,
    allowances: 20_000,
    commuteAllowance: 12_500,
    healthInsurance: 24_950,
    welfarePension: 45_750,
    employmentInsurance: 3_000,
    incomeTax: 14_000,
    residentTax: 22_100,
    otherDeductions: 2_000,
    note: '年末公司調整預扣',
  },
];

export const DEFAULT_BONUS_SLIPS_2026: BonusSlip[] = [
  {
    id: 'bonus_2026_summer',
    year: 2026,
    month: 6,
    bonusType: 'summer',
    title: '2026 夏季賞與（夏季獎金）',
    grossAmount: 750_000,
    healthInsurance: 37_425,
    welfarePension: 68_625,
    employmentInsurance: 4_500,
    incomeTax: 42_300,
    otherDeductions: 0,
    note: '考績評價 A 等賞與',
  },
  {
    id: 'bonus_2026_winter',
    year: 2026,
    month: 12,
    bonusType: 'winter',
    title: '2026 冬季賞與（冬季獎金）',
    grossAmount: 820_000,
    healthInsurance: 40_918,
    welfarePension: 75_030,
    employmentInsurance: 4_920,
    incomeTax: 48_500,
    otherDeductions: 0,
    note: '冬季年終獎金',
  },
];

export const DEFAULT_PAY_RAISE_RECORDS: PayRaiseRecord[] = [
  {
    id: 'raise_2025_04',
    effectiveDate: '2025-04',
    previousBaseSalary: 400_000,
    newBaseSalary: 420_000,
    monthlyIncrease: 20_000,
    annualIncreaseEstimate: 240_000,
    reason: '定期昇給',
    note: '2025年度考核調薪',
  },
  {
    id: 'raise_2026_04',
    effectiveDate: '2026-04',
    previousBaseSalary: 420_000,
    newBaseSalary: 445_000,
    monthlyIncrease: 25_000,
    annualIncreaseEstimate: 300_000,
    reason: '職級晉升 + Base-up (春闘)',
    note: '晉升為 Senior 技術職，基本薪調升 25,000 円',
  },
];

export const DEFAULT_EXTRA_INCOMES_2026: ExtraIncomeRecord[] = [
  {
    id: 'extra_1',
    date: '2026-03-20',
    type: 'domestic_side_gig',
    title: '國內技術顧問業務委託 (雜所得/副業)',
    taxCategory: 'miscellaneous',
    currency: 'JPY',
    originalAmount: 180_000,
    exchangeRate: 1.0,
    amountJpy: 180_000,
    expensesJpy: 28_000,
    netIncomeJpy: 152_000,
    overseasTaxWithheldJpy: 0,
    isOverseas: false,
    note: '雲端架構設計諮詢，扣除相關軟體與書籍經費',
  },
  {
    id: 'extra_2',
    date: '2026-06-18',
    type: 'overseas_dividend',
    title: '美國標普500 ETF (VOO) 季度股息',
    taxCategory: 'dividend',
    currency: 'USD',
    originalAmount: 480,
    exchangeRate: 155.0,
    amountJpy: 74_400,
    expensesJpy: 0,
    netIncomeJpy: 74_400,
    overseasTaxWithheldJpy: 7_440, // 美國 10% 預扣 (可申報外國稅額控除)
    isOverseas: true,
    note: '美股券商扣除 10% 預扣稅，換算日圓 7,440 円',
  },
  {
    id: 'extra_3',
    date: '2026-08-10',
    type: 'overseas_salary',
    title: '台灣母公司海外遠端顧問諮詢費',
    taxCategory: 'miscellaneous',
    currency: 'TWD',
    originalAmount: 35_000,
    exchangeRate: 4.85,
    amountJpy: 169_750,
    expensesJpy: 15_000,
    netIncomeJpy: 154_750,
    overseasTaxWithheldJpy: 0,
    isOverseas: true,
    note: '遠端架構代碼審查與會議，匯率約 4.85',
  },
];

export const DEFAULT_FURUSATO_DONATIONS_2026: FurusatoDonation[] = [
  {
    id: 'furu_1',
    date: '2026-02-14',
    municipality: '北海道紋別市',
    amount: 22_000,
    returnGift: 'オホーツク産ホタテ玉冷大 (特大1kg)',
    oneStopApplied: true,
    receiptReceived: true,
  },
  {
    id: 'furu_2',
    date: '2026-05-10',
    municipality: '宮崎縣都城市',
    amount: 25_000,
    returnGift: '宮崎牛特選ロースすき焼き用 (800g)',
    oneStopApplied: true,
    receiptReceived: true,
  },
  {
    id: 'furu_3',
    date: '2026-07-28',
    municipality: '山梨縣南阿爾卑斯市',
    amount: 18_000,
    returnGift: 'シャインマスカット (晴王麝香葡萄 2房)',
    oneStopApplied: false, // 提醒用戶辦理
    receiptReceived: true,
  },
];

export const DEFAULT_MEDICAL_EXPENSES_2026: MedicalExpenseRecord[] = [
  {
    id: 'med_1',
    date: '2026-04-12',
    patientName: '本人',
    hospitalOrPharmacy: '銀座齒科醫院',
    amount: 85_000,
    insuranceReimbursement: 0,
    note: '自費陶瓷牙冠齒列修復 (醫療費控除対象)',
  },
  {
    id: 'med_2',
    date: '2026-06-05',
    patientName: '本人',
    hospitalOrPharmacy: '都立綜合病院 眼科',
    amount: 42_000,
    insuranceReimbursement: 10_000,
    note: '角膜精密檢查與治療（保險給付補填 10,000 円）',
  },
];
