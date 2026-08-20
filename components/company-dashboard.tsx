'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    Check,
    ChevronDown,
    Clock3,
    Edit3,
    Flame,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    COMPANY_CATEGORIES,
    DEFAULT_ONBOARDING_ANSWERS,
    getPersonalizedObligations,
    type CompanyCategory,
    type CompanyOnboardingAnswers,
    type ObligationSeverity,
} from '@/lib/company-obligations';
import {
    createTaskId,
    DEFAULT_TASK_DRAFT,
    TASK_KIND_LABELS,
    TASK_ORIGIN_LABELS,
    TASK_TEMPLATES,
    taskFromObligation,
    type Task,
    type TaskDraft,
    type TaskKind,
    type TaskOrigin,
} from '@/lib/task-model';
import {
    filterDashboardTasks,
    getDashboardSummary,
    getDashboardTasks,
    getUrgencyLabel,
    type DashboardTask,
    type UrgencyFilter,
} from '@/lib/urgency-engine';

const STORAGE_KEY = 'co-hori-tasks-v2';
const PROFILE_KEY = 'co-hori-company-profile-v2';
const ORIGIN_FILTERS: Array<TaskOrigin | 'all'> = ['all', 'generated', 'template', 'user'];
const ORIGIN_LABELS = { all: 'Vše', generated: 'Automatické', template: 'Šablony', user: 'Vlastní' } as const;
const SEVERITY_LABELS: Record<ObligationSeverity, string> = {
    critical: 'Hoří',
    important: 'Důležité',
    routine: 'Průběžně',
};
type StoredData = { tasks: Task[]; answers: CompanyOnboardingAnswers };

function getCategoryCount(tasks: DashboardTask[], category: CompanyCategory) {
    return category === 'Vše' ? tasks.length : tasks.filter(({ task }) => task.category === category).length;
}

function TaskEditor({
    initialTask,
    onSave,
    onClose,
}: {
    initialTask?: Task;
    onSave: (draft: TaskDraft) => void;
    onClose: () => void;
}) {
    const [draft, setDraft] = useState<TaskDraft>(initialTask ? { ...initialTask } : DEFAULT_TASK_DRAFT);
    const updateDraft = <Key extends keyof TaskDraft>(key: Key, value: TaskDraft[Key]) =>
        setDraft((current) => ({ ...current, [key]: value }));
    const isConditional = draft.kind === 'conditional';
    const isRecurring = draft.kind === 'recurring';
    return (
        <div className="wizard-backdrop">
            <section className="task-editor" aria-label="Editor položky">
                <div className="editor-heading">
                    <div>
                        <span className="eyebrow">{initialTask ? 'ÚPRAVA POLOŽKY' : 'NOVÁ POLOŽKA'}</span>
                        <h2>{initialTask ? 'Upravit, co hoří' : 'Co chcete pohlídat?'}</h2>
                    </div>
                    <button className="wizard-close" onClick={onClose} aria-label="Zavřít">
                        <X size={18} />
                    </button>
                </div>
                <div className="editor-grid">
                    <label className="wizard-field full">
                        Název
                        <input
                            autoFocus
                            value={draft.title}
                            onChange={(event) => updateDraft('title', event.target.value)}
                            placeholder="např. Odeslat podklady účetní"
                        />
                    </label>
                    <label className="wizard-field full">
                        Krátký popis
                        <textarea
                            value={draft.description}
                            onChange={(event) => updateDraft('description', event.target.value)}
                            rows={2}
                        />
                    </label>
                    <label className="wizard-field">
                        Typ
                        <select
                            value={draft.kind}
                            onChange={(event) => updateDraft('kind', event.target.value as TaskKind)}
                        >
                            {Object.entries(TASK_KIND_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="wizard-field">
                        Kategorie
                        <select
                            value={draft.category}
                            onChange={(event) => updateDraft('category', event.target.value as TaskDraft['category'])}
                        >
                            {COMPANY_CATEGORIES.filter((category) => category !== 'Vše').map((category) => (
                                <option key={category}>{category}</option>
                            ))}
                        </select>
                    </label>
                    {isRecurring ? (
                        <label className="wizard-field">
                            Opakování
                            <input
                                value={draft.recurrence}
                                onChange={(event) => updateDraft('recurrence', event.target.value)}
                                placeholder="např. měsíčně"
                            />
                        </label>
                    ) : null}
                    {isConditional ? (
                        <label className="wizard-field">
                            Kdy se stane relevantní?
                            <input
                                value={draft.trigger}
                                onChange={(event) => updateDraft('trigger', event.target.value)}
                                placeholder="např. při prvním zaměstnanci"
                            />
                        </label>
                    ) : null}
                    {!isConditional && draft.kind !== 'none' ? (
                        <label className="wizard-field">
                            Termín / datum
                            <input
                                type={draft.kind === 'one-time' ? 'date' : 'text'}
                                value={draft.kind === 'one-time' ? draft.dueDate : draft.deadline}
                                onChange={(event) =>
                                    updateDraft(draft.kind === 'one-time' ? 'dueDate' : 'deadline', event.target.value)
                                }
                                placeholder={draft.kind === 'one-time' ? undefined : 'např. každý měsíc'}
                            />
                        </label>
                    ) : null}
                    <label className="wizard-field">
                        Důležitost
                        <select
                            value={draft.severity}
                            onChange={(event) => updateDraft('severity', event.target.value as ObligationSeverity)}
                        >
                            <option value="critical">Hoří</option>
                            <option value="important">Důležité</option>
                            <option value="routine">Průběžně</option>
                        </select>
                    </label>
                    <label className="wizard-field">
                        Odpovědná osoba
                        <input
                            value={draft.responsiblePerson}
                            onChange={(event) => updateDraft('responsiblePerson', event.target.value)}
                            placeholder="např. Jana Nováková"
                        />
                    </label>
                    <label className="wizard-field full">
                        Poznámka
                        <textarea
                            value={draft.note}
                            onChange={(event) => updateDraft('note', event.target.value)}
                            rows={2}
                        />
                    </label>
                </div>
                <div className="wizard-actions">
                    <Button variant="ghost" onClick={onClose}>
                        Zrušit
                    </Button>
                    <Button
                        disabled={!draft.title.trim()}
                        onClick={() => onSave({ ...draft, title: draft.title.trim() })}
                    >
                        {initialTask ? 'Uložit změny' : 'Přidat položku'} <Check size={15} />
                    </Button>
                </div>
            </section>
        </div>
    );
}

function SettingsEditor({
    initialAnswers,
    onSave,
    onClose,
}: {
    initialAnswers: CompanyOnboardingAnswers;
    onSave: (answers: CompanyOnboardingAnswers) => void;
    onClose: () => void;
}) {
    const [answers, setAnswers] = useState(initialAnswers);
    const updateAnswer = <Key extends keyof CompanyOnboardingAnswers>(key: Key, value: CompanyOnboardingAnswers[Key]) =>
        setAnswers((current) => ({ ...current, [key]: value }));
    return (
        <div className="wizard-backdrop">
            <section className="task-editor" aria-label="Nastavení firmy">
                <div className="editor-heading">
                    <div>
                        <span className="eyebrow">NASTAVENÍ FIRMY</span>
                        <h2>Upravte přehled na míru</h2>
                    </div>
                    <button className="wizard-close" onClick={onClose} aria-label="Zavřít">
                        <X size={18} />
                    </button>
                </div>
                <div className="editor-grid">
                    <label className="wizard-field full">
                        Rok založení
                        <input
                            value={answers.foundedYear}
                            onChange={(event) => updateAnswer('foundedYear', event.target.value)}
                            placeholder="např. 2023"
                        />
                    </label>
                    {(
                        [
                            ['isVatPayer', 'Je firma plátce DPH?'],
                            ['hasEmployees', 'Má firma zaměstnance?'],
                            ['hasCompanyCar', 'Má firma firemní auto?'],
                        ] as const
                    ).map(([key, label]) => (
                        <fieldset className="wizard-question" key={key}>
                            <legend>{label}</legend>
                            <div className="choice-row">
                                <button
                                    className={answers[key] ? 'choice active' : 'choice'}
                                    onClick={() => updateAnswer(key, true)}
                                >
                                    Ano
                                </button>
                                <button
                                    className={!answers[key] ? 'choice active' : 'choice'}
                                    onClick={() => updateAnswer(key, false)}
                                >
                                    Ne
                                </button>
                            </div>
                        </fieldset>
                    ))}
                </div>
                <div className="wizard-actions">
                    <Button variant="ghost" onClick={onClose}>
                        Zrušit
                    </Button>
                    <Button onClick={() => onSave(answers)}>
                        Uložit nastavení <Check size={15} />
                    </Button>
                </div>
            </section>
        </div>
    );
}

function TaskCard({
    item,
    onToggle,
    onEdit,
    onDelete,
}: {
    item: DashboardTask;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { task, urgency } = item;
    const deadline =
        task.kind === 'conditional'
            ? task.trigger || 'Až nastane situace'
            : task.kind === 'one-time' && task.dueDate
              ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('cs-CZ')
              : task.deadline || 'Bez konkrétního termínu';
    return (
        <Card
            className={`obligation-card urgency-${urgency.level} ${task.isLegal ? 'is-legal' : ''} ${task.isResolved ? 'is-done' : ''}`}
        >
            <div className="card-topline">
                <button
                    className={`check-toggle ${task.isResolved ? 'checked' : ''}`}
                    aria-label={task.isResolved ? 'Znovu otevřít' : 'Označit jako vyřešené'}
                    onClick={onToggle}
                >
                    {task.isResolved ? <Check size={12} /> : null}
                </button>
                <span className="card-category">{task.category}</span>
                <span className={`urgency-label urgency-label-${urgency.level}`}>{getUrgencyLabel(urgency.level)}</span>
                <span className={`origin-chip origin-${task.origin}`}>{TASK_ORIGIN_LABELS[task.origin]}</span>
            </div>
            <div className="task-title-row">
                <h3>{task.title}</h3>
                <div className="card-actions">
                    <button onClick={onEdit} aria-label="Upravit">
                        <Edit3 size={14} />
                    </button>
                    <button onClick={onDelete} aria-label="Smazat">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            <p>{task.description || 'Bez popisu'}</p>
            {task.note ? <div className="task-note">Poznámka: {task.note}</div> : null}
            <div className="urgency-reason">
                <Flame size={13} /> {urgency.reason}
            </div>
            <div className="task-meta">
                {TASK_KIND_LABELS[task.kind]}
                {task.responsiblePerson ? ` · ${task.responsiblePerson}` : ''}
            </div>
            <div className="card-footer">
                <span className={`severity severity-${task.severity}`}>
                    <span />
                    {SEVERITY_LABELS[task.severity]}
                </span>
                <span className="deadline">
                    <Clock3 size={14} /> {deadline}
                </span>
                <strong className="urgency-score">{urgency.score}/100</strong>
            </div>
        </Card>
    );
}

export function CompanyDashboard() {
    const [isHydrated, setIsHydrated] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [answers, setAnswers] = useState(DEFAULT_ONBOARDING_ANSWERS);
    const [selectedCategory, setSelectedCategory] = useState<CompanyCategory>('Vše');
    const [selectedOrigin, setSelectedOrigin] = useState<TaskOrigin | 'all'>('all');
    const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<UrgencyFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editorTask, setEditorTask] = useState<Task | null | undefined>(undefined);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    useEffect(() => {
        const animationFrameId = window.requestAnimationFrame(() => {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            const profile = window.localStorage.getItem(PROFILE_KEY);
            let loadedAnswers = DEFAULT_ONBOARDING_ANSWERS;
            if (profile) {
                try {
                    loadedAnswers = (JSON.parse(profile) as StoredData).answers ?? loadedAnswers;
                } catch {
                    loadedAnswers = DEFAULT_ONBOARDING_ANSWERS;
                }
            }
            if (stored) {
                try {
                    setTasks((JSON.parse(stored) as StoredData).tasks ?? []);
                } catch {
                    setTasks([]);
                }
            } else setTasks(getPersonalizedObligations(loadedAnswers).map(taskFromObligation));
            setAnswers(loadedAnswers);
            setIsHydrated(true);
        });
        return () => window.cancelAnimationFrame(animationFrameId);
    }, []);
    const saveTasks = (nextTasks: Task[]) => {
        setTasks(nextTasks);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: nextTasks, answers } satisfies StoredData));
    };
    const saveAnswers = (nextAnswers: CompanyOnboardingAnswers) => {
        const generatedTasks = getPersonalizedObligations(nextAnswers).map(taskFromObligation);
        const customTasks = tasks.filter((task) => task.origin !== 'generated');
        const nextTasks = [...generatedTasks, ...customTasks];
        setAnswers(nextAnswers);
        setTasks(nextTasks);
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ answers: nextAnswers }));
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ tasks: nextTasks, answers: nextAnswers } satisfies StoredData),
        );
        setIsSettingsOpen(false);
    };
    const dashboardTasks = useMemo(() => getDashboardTasks(tasks), [tasks]);
    const dashboardSummary = useMemo(() => getDashboardSummary(dashboardTasks), [dashboardTasks]);
    const filteredTasks = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        return filterDashboardTasks(dashboardTasks, selectedUrgencyFilter).filter(
            ({ task }) =>
                (selectedCategory === 'Vše' || task.category === selectedCategory) &&
                (selectedOrigin === 'all' || task.origin === selectedOrigin) &&
                (!normalizedSearchTerm ||
                    `${task.title} ${task.description} ${task.note} ${task.responsiblePerson}`
                        .toLowerCase()
                        .includes(normalizedSearchTerm)),
        );
    }, [dashboardTasks, selectedCategory, selectedOrigin, selectedUrgencyFilter, searchTerm]);
    const openEditor = (task?: Task) => setEditorTask(task ?? null);
    const saveTask = (draft: TaskDraft) => {
        const currentTask = editorTask;
        if (currentTask)
            saveTasks(tasks.map((task) => (task.id === currentTask.id ? { ...currentTask, ...draft } : task)));
        else saveTasks([...tasks, { ...draft, id: createTaskId(), isResolved: false, origin: 'user' }]);
        setEditorTask(undefined);
    };
    const toggleTask = (task: Task) =>
        saveTasks(tasks.map((item) => (item.id === task.id ? { ...item, isResolved: !item.isResolved } : item)));
    const deleteTask = (task: Task) => {
        if (window.confirm(`Opravdu smazat položku „${task.title}“?`))
            saveTasks(tasks.filter((item) => item.id !== task.id));
    };
    const addTemplate = (template: TaskDraft) => {
        saveTasks([...tasks, { ...template, id: createTaskId(), isResolved: false, origin: 'template' }]);
        setIsTemplateOpen(false);
    };
    if (!isHydrated) return <div className="app-loading">Načítám váš přehled…</div>;
    const { burningCount, overdueCount, todayCount, thisWeekCount, doneCount } = dashboardSummary;
    return (
        <div className="dashboard-shell">
            <header className="dashboard-header container">
                <div className="dashboard-brand">
                    <div className="flame-mark">
                        <Flame size={21} fill="currentColor" />
                    </div>
                    <div>
                        <span className="product-name">Co hoří?</span>
                        <span className="product-tagline">klid v administrativě</span>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <span className="company-pill">
                        <span className="company-avatar">A</span> Moje firma <ChevronDown size={14} />
                    </span>
                    <Button variant="secondary" onClick={() => setIsSettingsOpen(true)}>
                        <Edit3 size={15} /> Nastavení firmy
                    </Button>
                </div>
            </header>
            <main className="container dashboard-main">
                <section className="welcome-row">
                    <div>
                        <p className="eyebrow">PŘEHLED FIRMY</p>
                        <h1>
                            Co dnes hoří? <span>👋</span>
                        </h1>
                        <p className="subtitle">Seřazeno podle toho, co právě potřebuje nejvíc pozornosti.</p>
                    </div>
                    <Button onClick={() => openEditor()}>
                        <Plus size={16} /> Přidat položku
                    </Button>
                </section>
                <section className="summary-grid">
                    <Card className="summary-card summary-critical">
                        <div className="summary-icon">
                            <Flame size={20} />
                        </div>
                        <div>
                            <strong>{burningCount}</strong>
                            <span>Hoří teď</span>
                        </div>
                        <small>Skóre 50 a více</small>
                    </Card>
                    <Card className="summary-card">
                        <div className="summary-icon summary-blue">
                            <Clock3 size={20} />
                        </div>
                        <div>
                            <strong>{overdueCount}</strong>
                            <span>Po termínu</span>
                        </div>
                        <small>Vyžaduje kontrolu</small>
                    </Card>
                    <Card className="summary-card summary-card-today">
                        <div className="summary-icon summary-yellow">
                            <Clock3 size={20} />
                        </div>
                        <div>
                            <strong>{todayCount}</strong>
                            <span>Dnes</span>
                        </div>
                        <small>{thisWeekCount} tento týden</small>
                    </Card>
                    <Card className="summary-card summary-health">
                        <div className="health-heading">
                            <ShieldCheck size={17} /> Stav přehledu
                        </div>
                        <strong>{doneCount} hotových</strong>
                        <div className="health-bar">
                            <span
                                style={{ width: `${tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0}%` }}
                            />
                        </div>
                        <small>
                            {doneCount} z {tasks.length} položek vyřešeno
                        </small>
                    </Card>
                </section>
                <section className="filter-section">
                    <div className="section-heading">
                        <div>
                            <h2>Vše, co je potřeba hlídat</h2>
                            <p>{filteredTasks.length} položek v přehledu</p>
                        </div>
                        <label className="search-box">
                            <Search size={16} />
                            <input
                                placeholder="Hledat v položkách…"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </label>
                    </div>
                    <div className="category-scroller" role="tablist" aria-label="Kategorie">
                        {COMPANY_CATEGORIES.map((category) => (
                            <button
                                key={category}
                                role="tab"
                                aria-selected={selectedCategory === category}
                                className={selectedCategory === category ? 'category-tab active' : 'category-tab'}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                                <span>{getCategoryCount(dashboardTasks, category)}</span>
                            </button>
                        ))}
                    </div>
                    <div className="status-filters">
                        <span>Filtr:</span>
                        {([['all', 'Všechno'], ['burning', 'Hoří'], ['today', 'Dnes'], ['this-week', 'Tento týden'], ['overdue', 'Po termínu'], ['done', 'Hotovo']] as const).map(([filter, label]) => (
                            <button key={filter} className={selectedUrgencyFilter === filter ? 'status-filter active' : 'status-filter'} onClick={() => setSelectedUrgencyFilter(filter)}>{label}</button>
                        ))}
                        <span className="status-divider">Zdroj:</span>
                        {ORIGIN_FILTERS.map((origin) => (
                            <button
                                key={origin}
                                className={selectedOrigin === origin ? 'status-filter active' : 'status-filter'}
                                onClick={() => setSelectedOrigin(origin)}
                            >
                                {ORIGIN_LABELS[origin]}
                            </button>
                        ))}
                    </div>
                </section>
                <section className="obligation-grid">
                    {filteredTasks.map((item) => (
                        <TaskCard
                            key={item.task.id}
                            item={item}
                            onToggle={() => toggleTask(item.task)}
                            onEdit={() => openEditor(item.task)}
                            onDelete={() => deleteTask(item.task)}
                        />
                    ))}
                    {filteredTasks.length === 0 ? (
                        <div className="empty-state">Nic tu není. Přidejte vlastní položku nebo vyberte šablonu.</div>
                    ) : null}
                </section>
                <section className="template-section">
                    <div>
                        <h2>Časté firemní úkoly</h2>
                        <p>Vyberte si připravenou šablonu a upravte ji podle sebe.</p>
                    </div>
                    <Button variant="secondary" onClick={() => setIsTemplateOpen(!isTemplateOpen)}>
                        {isTemplateOpen ? 'Skrýt šablony' : 'Procházet šablony'}
                    </Button>
                    {isTemplateOpen ? (
                        <div className="template-grid">
                            {TASK_TEMPLATES.map((template) => (
                                <button
                                    className="template-item"
                                    key={template.title}
                                    onClick={() => addTemplate(template)}
                                >
                                    <span>
                                        <strong>{template.title}</strong>
                                        <small>
                                            {TASK_KIND_LABELS[template.kind]} · {template.category}
                                        </small>
                                    </span>
                                    <Plus size={16} />
                                </button>
                            ))}
                        </div>
                    ) : null}
                </section>
                <div className="legal-note">
                    <AlertTriangle size={18} />
                    <p>
                        <strong>Právní a daňové informace jsou orientační.</strong> U důležitých věcí si ověřte aktuální
                        stav u účetní nebo daňového poradce.
                    </p>
                </div>
            </main>
            {editorTask !== undefined ? (
                <TaskEditor
                    initialTask={editorTask ?? undefined}
                    onSave={saveTask}
                    onClose={() => setEditorTask(undefined)}
                />
            ) : null}
            {isSettingsOpen ? (
                <SettingsEditor
                    initialAnswers={answers}
                    onSave={saveAnswers}
                    onClose={() => setIsSettingsOpen(false)}
                />
            ) : null}
        </div>
    );
}
