import {
  MonthlySalarySlip,
  BonusSlip,
  ExtraIncomeRecord,
  MedicalExpenseRecord,
  TaxDeductionSettings,
  CompleteTaxReport,
} from '../types/tax';

export interface TaxRecommendation {
  id: string;
  title: string;
  category: 'donation' | 'pension' | 'housing' | 'family' | 'side_business' | 'medical' | 'overseas' | 'investment' | 'expense';
  priority: 'high' | 'medium' | 'low';
  potentialSavingsJpy: number; // 預估節省之所得稅+住民稅合計
  currentStatus: 'applied' | 'partially_applied' | 'not_applied';
  badge: string;
  summary: string;
  conditionDescription: string; // 適用條件
  effectDescription: string; // 預期節稅效果
  filingMethod: '年末調整' | '確定申告' | '兩者皆可' | 'One-Stop特例';
  actionTip: string;
  lawReference: string;
}

/**
 * 智慧化減稅對策推薦引擎 (Smart Japanese Tax Advisor Engine)
 * 根據日本現行所得稅法、地方稅法與2025/2026最新稅制改定
 */
export function generateSmartTaxRecommendations(
  salarySlips: MonthlySalarySlip[],
  bonuses: BonusSlip[],
  extraIncomes: ExtraIncomeRecord[],
  medicalExpenses: MedicalExpenseRecord[],
  settings: TaxDeductionSettings,
  report: CompleteTaxReport
): TaxRecommendation[] {
  const recommendations: TaxRecommendation[] = [];

  // Marginal combined tax rate (所得稅率 + 住民稅率 10%)
  const marginalIncomeRate = report.marginalIncomeTaxRate / 100;
  const combinedMarginalRate = marginalIncomeRate + 0.10; // e.g. 5% + 10% = 15%, or 10% + 10% = 20%

  // Total employment income
  const totalEmploymentGross = report.annualEmploymentGross;

  // ----------------------------------------------------
  // 1. ふるさと納税 (故鄉納稅限額最大化活用)
  // ----------------------------------------------------
  const furusatoLimit = report.furusatoLimitEstimate || 30000;
  const actualDonated = report.actualFurusatoDonations || 0;
  const remainingQuota = Math.max(0, furusatoLimit - actualDonated);
  const potentialFurusatoSavings = remainingQuota > 2000 ? Math.round((remainingQuota - 2000) * 0.3) + (remainingQuota - 2000) : 0;

  if (remainingQuota > 5000) {
    recommendations.push({
      id: 'rec_furusato',
      title: '故鄉納稅（ふるさと納税）剩餘額度充分利用',
      category: 'donation',
      priority: 'high',
      potentialSavingsJpy: remainingQuota,
      currentStatus: actualDonated > 0 ? 'partially_applied' : 'not_applied',
      badge: '實質2,000円換高品質返禮品',
      summary: `您目前還有約 ¥${remainingQuota.toLocaleString()} 的故鄉納稅限額未充分利用。`,
      conditionDescription: '為居住在日本的個人居民。全年向自治體寄附，只要在上限額度內，扣除自己負擔 2,000 日圓後的全部金額，均可全額折抵所得稅與住民稅。若年內寄附自治體在 5 個以內且為給與所得者，可申請 One-Stop 特例免辦確定申告。',
      effectDescription: `依法寄附滿 ¥${remainingQuota.toLocaleString()}，所得稅與翌年住民稅將抵扣約 ¥${(remainingQuota - 2000).toLocaleString()}。同時可獲得地方自治體回饋相當於寄附額 30%（約 ¥${Math.round(remainingQuota * 0.3).toLocaleString()}）的地方特產返禮品（和牛、海鮮、米等）。`,
      filingMethod: 'One-Stop特例',
      actionTip: '登入「さとふる」或「樂天故鄉納稅」，在 12 月 31 日前完成寄附。若自治體 ≤ 5 個且無其他副業確定申告需求，於翌年 1 月 10 日前寄回 One-Stop 特例申請書。',
      lawReference: '地方税法第37条の2、所得税法第78条（寄附金控除）',
    });
  } else {
    recommendations.push({
      id: 'rec_furusato_done',
      title: '故鄉納稅已接近或達到上限最佳化',
      category: 'donation',
      priority: 'low',
      potentialSavingsJpy: Math.max(0, actualDonated - 2000),
      currentStatus: 'applied',
      badge: '已最佳化',
      summary: `本年度已寄附 ¥${actualDonated.toLocaleString()}（限額約 ¥${furusatoLimit.toLocaleString()}），請妥善保管受領證明書。`,
      conditionDescription: '已寄附之證明書或 XML 電子交付資料需在翌年申報或確認 One-Stop 送達。',
      effectDescription: `已成功獲得約 ¥${Math.max(0, actualDonated - 2000).toLocaleString()} 的住民稅與所得稅抵減效果。`,
      filingMethod: '兩者皆可',
      actionTip: '請至各平台下載寄附金受領証明書 XML 檔，若有副業確定申告需求，需一併上傳 e-Tax 申報（此時 One-Stop 會自動失效轉為確定申告扣除）。',
      lawReference: '地方税法附則第7条',
    });
  }

  // ----------------------------------------------------
  // 2. iDeCo (個人型確定拠出年金 - 全額所得控除)
  // ----------------------------------------------------
  const currentIdecoMonthly = settings.idecoMonthlyContribution || 0;
  const standardEmployeeLimitMonthly = 23000; // 一般企業無企業型DC通常最高2.3萬/月
  const idecoRoomMonthly = Math.max(0, standardEmployeeLimitMonthly - currentIdecoMonthly);
  const potentialIdecoTaxSavings = Math.round(idecoRoomMonthly * 12 * combinedMarginalRate);

  if (idecoRoomMonthly > 0) {
    recommendations.push({
      id: 'rec_ideco',
      title: '加入 iDeCo 個人型確定拠出年金（節省所得稅與住民稅）',
      category: 'pension',
      priority: 'high',
      potentialSavingsJpy: potentialIdecoTaxSavings,
      currentStatus: currentIdecoMonthly > 0 ? 'partially_applied' : 'not_applied',
      badge: `掛金全額扣除 / 現行邊際稅率 ${(combinedMarginalRate * 100).toFixed(0)}%`,
      summary: `每月提撥 ¥${idecoRoomMonthly.toLocaleString()}，全年可額外減少課稅所得 ¥${(idecoRoomMonthly * 12).toLocaleString()}。`,
      conditionDescription: '20歲以上65歲未滿的在日公務員或公司職員（第2號被保險者）。掛金（上限一般為每月 1.2 萬至 2.3 萬日圓，視公司是否有企業年金而定）全額享有「小規模企業共済等掛金控除」。',
      effectDescription: `提撥金額 100% 自課稅所得中扣除。按您目前的所得稅率與住民稅率合計約 ${(combinedMarginalRate * 100).toFixed(0)}% 計算，每年直接少繳約 ¥${potentialIdecoTaxSavings.toLocaleString()} 的稅金；且投資運用期間利息、紅利全額免稅！`,
      filingMethod: '年末調整',
      actionTip: '向 SBI 證券、樂天證券或主要銀行索取 iDeCo 申請書，並請公司人資部門填寫「第2号被保険者にかかる証明書」。年底前透過年末調整檢附掛金拂込証明書即可。',
      lawReference: '所得税法第75条、確定拠出年金法',
    });
  }

  // ----------------------------------------------------
  // 3. 外国税額控除 (海外所得二重課稅解消)
  // ----------------------------------------------------
  const hasOverseasIncome = extraIncomes.some((e) => e.isOverseas);
  const totalOverseasTaxPaid = extraIncomes
    .filter((e) => e.isOverseas)
    .reduce((sum, e) => sum + (e.overseasTaxWithheldJpy || 0), 0);

  if (hasOverseasIncome) {
    const estimatedForeignCredit = Math.min(
      totalOverseasTaxPaid,
      Math.round(report.calculatedIncomeTax * 0.3) // 簡化限額預估
    );

    recommendations.push({
      id: 'rec_foreign_tax',
      title: '申報「外国税額控除」消除海外所得雙重課稅',
      category: 'overseas',
      priority: 'high',
      potentialSavingsJpy: totalOverseasTaxPaid > 0 ? totalOverseasTaxPaid : 15000,
      currentStatus: totalOverseasTaxPaid > 0 ? 'partially_applied' : 'not_applied',
      badge: '海外投資・美股股利必備',
      summary: '您登記了海外額外收入/投資。已在海外扣繳的稅款，可自日本所得稅與住民稅中直接抵減！',
      conditionDescription: '日本居住者（非永住者在日 5 年內若海外未送金部分除外，滿 5 年為永久居住者全球課稅）。在海外已依當地稅法繳納所得稅（如美股股息被美國 IRS 預扣 10% 稅款）。',
      effectDescription: `將海外已繳納的稅額於確定申告書附表四（外国税額控除に関する明細書）申報，可在法定限額內直接 1:1 自日本所得稅中扣抵，大幅避免同筆收入被跨國重複剝皮。`,
      filingMethod: '確定申告',
      actionTip: '下載海外券商（如 Firstrade, Interactive Brokers, 嘉信理財）的 1042-S 扣繳憑單或年間交易報告書，確定申告時填入「外国税額控除」欄位。',
      lawReference: '所得税法第95条（外国税額控除）、地方税法第37条の3',
    });
  }

  // ----------------------------------------------------
  // 4. 副業青色申告特別控除 (最高 65 萬円)
  // ----------------------------------------------------
  const sideNetIncome = report.annualSideNetIncome;
  if (sideNetIncome > 100000 && settings.blueReturnDeduction < 650000) {
    const additionalBlueDeduction = 650000 - settings.blueReturnDeduction;
    const estimatedSavings = Math.round(additionalBlueDeduction * combinedMarginalRate);

    recommendations.push({
      id: 'rec_blue_return',
      title: '將副業登記為事業所得，申請「青色申告」享 65 萬円特別扣除',
      category: 'side_business',
      priority: 'high',
      potentialSavingsJpy: estimatedSavings,
      currentStatus: 'not_applied',
      badge: '大幅降低副業課稅所得',
      summary: `您的副業淨所得達 ¥${sideNetIncome.toLocaleString()}。升級為青色申告可享有高達 65 萬日圓的純所得抵減！`,
      conditionDescription: '副業具有持續性、營利性與獨立業務規模（符合國稅廳事業所得判定基準，且有妥善帳簿保存），向稅務署提交「開業届」與「青色申告承認申請書」。',
      effectDescription: `採用複式簿記並透過 e-Tax 電子申告，可無條件從副業營業利潤中直接扣除 ¥650,000。按您的稅率估計每年可少繳約 ¥${estimatedSavings.toLocaleString()} 稅款，且虧損可往後結轉 3 年！`,
      filingMethod: '確定申告',
      actionTip: '每年 3 月 15 日前（或開業後 2 個月內）向管轄稅務署提交「所得税の青色申告承認申請書」，並使用 freee 或 MoneyForward 雲端記帳導出決算書。',
      lawReference: '租税特別措置法第25条の2（青色申告特別控除）',
    });
  }

  // ----------------------------------------------------
  // 5. 扶養控除 / 海外親族送金扶養控除
  // ----------------------------------------------------
  const hasSpouse = settings.dependents.spouseType !== 'none';
  const hasDependents =
    settings.dependents.children16to18 > 0 ||
    settings.dependents.children19to22 > 0 ||
    settings.dependents.elderly70plus > 0 ||
    settings.dependents.otherDependents > 0;

  recommendations.push({
    id: 'rec_dependents_overseas',
    title: '國外居住親族扶養控除（撫養海外父母或子女）',
    category: 'family',
    priority: hasDependents ? 'medium' : 'high',
    potentialSavingsJpy: Math.round(380000 * combinedMarginalRate),
    currentStatus: hasDependents ? 'applied' : 'not_applied',
    badge: '在日外國人常用節稅管道',
    summary: '若您定期從日本匯款撫養海外非同居的親屬（如父母或成年求學子女），每人可抵扣 38~63 萬日圓所得！',
    conditionDescription: '親屬生計相連（一年送金每人至少滿 38 萬日圓，若為 30~69 歲親族依最新稅制需留學、身障或送金滿 38 萬日圓）。需備妥親族關係證明（戶籍謄本公證）與金融機構海外送金明細。',
    effectDescription: `每申報一位一般扶養親族，所得稅控除 38 萬、住民稅控除 33 萬；特定扶養（19~22歲）控除 63 萬；70歲以上老人扶養控除 48 萬。每位親屬每年可省稅約 ¥55,000 ~ ¥100,000！`,
    filingMethod: '兩者皆可',
    actionTip: '必須透過銀行（如 Wise、海外電匯）進行個人名義點對點匯款，絕不能由一人代表匯全家。年末調整時附上送金證明書即可申報。',
    lawReference: '所得税法第84条、第84条の2、国外居住親族に係る扶養控除等の見直し（令和5年施行）',
  });

  // ----------------------------------------------------
  // 6. 住宅借入金等特別控除 (住宅ローン控除)
  // ----------------------------------------------------
  if (!settings.housingLoan.hasLoan) {
    recommendations.push({
      id: 'rec_housing_loan',
      title: '住宅貸款減稅（住宅ローン控除 0.7%）',
      category: 'housing',
      priority: 'medium',
      potentialSavingsJpy: 140000,
      currentStatus: 'not_applied',
      badge: '購屋者最大稅收抵免',
      summary: '若未來在日購置自住住宅，年末貸款餘額的 0.7% 可直接從所得稅與住民稅中全額扣除！',
      conditionDescription: '個人自住住宅（床面積 50㎡ 以上，合計所得金額 2,000 萬日圓以下），借入 10 年以上金融機構貸款。省エネ、ZEH 等節能住宅享有更高借入限額。',
      effectDescription: '每年最高可直接抵扣 ¥140,000 ~ ¥350,000 稅額，最長可連續抵扣 13 年！抵不完的所得稅額，還可轉抵扣翌年住民稅（上限 9.75 萬日圓）。',
      filingMethod: '兩者皆可',
      actionTip: '交屋入居第 1 年必須親自向稅務署辦理「確定申告」。第 2 年起稅務署會寄送證明書，直接交給公司辦理「年末調整」即可自動抵減。',
      lawReference: '租税特別措置法第41条',
    });
  }

  // ----------------------------------------------------
  // 7. 医療費控除 vs セルフメディケーション税制
  // ----------------------------------------------------
  const totalMedicalPaid = medicalExpenses.reduce((sum, m) => sum + m.amount - m.insuranceReimbursement, 0);
  if (totalMedicalPaid < 100000) {
    recommendations.push({
      id: 'rec_self_medication',
      title: '自我藥療稅制（セルフメディケーション税制）二選一',
      category: 'medical',
      priority: 'low',
      potentialSavingsJpy: 12000,
      currentStatus: 'not_applied',
      badge: '藥局成藥超過1.2萬円即可抵稅',
      summary: '若全家年度自費醫療費未達 10 萬日圓門檻，但藥妝店購買指定 OTC 成藥超過 12,000 日圓，可選擇此特例！',
      conditionDescription: '個人有接受特定健康診查或定期預防接種。購買印有「セルフメディケーション税制控除対象」標章之特定成藥（感冒藥、止痛貼布、眼藥水等）全年自費超過 12,000 日圓。',
      effectDescription: '超過 12,000 日圓的部分可作所得扣除，最高扣除 88,000 日圓，約可節省所得稅與住民稅 ¥8,800 ~ ¥17,600。注意：此特例與傳統 10 萬円醫療費控除只能擇一適用。',
      filingMethod: '確定申告',
      actionTip: '保存 Matsumoto Kiyoshi、松本清、Sundrug 等藥妝店收據（明細需有★或特定符號），確定申告時填入自我藥療明細書。',
      lawReference: '租税特別措置法第41条の17',
    });
  }

  // ----------------------------------------------------
  // 8. 新 NISA 非課稅制度
  // ----------------------------------------------------
  recommendations.push({
    id: 'rec_nisa',
    title: '充分利用新 NISA 終身 1,800 萬円非課稅投資額度',
    category: 'investment',
    priority: 'high',
    potentialSavingsJpy: Math.round(360000 * 0.05 * 0.20315), // 估計獲利免稅效益
    currentStatus: settings.nisaAnnualInvestment > 0 ? 'applied' : 'not_applied',
    badge: '免除 20.315% 資本利得與股利稅',
    summary: '在日本標準證券帳戶投資收益須課徵 20.315% 稅金。新 NISA 享有永久免稅！',
    conditionDescription: '18歲以上日本居住者。全年投資額度最高 360 萬日圓（成長投資枠 240 萬 + 累積投資枠 120 萬），終身免稅上限 1,800 萬日圓。',
    effectDescription: '投資日本股票、全球 ETF（如 eMAXIS Slim 全世界株式、S&P500）的所有資本利得與配息，終身 100% 免納 15.315% 所得稅與 5% 住民稅。',
    filingMethod: '兩者皆可',
    actionTip: '立即在 SBI 證券或樂天證券開設 NISA 專用帳戶，設定每月薪資自動扣款定額投資。完全不需在年末申報，自動享免稅優惠。',
    lawReference: '租税特別措置法第37条の14',
  });

  // ----------------------------------------------------
  // 9. 特定支出控除 (上班族業務相關支出實費扣除)
  // ----------------------------------------------------
  recommendations.push({
    id: 'rec_specific_expenses',
    title: '給與所得者之「特定支出控除」（實額經費抵扣）',
    category: 'expense',
    priority: 'low',
    potentialSavingsJpy: 25000,
    currentStatus: 'not_applied',
    badge: '上班族自費進修・考照・通勤超額抵稅',
    summary: '若自費考取專業證照、參加技術研修、轉勤自付搬家或圖書交際費用高昂，可自所得中扣抵！',
    conditionDescription: '特定支出（通勤費超額自付、轉勤居所轉移、研修費、資格取得費、帰宅旅費、勤務必要經費如書籍與西裝）全年合計超過「給與所得控除額的 1/2」。且支出需獲雇主（任職公司等）開具證明書。',
    effectDescription: '超過判定標準的部分，可作為額外所得扣除，直接降低所得稅與住民稅課稅級距。',
    filingMethod: '確定申告',
    actionTip: '向公司申請「特定支出に関する証明書」，保留所有學費、考試報名費及交通收據，翌年辦理確定申告。',
    lawReference: '所得税法第57条の2（給与所得者の特定支出の控除の特例）',
  });

  return recommendations;
}
