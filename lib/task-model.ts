import type {
    CompanyCategory,
    CompanyObligation,
    ObligationRisk,
    ObligationSeverity,
    ObligationStatus,
    RuleType,
} from '@/lib/company-obligations';

export const TASK_ORIGINS = ['template', 'generated', 'user'] as const;
export type TaskOrigin = (typeof TASK_ORIGINS)[number];
export type TaskKind = 'one-time' | 'recurring' | 'conditional' | 'none';

export type Task = {
    id: string;
    title: string;
    description: string;
    category: Exclude<CompanyCategory, 'Vše'>;
    kind: TaskKind;
    deadline: string;
    dueDate?: string;
    recurrence?: string;
    trigger?: string;
    severity: ObligationSeverity;
    isResolved: boolean;
    note: string;
    responsiblePerson: string;
    origin: TaskOrigin;
    isLegal: boolean;
    risks?: ObligationRisk[];
    status?: ObligationStatus;
    source?: string;
    sourceTitle?: string;
    sourceUrl?: string;
    verifiedAt?: string;
    explanation?: string;
    ruleType?: RuleType;
};

export type TaskDraft = Omit<Task, 'id' | 'isResolved' | 'origin' | 'status'>;

export const TASK_ORIGIN_LABELS: Record<TaskOrigin, string> = {
    template: 'Šablona',
    generated: 'Automaticky',
    user: 'Vlastní',
};

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
    'one-time': 'Jednorázový termín',
    recurring: 'Opakovaný úkol',
    conditional: 'Podmíněný úkol',
    none: 'Bez termínu',
};

export const DEFAULT_TASK_DRAFT: TaskDraft = {
    title: '',
    description: '',
    category: 'Účetnictví',
    kind: 'one-time',
    deadline: '',
    dueDate: '',
    recurrence: 'Měsíčně',
    trigger: '',
    severity: 'routine',
    note: '',
    responsiblePerson: '',
    isLegal: false,
    risks: [],
};

export const TASK_TEMPLATES: TaskDraft[] = [
    {
        ...DEFAULT_TASK_DRAFT,
        title: 'Zkontrolovat datovou schránku',
        description: 'Projít nové zprávy a pohlídat jejich vyřízení.',
        category: 'Datová schránka',
        kind: 'recurring',
        deadline: 'Každý týden',
        recurrence: 'Týdně',
    },
    {
        ...DEFAULT_TASK_DRAFT,
        title: 'Předat doklady účetní',
        description: 'Shromáždit doklady a předat je účetnímu týmu.',
        category: 'Účetnictví',
        kind: 'recurring',
        deadline: 'Měsíčně',
        recurrence: 'Měsíčně',
    },
    {
        ...DEFAULT_TASK_DRAFT,
        title: 'Zkontrolovat neuhrazené faktury',
        description: 'Projít splatnost a odeslat potřebné upomínky.',
        category: 'Banka a cashflow',
        kind: 'recurring',
        deadline: 'Každý týden',
        recurrence: 'Týdně',
        severity: 'important',
    },
    {
        ...DEFAULT_TASK_DRAFT,
        title: 'Zkontrolovat zálohy',
        description: 'Ověřit, že jsou pravidelné zálohy uhrazené a správně nastavené.',
        category: 'Banka a cashflow',
        kind: 'recurring',
        deadline: 'Měsíčně',
        recurrence: 'Měsíčně',
    },
    {
        ...DEFAULT_TASK_DRAFT,
        title: 'Zkontrolovat aktivní přístupy',
        description: 'Odebrat staré přístupy do banky, cloudu a dalších nástrojů.',
        category: 'IT a bezpečnost',
        kind: 'recurring',
        deadline: 'Čtvrtletně',
        recurrence: 'Čtvrtletně',
        severity: 'important',
    },
    ...[
        ['První zaměstnanec', 'Zaměstnanci', 'Před prvním nástupem zaměstnance'],
        ['První faktura do zahraničí', 'Daně', 'Před vystavením první faktury do zahraničí'],
        ['První nákup zahraniční SaaS služby', 'DPH', 'Před prvním nákupem zahraniční služby'],
        ['Překročení obratu pro DPH', 'DPH', 'Když obrat překročí zákonnou hranici'],
        ['Změna jednatele', 'Obchodní rejstřík', 'Při změně jednatele'],
        ['Změna sídla společnosti', 'Obchodní rejstřík', 'Při změně sídla'],
    ].map(([title, category, trigger]) => ({
        ...DEFAULT_TASK_DRAFT,
        title,
        description: 'Připravená připomínka pro důležitý okamžik ve firmě.',
        category: category as TaskDraft['category'],
        kind: 'conditional' as const,
        deadline: 'Až nastane situace',
        trigger,
    })),
];

export function taskFromObligation(obligation: CompanyObligation & { reason?: string }): Task {
    return {
        ...obligation,
        kind: 'none',
        deadline: obligation.deadline,
        isResolved: obligation.status === 'done',
        note: '',
        responsiblePerson: '',
        origin: 'generated',
    };
}

export function createTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
