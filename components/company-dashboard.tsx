"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight, Bell, Check, ChevronDown, CircleHelp, Clock3, FileCheck2, Flame, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COMPANY_CATEGORIES, COMPANY_OBLIGATIONS, type CompanyCategory, type CompanyObligation } from "@/lib/company-obligations";

const SEVERITY_LABELS = { critical: "Hoří", important: "Důležité", routine: "Průběžně" } as const;
const STATUS_LABELS = { open: "Otevřené", "in-progress": "Rozpracované", done: "Hotové" } as const;

function getCategoryCount(category: CompanyCategory) {
  return category === "Vše" ? COMPANY_OBLIGATIONS.length : COMPANY_OBLIGATIONS.filter((item) => item.category === category).length;
}

function ObligationCard({ obligation }: { obligation: CompanyObligation }) {
  const isDone = obligation.status === "done";
  return <Card className={`obligation-card ${obligation.isLegal ? "is-legal" : ""} ${isDone ? "is-done" : ""}`}>
    <div className="card-topline"><span className={`status-dot status-${obligation.status}`} aria-label={STATUS_LABELS[obligation.status]} /><span className="card-category">{obligation.category}</span>{obligation.isLegal ? <span className="legal-label"><ShieldCheck size={13} /> Pravidlo / lhůta</span> : null}</div>
    <h3>{obligation.title}</h3><p>{obligation.description}</p>
    <div className="card-footer"><span className={`severity severity-${obligation.severity}`}><span />{SEVERITY_LABELS[obligation.severity]}</span><span className="deadline"><Clock3 size={14} /> {obligation.deadline}</span></div>
    {obligation.source ? <div className="source">Zdroj: {obligation.source} <ArrowUpRight size={12} /></div> : null}
    {obligation.verifiedAt ? <div className="verified"><Check size={13} /> Ověřeno {obligation.verifiedAt}</div> : null}
  </Card>;
}

export function CompanyDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<CompanyCategory>("Vše");
  const [selectedStatus, setSelectedStatus] = useState<"all" | CompanyObligation["status"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const filteredObligations = useMemo(() => COMPANY_OBLIGATIONS.filter((obligation) => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    return (selectedCategory === "Vše" || obligation.category === selectedCategory) && (selectedStatus === "all" || obligation.status === selectedStatus) && (!normalizedSearchTerm || `${obligation.title} ${obligation.description}`.toLowerCase().includes(normalizedSearchTerm));
  }), [searchTerm, selectedCategory, selectedStatus]);
  const openCount = COMPANY_OBLIGATIONS.filter((item) => item.status !== "done").length;
  const criticalCount = COMPANY_OBLIGATIONS.filter((item) => item.severity === "critical" && item.status !== "done").length;
  const doneCount = COMPANY_OBLIGATIONS.filter((item) => item.status === "done").length;

  return <div className="dashboard-shell">
    <header className="dashboard-header container"><div className="dashboard-brand"><div className="flame-mark"><Flame size={21} fill="currentColor" /></div><div><span className="product-name">Co hoří?</span><span className="product-tagline">klid v administrativě</span></div></div><div className="dashboard-header-actions"><span className="company-pill"><span className="company-avatar">A</span> Acme s.r.o. <ChevronDown size={14} /></span><button className="icon-button" aria-label="Notifikace"><Bell size={19} /><i /></button><Button variant="secondary" className="help-button"><CircleHelp size={16} /> Jak to funguje</Button></div></header>
    <main className="container dashboard-main">
      <section className="welcome-row"><div><p className="eyebrow">STŘEDA · 20. SRPNA 2026</p><h1>Dobré ráno, Andreji <span>👋</span></h1><p className="subtitle">Tady je přehled toho, co by vám dnes nemělo utéct.</p></div><Button><span className="button-plus">+</span> Přidat připomínku</Button></section>
      <section className="summary-grid" aria-label="Souhrn povinností"><Card className="summary-card summary-critical"><div className="summary-icon"><Flame size={20} /></div><div><strong>{criticalCount}</strong><span>Hoří teď</span></div><small>Vyžaduje pozornost</small></Card><Card className="summary-card"><div className="summary-icon summary-blue"><Clock3 size={20} /></div><div><strong>{openCount}</strong><span>Otevřených věcí</span></div><small>Celkem k pohlídání</small></Card><Card className="summary-card"><div className="summary-icon summary-green"><FileCheck2 size={20} /></div><div><strong>{doneCount}</strong><span>Ověřeno</span></div><small>Tento měsíc</small></Card><Card className="summary-card summary-health"><div className="health-heading"><ShieldCheck size={17} /> Stav firmy</div><strong>Vypadá to dobře</strong><div className="health-bar"><span /></div><small>8 z 10 oblastí bez rizika</small></Card></section>
      <section className="filter-section"><div className="section-heading"><div><h2>Vše, co je potřeba hlídat</h2><p>{filteredObligations.length} položek v přehledu</p></div><label className="search-box"><Search size={16} /><input placeholder="Hledat v připomínkách…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label></div><div className="category-scroller" role="tablist" aria-label="Kategorie">{COMPANY_CATEGORIES.map((category) => <button key={category} role="tab" aria-selected={selectedCategory === category} className={selectedCategory === category ? "category-tab active" : "category-tab"} onClick={() => setSelectedCategory(category)}>{category}<span>{getCategoryCount(category)}</span></button>)}</div><div className="status-filters"><span>Filtrovat:</span>{(["all", "open", "in-progress", "done"] as const).map((status) => <button key={status} className={selectedStatus === status ? "status-filter active" : "status-filter"} onClick={() => setSelectedStatus(status)}>{status === "all" ? "Vše" : STATUS_LABELS[status]}</button>)}</div></section>
      <section className="obligation-grid">{filteredObligations.map((obligation) => <ObligationCard key={obligation.id} obligation={obligation} />)}{filteredObligations.length === 0 ? <div className="empty-state">Nic jsme nenašli. Zkuste jiný filtr nebo hledaný výraz.</div> : null}</section>
      <div className="legal-note"><AlertTriangle size={18} /><p><strong>Právní a daňové informace jsou orientační.</strong> Lhůty se mohou měnit podle konkrétní situace firmy. U důležitých věcí si vždy ověřte aktuální stav u účetní nebo daňového poradce.</p></div>
    </main>
  </div>;
}
