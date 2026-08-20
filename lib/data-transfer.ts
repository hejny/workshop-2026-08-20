import { COMPANY_CATEGORIES, type CompanyOnboardingAnswers, type RuleType } from '@/lib/company-obligations';
import { TASK_ORIGINS, type Task, type TaskKind } from '@/lib/task-model';

export const EXPORT_FORMAT_VERSION = 1;
export const IMPORT_ERROR_MESSAGE = 'Soubor nelze importovat: data jsou neplatná nebo poškozená.';

export type ExportedNote = { taskId: string; text: string };
export type ExportPayload = {
    formatVersion: number;
    exportedAt: string;
    companyProfile: CompanyOnboardingAnswers;
    tasks: Task[];
    resolvedTasks: Task[];
    customTasks: Task[];
    notes: ExportedNote[];
};

export type ValidImport = { payload: ExportPayload };
export type ImportResult = ValidImport | { error: string };

const TASK_KINDS: TaskKind[] = ['one-time', 'recurring', 'conditional', 'none'];
const RULE_TYPES: RuleType[] = ['legal', 'tax', 'recommended', 'operational'];
const COMPANY_PROFILE_BOOLEAN_KEYS = [
    'isVatPayer', 'isIdentifiedPerson', 'isBuyingForeignServices', 'isSellingToEuropeanUnion', 'hasEmployees',
    'isPlanningFirstEmployee', 'hasCompanyCar', 'hasOfficeLease', 'hasMultipleExecutives', 'hasAccountant',
    'usesDomains', 'hasImportantSaas',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string { return typeof value === 'string'; }
function isBoolean(value: unknown): value is boolean { return typeof value === 'boolean'; }
function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T { return typeof value === 'string' && values.includes(value as T); }
function isValidDateOnly(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidProfile(value: unknown): value is CompanyOnboardingAnswers {
    if (!isRecord(value) || !isString(value.foundedYear) || !isString(value.annualTurnover) || !Array.isArray(value.foreignServiceProviders)) return false;
    if (!value.foreignServiceProviders.every(isString)) return false;
    return COMPANY_PROFILE_BOOLEAN_KEYS.every((key) => isBoolean(value[key]));
}

function isValidTask(value: unknown): value is Task {
    if (!isRecord(value)) return false;
    const requiredStrings = ['id', 'title', 'description', 'deadline', 'note', 'responsiblePerson'];
    if (!requiredStrings.every((key) => isString(value[key])) || value.id === '') return false;
    if (!isOneOf(value.category, COMPANY_CATEGORIES.filter((category) => category !== 'Vše'))) return false;
    if (!isOneOf(value.kind, TASK_KINDS) || !isOneOf(value.origin, TASK_ORIGINS)) return false;
    if (!isOneOf(value.severity, ['critical', 'important', 'routine'] as const) || !isBoolean(value.isResolved) || !isBoolean(value.isLegal)) return false;
    if (value.status !== undefined && !isOneOf(value.status, ['open', 'in-progress', 'done'] as const)) return false;
    if (value.ruleType !== undefined && !isOneOf(value.ruleType, RULE_TYPES)) return false;
    for (const key of ['dueDate', 'recurrence', 'trigger', 'source', 'sourceTitle', 'sourceUrl', 'verifiedAt', 'explanation']) {
        if (value[key] !== undefined && !isString(value[key])) return false;
    }
    if (value.dueDate !== undefined && (!isString(value.dueDate) || !isValidDateOnly(value.dueDate))) return false;
    if (value.sourceUrl !== undefined) {
        if (!isString(value.sourceUrl)) return false;
        try { if (!['http:', 'https:'].includes(new URL(value.sourceUrl).protocol)) return false; } catch { return false; }
    }
    if (value.risks !== undefined && (!Array.isArray(value.risks) || !value.risks.every((risk) => isOneOf(risk, ['fine', 'financial-loss', 'operational-problem'] as const)))) return false;
    return true;
}

function hasUniqueTaskIds(tasks: Task[]) { return new Set(tasks.map((task) => task.id)).size === tasks.length; }
function sameTaskIds(first: Task[], second: Task[]) { return first.map((task) => task.id).sort().join('|') === second.map((task) => task.id).sort().join('|'); }

export function createExportPayload(tasks: Task[], companyProfile: CompanyOnboardingAnswers): ExportPayload {
    return {
        formatVersion: EXPORT_FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        companyProfile,
        tasks,
        resolvedTasks: tasks.filter((task) => task.isResolved),
        customTasks: tasks.filter((task) => task.origin !== 'generated'),
        notes: tasks.filter((task) => task.note.trim()).map((task) => ({ taskId: task.id, text: task.note })),
    };
}

export function validateImportData(value: unknown): ImportResult {
    if (!isRecord(value) || value.formatVersion !== EXPORT_FORMAT_VERSION || !isString(value.exportedAt) || Number.isNaN(Date.parse(value.exportedAt)) || !isValidProfile(value.companyProfile)) return { error: IMPORT_ERROR_MESSAGE };
    if (!Array.isArray(value.tasks) || !Array.isArray(value.resolvedTasks) || !Array.isArray(value.customTasks) || !Array.isArray(value.notes)) return { error: IMPORT_ERROR_MESSAGE };
    const tasks = value.tasks as unknown[];
    const resolvedTasks = value.resolvedTasks as unknown[];
    const customTasks = value.customTasks as unknown[];
    if (!tasks.every(isValidTask) || !resolvedTasks.every(isValidTask) || !customTasks.every(isValidTask)) return { error: IMPORT_ERROR_MESSAGE };
    const validTasks = tasks as Task[];
    const validResolvedTasks = resolvedTasks as Task[];
    const validCustomTasks = customTasks as Task[];
    if (!hasUniqueTaskIds(validTasks)) return { error: IMPORT_ERROR_MESSAGE };
    if (!validResolvedTasks.every((task) => task.isResolved) || !validCustomTasks.every((task) => task.origin !== 'generated')) return { error: IMPORT_ERROR_MESSAGE };
    if (!sameTaskIds(validResolvedTasks, validTasks.filter((task) => task.isResolved)) || !sameTaskIds(validCustomTasks, validTasks.filter((task) => task.origin !== 'generated'))) return { error: IMPORT_ERROR_MESSAGE };
    if (!value.notes.every((note) => isRecord(note) && isString(note.taskId) && isString(note.text) && validTasks.some((task) => task.id === note.taskId))) return { error: IMPORT_ERROR_MESSAGE };
    return { payload: { formatVersion: EXPORT_FORMAT_VERSION, exportedAt: value.exportedAt, companyProfile: value.companyProfile, tasks: validTasks, resolvedTasks: validResolvedTasks, customTasks: validCustomTasks, notes: value.notes as ExportedNote[] } };
}

export function parseImportJson(json: string): ImportResult {
    try { return validateImportData(JSON.parse(json) as unknown); } catch { return { error: IMPORT_ERROR_MESSAGE }; }
}
