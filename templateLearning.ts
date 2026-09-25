/**
 * Adaptive Template Learning Engine (自適應版型特徵學習庫)
 * 
 * 隨著使用者上傳 PDF 薪資單或進行手動欄位校正，系統會主動記憶該公司的版型特徵：
 * 1. 基本給與常態非課稅通勤費基準
 * 2. 公司特殊扣除項目（如：旅行積立金 ¥1,000，防止誤抓年份 2025）
 * 3. 欠勤控除與遲刻早退的空間座標與關鍵字指紋
 * 4. 法定控除小計與票面「控除合計」的核算規則（如：票面印 38,240，加計積立金後為 39,240）
 * 5. 跨月份資料一致性（Cross-Month Consistency）與精度信心度動態加權
 */

import { MonthlySalarySlip } from '../types/tax';

export interface LearnedCompanyTemplate {
  companyName: string;
  employeeName?: string;
  sampleCount: number;
  lastUpdated: string;
  learnedRules: {
    standardBaseSalary?: number;
    standardCommuteAllowance?: number;
    standardBusinessTripAllowance?: number; // 非課税出張旅費基準
    specialDeductionName?: string;
    specialDeductionAmount?: number;
    specialDeductionAvoidYears?: number[]; // e.g. [2024, 2025, 2026, 2027]
    absenceDeductionKeyword?: string;
    paperDeductionExcludesOther?: boolean; // 票面「控除合計」是否未含旅行積立金
    standardWorkDays?: number;
  };
  sampleHistory: {
    year: number;
    month: number;
    gross: number;
    net: number;
    dateAdded: string;
  }[];
}

const STORAGE_KEY = 'tax_analyzer_learned_templates';

/**
 * 取得所有已學習的公司版型
 */
export function getAllLearnedTemplates(): LearnedCompanyTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load learned templates:', err);
    return [];
  }
}

/**
 * 依公司名稱或原始內文查找已學習的版型特徵
 */
export function getLearnedTemplate(
  companyName?: string,
  rawText?: string
): LearnedCompanyTemplate | null {
  const templates = getAllLearnedTemplates();
  if (templates.length === 0) return null;

  // 1. 若有指定具體公司名稱（非預設預留字）
  if (
    companyName &&
    companyName !== '勤務先会社' &&
    companyName !== '会社名' &&
    companyName !== '標準給與格式'
  ) {
    const cleanTarget = companyName.replace(/株式会社|有限会社|合同会社|\s/g, '').trim();
    if (cleanTarget.length >= 2) {
      const found = templates.find((t) => {
        const cleanT = t.companyName.replace(/株式会社|有限会社|合同会社|\s/g, '').trim();
        return cleanT && (cleanTarget.includes(cleanT) || cleanT.includes(cleanTarget));
      });
      if (found) return found;
    }
  }

  // 2. 若有傳入 PDF 原始全文，搜尋內文是否包含已學習的公司名稱或員工姓名
  if (rawText) {
    for (const t of templates) {
      const cleanT = t.companyName.replace(/株式会社|有限会社|合同会社|\s/g, '').trim();
      if (cleanT && cleanT.length >= 2 && rawText.includes(cleanT)) {
        return t;
      }
      if (t.employeeName) {
        const cleanEmp = t.employeeName.replace(/様|\s/g, '').trim();
        if (cleanEmp && cleanEmp.length >= 2 && rawText.includes(cleanEmp)) {
          return t;
        }
      }
    }
  }

  // 3. Fallback：若儲存庫中僅有 1 家公司版型（個人使用者常態），直接套用該公司經驗
  if (templates.length === 1) {
    return templates[0];
  }

  return null;
}

/**
 * 從確認的薪資明細中學習並精進版型特徵庫
 */
export function learnFromSalarySlip(slip: MonthlySalarySlip): LearnedCompanyTemplate {
  const templates = getAllLearnedTemplates();
  let compName = slip.companyName || '勤務先会社';

  // 若傳入之名稱為預設值，且庫中已有具體公司名稱，自動延續已識別之公司
  if (
    (compName === '勤務先会社' || compName === '標準給與格式' || compName === '会社名') &&
    templates.length > 0
  ) {
    const matchByEmp = slip.employeeName
      ? templates.find(
          (t) =>
            t.employeeName &&
            t.employeeName.replace(/様|\s/g, '') === slip.employeeName?.replace(/様|\s/g, '')
        )
      : null;
    if (matchByEmp) {
      compName = matchByEmp.companyName;
    } else if (templates.length === 1) {
      compName = templates[0].companyName;
    }
  }

  const cleanTarget = compName.replace(/株式会社|有限会社|合同会社|\s/g, '').trim();

  let existingIndex = templates.findIndex((t) => {
    const cleanT = t.companyName.replace(/株式会社|有限会社|合同会社|\s/g, '').trim();
    return cleanT && (cleanTarget.includes(cleanT) || cleanT.includes(cleanTarget));
  });

  const now = new Date().toISOString();
  let template: LearnedCompanyTemplate;

  if (existingIndex >= 0) {
    template = templates[existingIndex];
    template.sampleCount += 1;
    template.lastUpdated = now;
    if (slip.employeeName && !template.employeeName) {
      template.employeeName = slip.employeeName;
    }
  } else {
    template = {
      companyName: compName,
      employeeName: slip.employeeName,
      sampleCount: 1,
      lastUpdated: now,
      learnedRules: {},
      sampleHistory: [],
    };
    templates.push(template);
    existingIndex = templates.length - 1;
  }

  // 1. 學習基本給與非課稅通勤費基準
  if (slip.baseSalary > 0) {
    template.learnedRules.standardBaseSalary = slip.baseSalary;
  }
  if (slip.commuteAllowance > 0) {
    template.learnedRules.standardCommuteAllowance = slip.commuteAllowance;
  }
  if (slip.businessTripAllowance !== undefined && slip.businessTripAllowance > 0) {
    template.learnedRules.standardBusinessTripAllowance = slip.businessTripAllowance;
  }

  // 2. 學習特殊控除（如旅行積立金 ¥1,000）
  if (slip.otherDeductions > 0) {
    template.learnedRules.specialDeductionAmount = slip.otherDeductions;
    if (slip.otherDeductionsNote) {
      template.learnedRules.specialDeductionName = slip.otherDeductionsNote;
    }
    // 預設將年份 2024-2028 列為避開特徵，防止誤把年份當作扣除金額
    template.learnedRules.specialDeductionAvoidYears = [2024, 2025, 2026, 2027, 2028];
  }

  // 3. 學習票面「控除合計」是否排除その他控除
  // 若 (社保計 + 所得稅) 等於某一印字值，而 netPay = gross - (法定 + その他)，則代表票面印字控除合計排除了その他
  const socTotal =
    slip.socialInsuranceTotal ||
    slip.healthInsurance + slip.welfarePension + slip.employmentInsurance;
  const statutoryDeductions = socTotal + slip.incomeTax + slip.residentTax;

  if (slip.otherDeductions > 0 && slip.totalDeductions) {
    if (slip.totalDeductions === statutoryDeductions) {
      template.learnedRules.paperDeductionExcludesOther = true;
    } else if (slip.totalDeductions === statutoryDeductions + slip.otherDeductions) {
      template.learnedRules.paperDeductionExcludesOther = false;
    }
  }

  // 4. 記錄樣本歷史
  const existingHistory = template.sampleHistory.find(
    (h) => h.year === slip.year && h.month === slip.month
  );
  if (!existingHistory) {
    template.sampleHistory.push({
      year: slip.year,
      month: slip.month,
      gross: slip.totalGross || slip.baseSalary,
      net: slip.netPay || 0,
      dateAdded: now,
    });
  }

  // 保存回 LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save learned template:', err);
  }

  return template;
}

/**
 * 手動清除學習庫（重設回原廠狀態）
 */
export function clearLearnedTemplates(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear learned templates:', err);
  }
}
