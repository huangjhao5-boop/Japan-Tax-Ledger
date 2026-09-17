import React, { useState, useMemo, useEffect } from 'react';
import {
  MonthlySalarySlip,
  BonusSlip,
  PayRaiseRecord,
  ExtraIncomeRecord,
  FurusatoDonation,
  MedicalExpenseRecord,
  TaxDeductionSettings,
} from './types/tax';
import {
  DEFAULT_SALARY_SLIPS_2026,
  DEFAULT_BONUS_SLIPS_2026,
  DEFAULT_PAY_RAISE_RECORDS,
  DEFAULT_EXTRA_INCOMES_2026,
  DEFAULT_FURUSATO_DONATIONS_2026,
  DEFAULT_MEDICAL_EXPENSES_2026,
  DEFAULT_TAX_SETTINGS,
  CLEAN_TAX_SETTINGS,
  isDemoRecordId,
} from './data/defaultData';
import { calculateCompleteTaxReport } from './utils/taxCalculator';

// UI Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SalaryLedger } from './components/SalaryLedger';
import { ExtraIncomeLedger } from './components/ExtraIncomeLedger';
import { TaxDeductionsManager } from './components/TaxDeductionsManager';
import { PayRaiseSimulator } from './components/PayRaiseSimulator';
import { TaxChecklist } from './components/TaxChecklist';
import { SmartTaxAdvisor } from './components/SmartTaxAdvisor';
import { SmartDocImporter } from './components/SmartDocImporter';

// Modals
import { AddSalaryModal } from './components/Modals/AddSalaryModal';
import { AddBonusModal } from './components/Modals/AddBonusModal';
import { AddPayRaiseModal } from './components/Modals/AddPayRaiseModal';
import { AddExtraIncomeModal } from './components/Modals/AddExtraIncomeModal';
import { AddFurusatoModal } from './components/Modals/AddFurusatoModal';
import { AddMedicalModal } from './components/Modals/AddMedicalModal';

const STORAGE_KEYS = {
  CLEAN_MODE: 'japan_tax_clean_mode_v3',
  // Clean mode storage (strictly user data or user sample)
  CLEAN_SALARY: 'japan_tax_clean_salary_v3',
  CLEAN_BONUS: 'japan_tax_clean_bonus_v3',
  CLEAN_RAISES: 'japan_tax_clean_raises_v3',
  CLEAN_EXTRA: 'japan_tax_clean_extra_v3',
  CLEAN_FURUSATO: 'japan_tax_clean_furusato_v3',
  CLEAN_MEDICAL: 'japan_tax_clean_medical_v3',
  CLEAN_SETTINGS: 'japan_tax_clean_settings_v3',
  CLEAN_YEAR: 'japan_tax_clean_year_v3',
  CLEAN_USER_NAME: 'japan_tax_clean_user_name_v3',
  // Demo mode storage (simulation playground)
  DEMO_SALARY: 'japan_tax_demo_salary_v3',
  DEMO_BONUS: 'japan_tax_demo_bonus_v3',
  DEMO_RAISES: 'japan_tax_demo_raises_v3',
  DEMO_EXTRA: 'japan_tax_demo_extra_v3',
  DEMO_FURUSATO: 'japan_tax_demo_furusato_v3',
  DEMO_MEDICAL: 'japan_tax_demo_medical_v3',
  DEMO_SETTINGS: 'japan_tax_demo_settings_v3',
  DEMO_YEAR: 'japan_tax_demo_year_v3',
  // Legacy keys for fallback migration
  LEGACY_SALARY: 'japan_tax_salary_slips_v2',
  LEGACY_BONUS: 'japan_tax_bonuses_v2',
  LEGACY_RAISES: 'japan_tax_pay_raises_v2',
  LEGACY_EXTRA: 'japan_tax_extra_incomes_v2',
  LEGACY_FURUSATO: 'japan_tax_furusato_v2',
  LEGACY_MEDICAL: 'japan_tax_medical_v2',
  LEGACY_SETTINGS: 'japan_tax_settings_v2',
  LEGACY_YEAR: 'japan_tax_year_v2',
  LEGACY_CLEAN_MODE: 'japan_tax_clean_mode_v2',
  LEGACY_USER_NAME: 'japan_tax_user_name_v2',
};

// Strict sanitizers ensuring clean mode NEVER contains demo records
const sanitizeCleanSlips = (items: any[]): MonthlySalarySlip[] => {
  if (!Array.isArray(items)) return [];
  return items.filter((s) => s && !isDemoRecordId(s.id));
};
const sanitizeCleanBonuses = (items: any[]): BonusSlip[] => {
  if (!Array.isArray(items)) return [];
  return items.filter((b) => b && !isDemoRecordId(b.id));
};
const sanitizeCleanRaises = (items: any[]): PayRaiseRecord[] => {
  if (!Array.isArray(items)) return [];
  return items.filter((r) => r && !isDemoRecordId(r.id));
};
const sanitizeCleanExtra = (items: any[]): ExtraIncomeRecord[] => {
  if (!Array.isArray(items)) return [];
  return items.filter((e) => e && !isDemoRecordId(e.id));
};
const sanitizeCleanFurusato = (items: any[]): FurusatoDonation[] => {
  if (!Array.isArray(items)) return [];
  return items.filter((f) => f && !isDemoRecordId(f.id));
};
const sanitizeCleanMedical = (items: any[]): MedicalExpenseRecord[] => {
  if (!Array.isArray(items)) return [];
  return items.filter((m) => m && !isDemoRecordId(m.id));
};

// Initial Clean Uploaded Dataset (Empty for clean self-input/PDF upload)
const INITIAL_CLEAN_SLIPS: MonthlySalarySlip[] = [];
const INITIAL_CLEAN_BONUSES: BonusSlip[] = [];
const INITIAL_CLEAN_RAISES: PayRaiseRecord[] = [];

export default function App() {
  // Clean Mode: true means clean user-entered/uploaded data, false means 12-month demo simulation
  const [isCleanMode, setIsCleanMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_MODE);
      if (saved !== null) return saved === 'true';
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_CLEAN_MODE);
      if (legacy !== null) return legacy === 'true';
    } catch {}
    return true; // Default to clean mode as requested
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // ==========================================
  // CLEAN DATASET STATES (Zero demo records)
  // ==========================================
  const [cleanSlips, setCleanSlips] = useState<MonthlySalarySlip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_SALARY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return sanitizeCleanSlips(parsed);
      }
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_SALARY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const cleaned = sanitizeCleanSlips(parsed);
        if (cleaned.length > 0) return cleaned;
      }
    } catch {}
    return INITIAL_CLEAN_SLIPS;
  });

  const [cleanBonuses, setCleanBonuses] = useState<BonusSlip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_BONUS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return sanitizeCleanBonuses(parsed);
      }
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_BONUS);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const cleaned = sanitizeCleanBonuses(parsed);
        if (cleaned.length > 0) return cleaned;
      }
    } catch {}
    return INITIAL_CLEAN_BONUSES;
  });

  const [cleanRaises, setCleanRaises] = useState<PayRaiseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_RAISES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return sanitizeCleanRaises(parsed);
      }
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_RAISES);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const cleaned = sanitizeCleanRaises(parsed);
        if (cleaned.length > 0) return cleaned;
      }
    } catch {}
    return INITIAL_CLEAN_RAISES;
  });

  const [cleanExtra, setCleanExtra] = useState<ExtraIncomeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_EXTRA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return sanitizeCleanExtra(parsed);
      }
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_EXTRA);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return sanitizeCleanExtra(parsed);
      }
    } catch {}
    return [];
  });

  const [cleanFurusato, setCleanFurusato] = useState<FurusatoDonation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_FURUSATO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return sanitizeCleanFurusato(parsed);
      }
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_FURUSATO);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return sanitizeCleanFurusato(parsed);
      }
    } catch {}
    return [];
  });

  const [cleanMedical, setCleanMedical] = useState<MedicalExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_MEDICAL);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return sanitizeCleanMedical(parsed);
      }
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_MEDICAL);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) return sanitizeCleanMedical(parsed);
      }
    } catch {}
    return [];
  });

  const [cleanSettings, setCleanSettings] = useState<TaxDeductionSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...CLEAN_TAX_SETTINGS, ...parsed };
        }
      }
    } catch {}
    return CLEAN_TAX_SETTINGS;
  });

  const [cleanYear, setCleanYear] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_YEAR);
      if (saved) return Number(saved);
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_YEAR);
      if (legacy) return Number(legacy);
    } catch {}
    return 2026;
  });

  const [cleanUserName, setCleanUserName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLEAN_USER_NAME);
      if (saved && saved !== '黄 兆宇 様') return saved;
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_USER_NAME);
      if (legacy && legacy !== '黄 兆宇 様') return legacy;
    } catch {}
    return '給与所得者 様';
  });

  // ==========================================
  // DEMO DATASET STATES (Full simulation data)
  // ==========================================
  const [demoSlips, setDemoSlips] = useState<MonthlySalarySlip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_SALARY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SALARY_SLIPS_2026;
  });

  const [demoBonuses, setDemoBonuses] = useState<BonusSlip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_BONUS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BONUS_SLIPS_2026;
  });

  const [demoRaises, setDemoRaises] = useState<PayRaiseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_RAISES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PAY_RAISE_RECORDS;
  });

  const [demoExtra, setDemoExtra] = useState<ExtraIncomeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_EXTRA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_EXTRA_INCOMES_2026;
  });

  const [demoFurusato, setDemoFurusato] = useState<FurusatoDonation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_FURUSATO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FURUSATO_DONATIONS_2026;
  });

  const [demoMedical, setDemoMedical] = useState<MedicalExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_MEDICAL);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_MEDICAL_EXPENSES_2026;
  });

  const [demoSettings, setDemoSettings] = useState<TaxDeductionSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...DEFAULT_TAX_SETTINGS, ...parsed };
        }
      }
    } catch {}
    return DEFAULT_TAX_SETTINGS;
  });

  const [demoYear, setDemoYear] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_YEAR);
      if (saved) return Number(saved);
    } catch {}
    return 2026;
  });

  // ==========================================
  // ACTIVE VALUES DERIVED BY CURRENT MODE
  // ==========================================
  const salarySlips = isCleanMode ? cleanSlips : demoSlips;
  const bonuses = isCleanMode ? cleanBonuses : demoBonuses;
  const payRaises = isCleanMode ? cleanRaises : demoRaises;
  const extraIncomes = isCleanMode ? cleanExtra : demoExtra;
  const furusatoDonations = isCleanMode ? cleanFurusato : demoFurusato;
  const medicalExpenses = isCleanMode ? cleanMedical : demoMedical;
  const deductionSettings = isCleanMode ? cleanSettings : demoSettings;
  const currentYear = isCleanMode ? cleanYear : demoYear;
  const userName = isCleanMode ? cleanUserName : '山田 太郎 様 (示範)';

  // Persist Clean Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_MODE, isCleanMode.toString());
  }, [isCleanMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_SALARY, JSON.stringify(cleanSlips));
  }, [cleanSlips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_BONUS, JSON.stringify(cleanBonuses));
  }, [cleanBonuses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_RAISES, JSON.stringify(cleanRaises));
  }, [cleanRaises]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_EXTRA, JSON.stringify(cleanExtra));
  }, [cleanExtra]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_FURUSATO, JSON.stringify(cleanFurusato));
  }, [cleanFurusato]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_MEDICAL, JSON.stringify(cleanMedical));
  }, [cleanMedical]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_SETTINGS, JSON.stringify(cleanSettings));
  }, [cleanSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_YEAR, cleanYear.toString());
  }, [cleanYear]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAN_USER_NAME, cleanUserName);
  }, [cleanUserName]);

  // Persist Demo Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_SALARY, JSON.stringify(demoSlips));
  }, [demoSlips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_BONUS, JSON.stringify(demoBonuses));
  }, [demoBonuses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_RAISES, JSON.stringify(demoRaises));
  }, [demoRaises]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_EXTRA, JSON.stringify(demoExtra));
  }, [demoExtra]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_FURUSATO, JSON.stringify(demoFurusato));
  }, [demoFurusato]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_MEDICAL, JSON.stringify(demoMedical));
  }, [demoMedical]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_SETTINGS, JSON.stringify(demoSettings));
  }, [demoSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_YEAR, demoYear.toString());
  }, [demoYear]);

  // Modals state
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [editingSalarySlip, setEditingSalarySlip] = useState<MonthlySalarySlip | null>(null);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [editingBonusSlip, setEditingBonusSlip] = useState<BonusSlip | null>(null);
  const [isPayRaiseModalOpen, setIsPayRaiseModalOpen] = useState(false);
  const [editingPayRaiseRecord, setEditingPayRaiseRecord] = useState<PayRaiseRecord | null>(null);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [isFurusatoModalOpen, setIsFurusatoModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

  // Complete Tax Calculation Engine
  const taxReport = useMemo(() => {
    return calculateCompleteTaxReport(
      currentYear,
      salarySlips,
      bonuses,
      extraIncomes,
      furusatoDonations,
      medicalExpenses,
      deductionSettings
    );
  }, [
    currentYear,
    salarySlips,
    bonuses,
    extraIncomes,
    furusatoDonations,
    medicalExpenses,
    deductionSettings,
  ]);

  // Mode & Year handlers
  const handleToggleCleanMode = (clean: boolean) => {
    setIsCleanMode(clean);
  };

  const handleYearChange = (year: number) => {
    if (isCleanMode) {
      setCleanYear(year);
    } else {
      setDemoYear(year);
    }
  };

  const handleUpdateSettings = (settings: TaxDeductionSettings | ((prev: TaxDeductionSettings) => TaxDeductionSettings)) => {
    if (isCleanMode) {
      setCleanSettings(settings);
    } else {
      setDemoSettings(settings);
    }
  };

  const handleUpdateUserName = (name: string) => {
    if (isCleanMode) {
      setCleanUserName(name);
    }
  };

  // Handlers for Smart Importer
  const handleImportSalary = (slip: MonthlySalarySlip) => {
    setIsCleanMode(true);
    setCleanSlips((prev) => {
      const idx = prev.findIndex((s) => s.id === slip.id || (s.year === slip.year && s.month === slip.month));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = slip;
        return copy;
      }
      return [...prev, slip];
    });
    if (slip.year) {
      setCleanYear(slip.year);
    }
  };

  const handleImportBonus = (bonus: BonusSlip) => {
    setIsCleanMode(true);
    setCleanBonuses((prev) => {
      const idx = prev.findIndex((b) => b.id === bonus.id || (b.year === bonus.year && b.month === bonus.month && b.bonusType === bonus.bonusType));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = bonus;
        return copy;
      }
      return [...prev, bonus];
    });
  };

  const handleImportPayRaise = (raise: PayRaiseRecord) => {
    setIsCleanMode(true);
    setCleanRaises((prev) => {
      const idx = prev.findIndex((r) => r.id === raise.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = raise;
        return copy;
      }
      return [...prev, raise];
    });
  };

  const handleImportBatchAll = (
    salary: MonthlySalarySlip,
    bonus: BonusSlip,
    raise: PayRaiseRecord,
    employeeName?: string
  ) => {
    setIsCleanMode(true);
    if (employeeName) {
      setCleanUserName(employeeName);
    }
    handleImportSalary(salary);
    handleImportBonus(bonus);
    handleImportPayRaise(raise);
  };

  const handleImportBatchMultiple = (items: {
    salaries: MonthlySalarySlip[];
    bonuses: BonusSlip[];
    payRaises: PayRaiseRecord[];
    employeeName?: string;
  }) => {
    setIsCleanMode(true);
    if (items.employeeName) {
      setCleanUserName(items.employeeName);
    }

    if (items.salaries && items.salaries.length > 0) {
      setCleanSlips((prev) => {
        const copy = [...prev];
        for (const slip of items.salaries) {
          const idx = copy.findIndex(
            (s) => s.id === slip.id || (s.year === slip.year && s.month === slip.month)
          );
          if (idx >= 0) {
            copy[idx] = slip;
          } else {
            copy.push(slip);
          }
        }
        return copy.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
      });

      const years = items.salaries.map((s) => s.year).filter(Boolean);
      if (years.length > 0) {
        const maxYear = Math.max(...years);
        setCleanYear(maxYear);
      }
    }

    if (items.bonuses && items.bonuses.length > 0) {
      setCleanBonuses((prev) => {
        const copy = [...prev];
        for (const bonus of items.bonuses) {
          const idx = copy.findIndex(
            (b) =>
              b.id === bonus.id ||
              (b.year === bonus.year &&
                b.month === bonus.month &&
                b.bonusType === bonus.bonusType)
          );
          if (idx >= 0) {
            copy[idx] = bonus;
          } else {
            copy.push(bonus);
          }
        }
        return copy.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
      });
    }

    if (items.payRaises && items.payRaises.length > 0) {
      setCleanRaises((prev) => {
        const copy = [...prev];
        for (const raise of items.payRaises) {
          const idx = copy.findIndex((r) => r.id === raise.id);
          if (idx >= 0) {
            copy[idx] = raise;
          } else {
            copy.push(raise);
          }
        }
        return copy.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
      });
    }
  };

  // Handlers for Salary
  const handleSaveSalary = (slip: MonthlySalarySlip) => {
    const updater = (prev: MonthlySalarySlip[]) => {
      const idx = prev.findIndex((s) => s.id === slip.id || (s.year === slip.year && s.month === slip.month));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = slip;
        return next;
      }
      return [...prev, slip];
    };
    if (isCleanMode) {
      setCleanSlips(updater);
    } else {
      setDemoSlips(updater);
    }
    setEditingSalarySlip(null);
  };

  const handleDeleteSalary = (id: string) => {
    if (isCleanMode) {
      setCleanSlips((prev) => prev.filter((s) => s.id !== id));
    } else {
      setDemoSlips((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleEditSalary = (slip: MonthlySalarySlip) => {
    setEditingSalarySlip(slip);
    setIsSalaryModalOpen(true);
  };

  // Handlers for Bonus
  const handleSaveBonus = (bonus: BonusSlip) => {
    const updater = (prev: BonusSlip[]) => {
      const idx = prev.findIndex((b) => b.id === bonus.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = bonus;
        return next;
      }
      return [...prev, bonus];
    };
    if (isCleanMode) {
      setCleanBonuses(updater);
    } else {
      setDemoBonuses(updater);
    }
    setEditingBonusSlip(null);
  };

  const handleEditBonus = (bonus: BonusSlip) => {
    setEditingBonusSlip(bonus);
    setIsBonusModalOpen(true);
  };

  const handleDeleteBonus = (id: string) => {
    if (isCleanMode) {
      setCleanBonuses((prev) => prev.filter((b) => b.id !== id));
    } else {
      setDemoBonuses((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Handlers for Pay Raise
  const handleSavePayRaise = (raise: PayRaiseRecord) => {
    const updater = (prev: PayRaiseRecord[]) => {
      const idx = prev.findIndex((r) => r.id === raise.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = raise;
        return next;
      }
      return [...prev, raise];
    };
    if (isCleanMode) {
      setCleanRaises(updater);
    } else {
      setDemoRaises(updater);
    }
    setEditingPayRaiseRecord(null);
  };

  const handleEditPayRaise = (raise: PayRaiseRecord) => {
    setEditingPayRaiseRecord(raise);
    setIsPayRaiseModalOpen(true);
  };

  const handleDeletePayRaise = (id: string) => {
    if (isCleanMode) {
      setCleanRaises((prev) => prev.filter((r) => r.id !== id));
    } else {
      setDemoRaises((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Handlers for Extra Income
  const handleSaveExtraIncome = (record: ExtraIncomeRecord) => {
    if (isCleanMode) {
      setCleanExtra((prev) => [...prev, record]);
    } else {
      setDemoExtra((prev) => [...prev, record]);
    }
  };

  const handleDeleteExtraIncome = (id: string) => {
    if (isCleanMode) {
      setCleanExtra((prev) => prev.filter((r) => r.id !== id));
    } else {
      setDemoExtra((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Handlers for Furusato
  const handleSaveFurusato = (donation: FurusatoDonation) => {
    if (isCleanMode) {
      setCleanFurusato((prev) => [...prev, donation]);
    } else {
      setDemoFurusato((prev) => [...prev, donation]);
    }
  };

  const handleDeleteFurusato = (id: string) => {
    if (isCleanMode) {
      setCleanFurusato((prev) => prev.filter((f) => f.id !== id));
    } else {
      setDemoFurusato((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleToggleOneStop = (id: string) => {
    const updater = (prev: FurusatoDonation[]) =>
      prev.map((f) => (f.id === id ? { ...f, oneStopApplied: !f.oneStopApplied } : f));
    if (isCleanMode) {
      setCleanFurusato(updater);
    } else {
      setDemoFurusato(updater);
    }
  };

  // Handlers for Medical
  const handleSaveMedical = (record: MedicalExpenseRecord) => {
    if (isCleanMode) {
      setCleanMedical((prev) => [...prev, record]);
    } else {
      setDemoMedical((prev) => [...prev, record]);
    }
  };

  const handleDeleteMedical = (id: string) => {
    if (isCleanMode) {
      setCleanMedical((prev) => prev.filter((m) => m.id !== id));
    } else {
      setDemoMedical((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Reset / Clear Actions
  const handleClearAllCleanData = () => {
    if (window.confirm('確定要清空純淨模式下的所有記錄（空白全新記帳）嗎？')) {
      setCleanSlips([]);
      setCleanBonuses([]);
      setCleanRaises([]);
      setCleanExtra([]);
      setCleanFurusato([]);
      setCleanMedical([]);
    }
  };

  const handleResetData = () => {
    if (isCleanMode) {
      if (window.confirm('確定要清空純淨模式下的所有記帳資料嗎？')) {
        setCleanSlips([]);
        setCleanBonuses([]);
        setCleanRaises([]);
        setCleanExtra([]);
        setCleanFurusato([]);
        setCleanMedical([]);
        setCleanSettings(CLEAN_TAX_SETTINGS);
        setCleanUserName('給与所得者 様');
        setCleanYear(2026);
      }
    } else {
      if (window.confirm('確定要將示範模擬資料重設回初始狀態嗎？')) {
        setDemoSlips(DEFAULT_SALARY_SLIPS_2026);
        setDemoBonuses(DEFAULT_BONUS_SLIPS_2026);
        setDemoRaises(DEFAULT_PAY_RAISE_RECORDS);
        setDemoExtra(DEFAULT_EXTRA_INCOMES_2026);
        setDemoFurusato(DEFAULT_FURUSATO_DONATIONS_2026);
        setDemoMedical(DEFAULT_MEDICAL_EXPENSES_2026);
        setDemoSettings(DEFAULT_TAX_SETTINGS);
        setDemoYear(2026);
      }
    }
  };

  // Export & Import backup
  const handleExportData = () => {
    const exportData = {
      userName,
      isCleanMode,
      currentYear,
      salarySlips,
      bonuses,
      payRaises,
      extraIncomes,
      furusatoDonations,
      medicalExpenses,
      deductionSettings,
      exportDate: new Date().toISOString(),
      version: '3.0',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japan_tax_ledger_${isCleanMode ? 'clean' : 'demo'}_${currentYear}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setIsCleanMode(true);
        if (data.userName) setCleanUserName(data.userName);
        if (data.currentYear) setCleanYear(data.currentYear);
        if (Array.isArray(data.salarySlips)) setCleanSlips(sanitizeCleanSlips(data.salarySlips));
        if (Array.isArray(data.bonuses)) setCleanBonuses(sanitizeCleanBonuses(data.bonuses));
        if (Array.isArray(data.payRaises)) setCleanRaises(sanitizeCleanRaises(data.payRaises));
        if (Array.isArray(data.extraIncomes)) setCleanExtra(sanitizeCleanExtra(data.extraIncomes));
        if (Array.isArray(data.furusatoDonations)) setCleanFurusato(sanitizeCleanFurusato(data.furusatoDonations));
        if (Array.isArray(data.medicalExpenses)) {
          setCleanMedical(sanitizeCleanMedical(data.medicalExpenses));
        }
        if (data.deductionSettings && typeof data.deductionSettings === 'object') {
          setCleanSettings((prev) => ({ ...prev, ...data.deductionSettings }));
        }
      } catch (err) {
        console.error('Import error', err);
      }
    };
    reader.readAsText(file);
  };

  const handleAutoFillRemainingMonths = () => {
    const existing = salarySlips.filter((s) => s.year === currentYear);
    if (existing.length === 0) return;
    const latestSlip = [...existing].sort((a, b) => b.month - a.month)[0];
    const existingMonths = new Set(existing.map((s) => s.month));
    const newSlips: MonthlySalarySlip[] = [];
    for (let m = 1; m <= 12; m++) {
      if (!existingMonths.has(m)) {
        newSlips.push({
          ...latestSlip,
          id: `salary-${currentYear}-${m}-${Date.now()}`,
          year: currentYear,
          month: m,
          note: '系統按最近月份自動估算補齊',
        });
      }
    }
    if (isCleanMode) {
      setCleanSlips((prev) => [...prev, ...newSlips].sort((a, b) => a.month - b.month));
    } else {
      setDemoSlips((prev) => [...prev, ...newSlips].sort((a, b) => a.month - b.month));
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Professional Polish Sidebar */}
      <Sidebar
        currentYear={currentYear}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'pay_raise') setActiveTab('simulator');
          else setActiveTab(tab);
        }}
        taxReport={taxReport}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCleanMode={isCleanMode}
        onToggleCleanMode={handleToggleCleanMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        {/* Top App Header */}
        <Header
          currentYear={currentYear}
          onYearChange={handleYearChange}
          taxReport={taxReport}
          onResetData={handleResetData}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          isCleanMode={isCleanMode}
          onToggleCleanMode={handleToggleCleanMode}
          userName={userName}
          onOpenSmartUpload={() => setActiveTab('importer')}
        />

        {/* Main Body */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          {activeTab === 'overview' && (
            <OverviewDashboard
              currentYear={currentYear}
              taxReport={taxReport}
              onNavigateTab={setActiveTab}
              onAddSalary={() => {
                setEditingSalarySlip(null);
                setIsSalaryModalOpen(true);
              }}
              onAddBonus={() => setIsBonusModalOpen(true)}
              onAddExtra={() => setIsExtraModalOpen(true)}
              onAddFurusato={() => setIsFurusatoModalOpen(true)}
              isCleanMode={isCleanMode}
              onToggleCleanMode={handleToggleCleanMode}
              onOpenSmartUpload={() => setActiveTab('importer')}
              onClearAllCleanData={handleClearAllCleanData}
            />
          )}

          {activeTab === 'advisor' && (
            <SmartTaxAdvisor
              salarySlips={salarySlips}
              bonuses={bonuses}
              extraIncomes={extraIncomes}
              medicalExpenses={medicalExpenses}
              settings={deductionSettings}
              report={taxReport}
              onUpdateSettings={handleUpdateSettings}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'importer' && (
            <SmartDocImporter
              onImportSalary={handleImportSalary}
              onImportBonus={handleImportBonus}
              onImportPayRaise={handleImportPayRaise}
              onImportBatchAll={handleImportBatchAll}
              onImportBatchMultiple={handleImportBatchMultiple}
              onClose={() => setActiveTab('overview')}
              onNavigateTab={setActiveTab}
              isCleanMode={isCleanMode}
              onToggleCleanMode={handleToggleCleanMode}
              userName={userName}
              onUpdateUserName={handleUpdateUserName}
            />
          )}

          {activeTab === 'salary' && (
            <SalaryLedger
              currentYear={currentYear}
              salarySlips={salarySlips}
              bonuses={bonuses}
              payRaises={payRaises}
              onAddSalary={() => {
                setEditingSalarySlip(null);
                setIsSalaryModalOpen(true);
              }}
              onEditSalary={handleEditSalary}
              onDeleteSalary={handleDeleteSalary}
              onAddBonus={() => {
                setEditingBonusSlip(null);
                setIsBonusModalOpen(true);
              }}
              onEditBonus={handleEditBonus}
              onDeleteBonus={handleDeleteBonus}
              onAddPayRaise={() => {
                setEditingPayRaiseRecord(null);
                setIsPayRaiseModalOpen(true);
              }}
              onEditPayRaise={handleEditPayRaise}
              onDeletePayRaise={handleDeletePayRaise}
              onAutoFillRemainingMonths={handleAutoFillRemainingMonths}
              onOpenSmartUpload={() => setActiveTab('importer')}
            />
          )}

          {activeTab === 'extra' && (
            <ExtraIncomeLedger
              currentYear={currentYear}
              extraIncomes={extraIncomes}
              onAddExtraIncome={() => setIsExtraModalOpen(true)}
              onDeleteExtraIncome={handleDeleteExtraIncome}
            />
          )}

          {activeTab === 'deductions' && (
            <TaxDeductionsManager
              currentYear={currentYear}
              settings={deductionSettings}
              taxReport={taxReport}
              furusatoDonations={furusatoDonations}
              medicalExpenses={medicalExpenses}
              onUpdateSettings={handleUpdateSettings}
              onAddFurusato={() => setIsFurusatoModalOpen(true)}
              onDeleteFurusato={handleDeleteFurusato}
              onToggleOneStop={handleToggleOneStop}
              onAddMedical={() => setIsMedicalModalOpen(true)}
              onDeleteMedical={handleDeleteMedical}
            />
          )}

          {activeTab === 'simulator' && (
            <PayRaiseSimulator
              settings={deductionSettings}
              defaultBaseSalary={
                salarySlips.length > 0 ? salarySlips[salarySlips.length - 1].baseSalary : 215_000
              }
              defaultBonus={bonuses.reduce((sum, b) => sum + b.grossAmount, 0) || 420_000}
            />
          )}

          {activeTab === 'checklist' && <TaxChecklist taxReport={taxReport} />}
        </main>
      </div>

      {/* Modals */}
      <AddSalaryModal
        currentYear={currentYear}
        initialSlip={editingSalarySlip}
        isOpen={isSalaryModalOpen}
        onClose={() => {
          setIsSalaryModalOpen(false);
          setEditingSalarySlip(null);
        }}
        onSave={handleSaveSalary}
      />

      <AddBonusModal
        currentYear={currentYear}
        initialBonus={editingBonusSlip}
        isOpen={isBonusModalOpen}
        onClose={() => {
          setIsBonusModalOpen(false);
          setEditingBonusSlip(null);
        }}
        onSave={handleSaveBonus}
      />

      <AddPayRaiseModal
        currentYear={currentYear}
        initialRaise={editingPayRaiseRecord}
        isOpen={isPayRaiseModalOpen}
        onClose={() => {
          setIsPayRaiseModalOpen(false);
          setEditingPayRaiseRecord(null);
        }}
        onSave={handleSavePayRaise}
      />

      <AddExtraIncomeModal
        currentYear={currentYear}
        isOpen={isExtraModalOpen}
        onClose={() => setIsExtraModalOpen(false)}
        onSave={handleSaveExtraIncome}
      />

      <AddFurusatoModal
        currentYear={currentYear}
        isOpen={isFurusatoModalOpen}
        onClose={() => setIsFurusatoModalOpen(false)}
        onSave={handleSaveFurusato}
      />

      <AddMedicalModal
        currentYear={currentYear}
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        onSave={handleSaveMedical}
      />
    </div>
  );
}
