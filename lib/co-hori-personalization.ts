import { COMPANY_ITEMS, type CompanyItem } from "@/lib/co-hori-data";

export type CompanyAnswers = {
  foundedYear: number;
  isVatPayer: boolean;
  isIdentifiedPerson: boolean;
  annualTurnover: number;
  buysForeignServices: boolean;
  sellsToEuCustomers: boolean;
  hasEmployees: boolean;
  plansFirstEmployee: boolean;
  hasCompanyCar: boolean;
  hasOfficeOrLease: boolean;
  hasMultipleDirectors: boolean;
  hasAccountant: boolean;
  usesDomains: boolean;
  hasImportantSaaS: boolean;
};

export type PersonalizedCompanyItem = CompanyItem & { personalizationReason?: string };

const ALWAYS_INCLUDED_ITEM_IDS = new Set([
  "tax-registration", "accounting", "data-box", "data-notifications", "fiction-delivery", "pay-invoices",
  "issued-invoices", "monthly-docs", "corporate-tax", "pay-tax", "statements", "collection", "insurance",
  "backups", "bank-access",
]);

export const DEFAULT_COMPANY_ANSWERS: CompanyAnswers = {
  foundedYear: new Date().getFullYear(), isVatPayer: false, isIdentifiedPerson: false, annualTurnover: 0,
  buysForeignServices: false, sellsToEuCustomers: false, hasEmployees: false, plansFirstEmployee: false,
  hasCompanyCar: false, hasOfficeOrLease: false, hasMultipleDirectors: false, hasAccountant: false,
  usesDomains: false, hasImportantSaaS: false,
};

function getReason(itemId: string, answers: CompanyAnswers): string | undefined {
  const reasons: Record<string, string | undefined> = {
    "foreign-services": answers.buysForeignServices ? "Přidáno, protože jste uvedli, že nakupujete služby ze zahraničí." : undefined,
    "identified-person": answers.buysForeignServices && !answers.isVatPayer ? "Přidáno, protože nakupujete zahraniční SaaS a nejste plátce DPH." : undefined,
    "vat-turnover": answers.annualTurnover >= 1_800_000 && !answers.isVatPayer ? "Přidáno, protože se blížíte hranici pro povinnou registraci k DPH." : undefined,
    "vat-deadline": answers.isVatPayer ? "Přidáno, protože jste uvedli, že jste plátce DPH." : undefined,
    "first-employee": !answers.hasEmployees ? (answers.plansFirstEmployee ? "Přidáno, protože plánujete přijmout prvního zaměstnance." : "Přidáno, protože zatím nemáte zaměstnance — checklist se hodí před prvním nástupem.") : undefined,
    "payroll": answers.hasEmployees ? "Přidáno, protože máte zaměstnance." : undefined,
    "offboarding": answers.hasEmployees ? "Přidáno, protože máte zaměstnance a je potřeba hlídat jejich přístupy." : undefined,
    "car-stk": answers.hasCompanyCar ? "Přidáno, protože jste uvedli, že máte firemní auto." : undefined,
    "car-insurance": answers.hasCompanyCar ? "Přidáno, protože jste uvedli, že máte firemní auto." : undefined,
    "domain": answers.usesDomains ? "Přidáno, protože používáte vlastní domény." : undefined,
    "domains": answers.usesDomains ? "Přidáno, protože používáte vlastní domény." : undefined,
    "saas": answers.hasImportantSaaS ? "Přidáno, protože máte důležité SaaS subscriptions." : undefined,
    "contracts": answers.hasOfficeOrLease ? "Přidáno, protože máte kancelář nebo nájemní smlouvu." : undefined,
    "registry": answers.hasMultipleDirectors ? "Přidáno, protože máte více jednatelů a změny v rejstříku je potřeba hlídat." : undefined,
  };
  return reasons[itemId];
}

export function personalizeCompanyItems(answers: CompanyAnswers): PersonalizedCompanyItem[] {
  return COMPANY_ITEMS.filter((item) => {
    if (ALWAYS_INCLUDED_ITEM_IDS.has(item.id)) return true;
    if (["foreign-services", "identified-person"].includes(item.id)) return answers.buysForeignServices;
    if (["vat-turnover"].includes(item.id)) return answers.annualTurnover >= 1_800_000 && !answers.isVatPayer;
    if (item.id === "vat-deadline") return answers.isVatPayer;
    if (["first-employee"].includes(item.id)) return !answers.hasEmployees;
    if (["payroll", "offboarding"].includes(item.id)) return answers.hasEmployees;
    if (["car-stk", "car-insurance"].includes(item.id)) return answers.hasCompanyCar;
    if (["domain", "domains"].includes(item.id)) return answers.usesDomains;
    if (item.id === "saas") return answers.hasImportantSaaS;
    if (item.id === "contracts") return answers.hasOfficeOrLease;
    if (item.id === "registry") return answers.hasMultipleDirectors;
    return false;
  }).map((item) => ({ ...item, personalizationReason: getReason(item.id, answers) }));
}
