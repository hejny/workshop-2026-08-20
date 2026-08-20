import type { ObligationRisk, ObligationSeverity, ObligationStatus } from '@/lib/company-obligations';
import type { Task } from '@/lib/task-model';

export type UrgencyLevel = 'calm' | 'warming' | 'burning' | 'critical';
export type UrgencyFilter = 'all' | 'burning' | 'today' | 'this-week' | 'overdue' | 'done';
export type UrgencyResult = {
    score: number;
    level: UrgencyLevel;
    reason: string;
    daysRemaining: number | null;
    isOverdue: boolean;
    isDueToday: boolean;
    isDueThisWeek: boolean;
};
export type DashboardTask = { task: Task; urgency: UrgencyResult };
export type DashboardSummary = {
    burningCount: number;
    overdueCount: number;
    todayCount: number;
    thisWeekCount: number;
    doneCount: number;
};

const SEVERITY_POINTS: Record<ObligationSeverity, number> = { critical: 35, important: 20, routine: 8 };
const STATUS_POINTS: Record<ObligationStatus, number> = { open: 8, 'in-progress': 3, done: -35 };
const RISK_POINTS: Record<ObligationRisk, number> = { fine: 14, 'financial-loss': 12, 'operational-problem': 10 };
const DAY_IN_MILLISECONDS = 86_400_000;

function getDateOnly(value: string): Date | null {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getDeadlineDate(task: Task, referenceDate: Date): Date | null {
    if (task.dueDate) return getDateOnly(task.dueDate);
    const relativeDays = task.deadline.match(/(?:za|před)\s+(\d+)\s+dny?/i) ?? task.deadline.match(/(\d+)\s+dní\s+po/i);
    if (!relativeDays) return null;
    const days = Number(relativeDays[1]);
    const direction = /před|po/i.test(relativeDays[0]) ? -1 : 1;
    return new Date(referenceDate.getTime() + direction * days * DAY_IN_MILLISECONDS);
}

function getDaysRemaining(deadlineDate: Date | null, referenceDate: Date) {
    return deadlineDate ? Math.ceil((deadlineDate.getTime() - referenceDate.getTime()) / DAY_IN_MILLISECONDS) : null;
}

function getInferredRisks(task: Task): ObligationRisk[] {
    if (task.risks?.length) return task.risks;
    const searchableText = `${task.title} ${task.description} ${task.category}`.toLowerCase();
    const risks: ObligationRisk[] = [];
    if (task.isLegal || /daň|dph|registr|úřad|zákon|smlouv|zaměstnanc|gdpr/.test(searchableText)) risks.push('fine');
    if (/faktur|plat|obrat|cashflow|pojištěn|předplatn/.test(searchableText)) risks.push('financial-loss');
    if (/domén|datov|záloh|přístup|bezpeč|schránk/.test(searchableText)) risks.push('operational-problem');
    return risks;
}

function getDeadlineReason(task: Task, daysRemaining: number | null, isOverdue: boolean) {
    if (daysRemaining === null) {
        if (/obrat.*dph/i.test(`${task.title} ${task.description}`))
            return 'Obrat se blíží hranici pro registraci k DPH.';
        return task.deadline || 'Bez konkrétního termínu.';
    }
    if (isOverdue)
        return task.title.toLowerCase().includes('faktur')
            ? `Faktura je ${Math.abs(daysRemaining)} dní po splatnosti.`
            : `${task.title} měla být provedena před ${Math.abs(daysRemaining)} dny.`;
    if (daysRemaining === 0) return 'Termín je dnes.';
    if (daysRemaining === 1) return 'Do deadline zbývá 1 den.';
    return `${task.title} je potřeba řešit do ${daysRemaining} dní.`;
}

export function calculateUrgency(task: Task, referenceDate = new Date()): UrgencyResult {
    const normalizedReferenceDate = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        referenceDate.getDate(),
    );
    const daysRemaining = getDaysRemaining(getDeadlineDate(task, normalizedReferenceDate), normalizedReferenceDate);
    const isOverdue = daysRemaining !== null && daysRemaining < 0;
    const isDueToday = daysRemaining === 0;
    const isDueThisWeek = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
    const status = task.status ?? (task.isResolved ? 'done' : 'open');
    const riskPoints = getInferredRisks(task).reduce((total, risk) => total + RISK_POINTS[risk], 0);
    const deadlinePoints =
        daysRemaining === null
            ? 0
            : isOverdue
              ? 35 + Math.min(20, Math.abs(daysRemaining) * 3)
              : daysRemaining === 0
                ? 30
                : Math.max(0, 28 - daysRemaining * 4);
    const score = Math.max(
        0,
        Math.min(100, SEVERITY_POINTS[task.severity] + STATUS_POINTS[status] + riskPoints + deadlinePoints),
    );
    const level: UrgencyLevel = score >= 75 ? 'critical' : score >= 50 ? 'burning' : score >= 25 ? 'warming' : 'calm';
    const reason =
        status === 'done' ? 'Hotovo – není potřeba další akce.' : getDeadlineReason(task, daysRemaining, isOverdue);
    return { score, level, reason, daysRemaining, isOverdue, isDueToday, isDueThisWeek };
}

export function getUrgencyLabel(level: UrgencyLevel) {
    return { calm: '🟢 V pohodě', warming: '🟡 Začíná hořet', burning: '🟠 Hoří', critical: '🔥 HOŘÍ TO!' }[level];
}

export function getDashboardTasks(tasks: Task[], referenceDate = new Date()): DashboardTask[] {
    return tasks
        .map((task) => ({ task, urgency: calculateUrgency(task, referenceDate) }))
        .sort(
            (first, second) =>
                second.urgency.score - first.urgency.score || first.task.title.localeCompare(second.task.title, 'cs'),
        );
}

export function filterDashboardTasks(items: DashboardTask[], filter: UrgencyFilter) {
    return items.filter(
        ({ task, urgency }) =>
            filter === 'all' ||
            (filter === 'burning' && !task.isResolved && urgency.score >= 50) ||
            (filter === 'today' && !task.isResolved && urgency.isDueToday) ||
            (filter === 'this-week' && !task.isResolved && urgency.isDueThisWeek) ||
            (filter === 'overdue' && !task.isResolved && urgency.isOverdue) ||
            (filter === 'done' && task.isResolved),
    );
}

export function getDashboardSummary(items: DashboardTask[]): DashboardSummary {
    return {
        burningCount: items.filter(({ task, urgency }) => !task.isResolved && urgency.score >= 50).length,
        overdueCount: items.filter(({ task, urgency }) => !task.isResolved && urgency.isOverdue).length,
        todayCount: items.filter(({ task, urgency }) => !task.isResolved && urgency.isDueToday).length,
        thisWeekCount: items.filter(({ task, urgency }) => !task.isResolved && urgency.isDueThisWeek).length,
        doneCount: items.filter(({ task }) => task.isResolved).length,
    };
}
