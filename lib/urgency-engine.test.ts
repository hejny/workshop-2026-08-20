import { describe, expect, it } from 'vitest';
import { calculateUrgency, filterDashboardTasks, getDashboardSummary, getDashboardTasks } from '@/lib/urgency-engine';
import type { Task } from '@/lib/task-model';

const REFERENCE_DATE = new Date('2026-08-20T12:00:00');
const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'test-task', title: 'Zkontrolovat povinnost', description: 'Důležitá firemní položka.', category: 'Účetnictví',
    kind: 'one-time', deadline: 'Jednorázově', dueDate: '2026-08-25', severity: 'important', isResolved: false,
    note: '', responsiblePerson: '', origin: 'user', isLegal: false, ...overrides,
});

describe('urgency engine', () => {
    it('marks a missed legal deadline as critical and explains how late it is', () => {
        const result = calculateUrgency(createTask({ title: 'Registrace k dani', dueDate: '2026-08-17', severity: 'critical', isLegal: true }), REFERENCE_DATE);
        expect(result.score).toBeGreaterThanOrEqual(75);
        expect(result.isOverdue).toBe(true);
        expect(result.reason).toContain('před 3 dny');
        expect(result.level).toBe('critical');
    });

    it('includes today and the seventh day in this-week, but not the eighth day', () => {
        const today = calculateUrgency(createTask({ dueDate: '2026-08-20' }), REFERENCE_DATE);
        const lastDay = calculateUrgency(createTask({ dueDate: '2026-08-27' }), REFERENCE_DATE);
        const nextWeek = calculateUrgency(createTask({ dueDate: '2026-08-28' }), REFERENCE_DATE);
        expect(today.isDueToday).toBe(true);
        expect(today.isDueThisWeek).toBe(true);
        expect(lastDay.isDueThisWeek).toBe(true);
        expect(nextWeek.isDueThisWeek).toBe(false);
    });

    it('does not count a completed item as burning', () => {
        const task = createTask({ isResolved: true, status: 'done', dueDate: '2026-08-01', severity: 'critical' });
        const result = calculateUrgency(task, REFERENCE_DATE);
        expect(result.reason).toBe('Hotovo – není potřeba další akce.');
        expect(filterDashboardTasks(getDashboardTasks([task], REFERENCE_DATE), 'burning')).toHaveLength(0);
    });

    it('understands descriptive overdue deadlines and DPH context without an exact date', () => {
        const invoice = calculateUrgency(createTask({ title: 'Nezaplacená faktura', description: 'Hrozí finanční ztráta.', deadline: '14 dní po splatnosti', dueDate: undefined }), REFERENCE_DATE);
        const turnover = calculateUrgency(createTask({ title: 'Hlídání obratu pro DPH', description: 'Obrat se blíží hranici.', dueDate: undefined, severity: 'critical', isLegal: true }), REFERENCE_DATE);
        expect(invoice.isOverdue).toBe(true);
        expect(invoice.reason).toBe('Faktura je 14 dní po splatnosti.');
        expect(turnover.reason).toContain('DPH');
        expect(turnover.score).toBeGreaterThanOrEqual(50);
    });

    it('orders by urgency and summarizes unresolved work', () => {
        const tasks = [
            createTask({ id: 'later', title: 'Později', dueDate: '2026-09-20', severity: 'routine' }),
            createTask({ id: 'today', title: 'Dnes', dueDate: '2026-08-20', severity: 'important' }),
            createTask({ id: 'done', title: 'Hotovo', dueDate: '2026-08-01', isResolved: true, status: 'done' }),
        ];
        const dashboardTasks = getDashboardTasks(tasks, REFERENCE_DATE);
        const summary = getDashboardSummary(dashboardTasks);
        expect(dashboardTasks[0].task.id).toBe('today');
        expect(summary.todayCount).toBe(1);
        expect(summary.doneCount).toBe(1);
        expect(filterDashboardTasks(dashboardTasks, 'done').map(({ task }) => task.id)).toEqual(['done']);
    });
});
