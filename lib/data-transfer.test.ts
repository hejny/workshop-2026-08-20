import { describe, expect, it } from 'vitest';
import { createExportPayload, parseImportJson, validateImportData, type ExportPayload } from '@/lib/data-transfer';
import { DEFAULT_ONBOARDING_ANSWERS } from '@/lib/company-obligations';
import type { Task } from '@/lib/task-model';

const task: Task = {
    id: 'custom-1', title: 'Zkontrolovat doklady', description: 'Doklady za měsíc.', category: 'Účetnictví',
    kind: 'one-time', deadline: '', dueDate: '2026-08-25', severity: 'important', isResolved: false,
    note: 'Předat účetní.', responsiblePerson: 'Jana', origin: 'user', isLegal: false,
};

function validJson() { return JSON.stringify(createExportPayload([task], DEFAULT_ONBOARDING_ANSWERS)); }

describe('data transfer validation', () => {
    it('accepts a valid versioned export and preserves linked notes', () => {
        const result = parseImportJson(validJson());
        expect('payload' in result && result.payload.formatVersion).toBe(1);
        expect('payload' in result && result.payload.notes).toEqual([{ taskId: 'custom-1', text: 'Předat účetní.' }]);
    });

    it('rejects malformed JSON', () => {
        expect(parseImportJson('{not json')).toHaveProperty('error');
    });

    it('rejects missing required properties', () => {
        const data = JSON.parse(validJson()) as Record<string, unknown>;
        delete data.companyProfile;
        expect(validateImportData(data)).toHaveProperty('error');
    });

    it('rejects unsupported enum values', () => {
        const data = JSON.parse(validJson()) as ExportPayload;
        data.tasks[0].severity = 'urgent' as Task['severity'];
        expect(validateImportData(data)).toHaveProperty('error');
    });

    it('rejects incompatible export versions', () => {
        const data = JSON.parse(validJson()) as ExportPayload;
        data.formatVersion = 99;
        expect(validateImportData(data)).toHaveProperty('error');
    });

    it('rejects corrupted derived data without mutating anything', () => {
        const data = JSON.parse(validJson()) as ExportPayload;
        data.customTasks = [];
        expect(validateImportData(data)).toHaveProperty('error');
    });
});
