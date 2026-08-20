export type ItemKind = "legal" | "finance" | "operations";
export type ItemStatus = "urgent" | "upcoming" | "ok";

export type CompanyItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  severity: "high" | "medium" | "low";
  status: ItemStatus;
  kind: ItemKind;
  source?: string;
  verifiedAt?: string;
};

export const CATEGORIES = ["Vše", "Založení firmy", "Účetnictví", "Daně", "DPH", "Datová schránka", "Úřady", "Zaměstnanci", "Obchodní rejstřík", "Smlouvy", "Banka a cashflow", "GDPR a data", "IT a bezpečnost", "Domény a předplatná", "Firemní auta a majetek"];

export const COMPANY_ITEMS: CompanyItem[] = [
  { id: "tax-registration", title: "Přihlásit s.r.o. k dani z příjmů právnických osob", description: "Do 15 dnů od vzniku společnosti.", category: "Založení firmy", deadline: "Do 15 dnů od vzniku", severity: "high", status: "urgent", kind: "legal", source: "Finanční správa" },
  { id: "accounting", title: "Nastavit účetnictví a předávání dokladů účetní", description: "Domluvte si pravidelný rytmus a místo pro sdílení dokladů.", category: "Účetnictví", deadline: "Co nejdříve", severity: "medium", status: "upcoming", kind: "operations" },
  { id: "data-box", title: "Zkontrolovat, že má firma funkční datovou schránku", description: "Ověřte přístup jednatele a nastavte zastupitelnost.", category: "Datová schránka", deadline: "Při vzniku firmy", severity: "high", status: "urgent", kind: "legal", source: "mojedatovaschranka.cz" },
  { id: "data-notifications", title: "Nastavit notifikace z datové schránky", description: "E-mail nebo SMS upozornění pomůže zachytit nové zprávy včas.", category: "Datová schránka", deadline: "Doporučeno nastavit ihned", severity: "medium", status: "upcoming", kind: "operations" },
  { id: "fiction-delivery", title: "Pohlídat fikci doručení datové zprávy", description: "Nepřečtená datová zpráva může být po 10 dnech považována za doručenou.", category: "Datová schránka", deadline: "Průběžně", severity: "high", status: "urgent", kind: "legal", source: "zákon č. 300/2008 Sb." },
  { id: "foreign-services", title: "Nákupy služeb ze zahraničí a identifikovaná osoba", description: "OpenAI, Google, Meta, AWS, Figma nebo jiná služba mohou založit povinnost k DPH.", category: "DPH", deadline: "Při každém nákupu", severity: "high", status: "urgent", kind: "legal", source: "Finanční správa" },
  { id: "identified-person", title: "Pohlídat registraci identifikované osoby", description: "Pokud postavení vznikne, hlídejte registraci do 15 dnů.", category: "DPH", deadline: "Do 15 dnů od vzniku", severity: "high", status: "upcoming", kind: "legal" },
  { id: "vat-turnover", title: "Hlídání obratu pro povinnou registraci k DPH", description: "Počítejte obrat za kalendářní rok a sledujte hranice 2 000 000 Kč a 2 536 500 Kč.", category: "DPH", deadline: "Měsíčně", severity: "high", status: "upcoming", kind: "legal", source: "Finanční správa" },
  { id: "vat-deadline", title: "Přihláška k registraci plátce DPH", description: "Po překročení relevantní hranice hlídejte lhůtu 10 pracovních dnů.", category: "DPH", deadline: "Do 10 pracovních dnů", severity: "high", status: "ok", kind: "legal" },
  { id: "pay-invoices", title: "Zaplatit faktury před splatností", description: "Pravidelná kontrola závazků a plánovaných plateb.", category: "Banka a cashflow", deadline: "Každý týden", severity: "medium", status: "upcoming", kind: "finance" },
  { id: "issued-invoices", title: "Zkontrolovat nezaplacené vydané faktury", description: "Projít po splatnosti a připomenout se odběratelům.", category: "Banka a cashflow", deadline: "Každý týden", severity: "medium", status: "urgent", kind: "finance" },
  { id: "monthly-docs", title: "Odevzdat účetní všechny doklady za minulý měsíc", description: "Včetně banky, pokladny, faktur a účtenek.", category: "Účetnictví", deadline: "Do 10. dne v měsíci", severity: "medium", status: "upcoming", kind: "finance" },
  { id: "corporate-tax", title: "Podat daňové přiznání k dani z příjmů právnických osob", description: "Standardně 3 měsíce, případně 4 měsíce při pozdějším elektronickém podání nebo 6 měsíců v zákonných případech.", category: "Daně", deadline: "1× ročně", severity: "high", status: "ok", kind: "legal", source: "Finanční správa" },
  { id: "pay-tax", title: "Zaplatit vypočtenou daň", description: "Platbu naplánujte s dostatečným předstihem před splatností.", category: "Daně", deadline: "Dle přiznání", severity: "high", status: "ok", kind: "finance" },
  { id: "statements", title: "Připravit účetní závěrku", description: "Zajistit podklady a termín s účetní.", category: "Účetnictví", deadline: "1× ročně", severity: "medium", status: "ok", kind: "legal" },
  { id: "collection", title: "Uložit účetní závěrku do sbírky listin", description: "Nejzazší lhůta je obecně 12 měsíců od rozvahového dne.", category: "Úřady", deadline: "Do 12 měsíců od rozvahového dne", severity: "high", status: "ok", kind: "legal", source: "justice.cz" },
  { id: "registry", title: "Zkontrolovat změny v obchodním rejstříku", description: "Jednatelé, sídlo i další údaje mohou vyžadovat zápis změny.", category: "Obchodní rejstřík", deadline: "Při každé změně", severity: "medium", status: "upcoming", kind: "legal" },
  { id: "first-employee", title: "Ověřit povinnosti před přijetím prvního zaměstnance", description: "Registrace, BOZP, pracovnělékařské služby a další nastavení.", category: "Zaměstnanci", deadline: "Před nástupem", severity: "high", status: "upcoming", kind: "legal" },
  { id: "payroll", title: "Nastavit mzdovou agendu při přijetí prvního zaměstnance", description: "Vyberte mzdový systém nebo zpracovatele mezd.", category: "Zaměstnanci", deadline: "Před prvním nástupem", severity: "medium", status: "ok", kind: "operations" },
  { id: "contracts", title: "Hlídání nájmů a dalších důležitých smluv", description: "Mějte přehled o výpovědních lhůtách, indexaci i obnovách.", category: "Smlouvy", deadline: "Průběžně", severity: "medium", status: "upcoming", kind: "operations" },
  { id: "insurance", title: "Pohlídat firemní pojištění", description: "Ověřit platnost pojistných smluv a rozsah krytí.", category: "Smlouvy", deadline: "1× ročně", severity: "low", status: "ok", kind: "operations" },
  { id: "domain", title: "Expirace hlavní firemní domény", description: "Doména musí zůstat aktivní kvůli webu i e-mailům.", category: "Domény a předplatná", deadline: "Za 24 dní", severity: "high", status: "urgent", kind: "operations" },
  { id: "domains", title: "Expirace dalších domén", description: "Zkontrolovat portfolio domén a kontaktní e-mail registrátora.", category: "Domény a předplatná", deadline: "1× za čtvrtletí", severity: "medium", status: "upcoming", kind: "operations" },
  { id: "ssl", title: "Obnova SSL certifikátů", description: "Platí pro certifikáty, které se neobnovují automaticky.", category: "IT a bezpečnost", deadline: "Před expirací", severity: "medium", status: "ok", kind: "operations" },
  { id: "saas", title: "Obnova důležitých SaaS předplatných", description: "Kalendář, cloud, účetnictví a další klíčové nástroje.", category: "Domény a předplatná", deadline: "Před obnovou", severity: "low", status: "upcoming", kind: "finance" },
  { id: "backups", title: "Zkontrolovat zálohy firemních dat", description: "Ověřit, že zálohy skutečně probíhají a lze je obnovit.", category: "IT a bezpečnost", deadline: "Každý měsíc", severity: "high", status: "urgent", kind: "operations" },
  { id: "offboarding", title: "Zkontrolovat přístupy bývalých zaměstnanců a spolupracovníků", description: "Zrušit účty, tokeny a sdílené přístupy bez prodlení.", category: "GDPR a data", deadline: "Při ukončení spolupráce", severity: "high", status: "upcoming", kind: "legal" },
  { id: "bank-access", title: "Zkontrolovat oprávnění k bankovnímu účtu", description: "Přístupy a podpisová oprávnění držte aktuální.", category: "Banka a cashflow", deadline: "1× za čtvrtletí", severity: "high", status: "ok", kind: "finance" },
  { id: "car-stk", title: "STK firemního auta", description: "Pohlídat platnost technické kontroly a termín návštěvy.", category: "Firemní auta a majetek", deadline: "Za 3 měsíce", severity: "medium", status: "upcoming", kind: "operations" },
  { id: "car-insurance", title: "Pojištění firemního auta", description: "Ověřit platnost povinného ručení i havarijního pojištění.", category: "Firemní auta a majetek", deadline: "Za 2 měsíce", severity: "medium", status: "ok", kind: "finance" },
];
