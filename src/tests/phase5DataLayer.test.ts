import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  UniversalDatabaseEngine,
  UniversalApiManager,
  DataSchema,
} from '../utils/dataLayer';
import { UniversalRuntime } from '../utils/universalRuntime';
import { compileNoCodeFlowToJS, NoCodeFlowRule } from '../utils/nocodeEngine';

describe('FASE 5 — Data Layer Universal & API Engine Suite', () => {
  let db: UniversalDatabaseEngine;
  let api: UniversalApiManager;
  let runtime: UniversalRuntime;

  beforeEach(() => {
    db = new UniversalDatabaseEngine();
    api = new UniversalApiManager();
    runtime = new UniversalRuntime();
  });

  it('1. Data Schema Builder & Universal DB CRUD Operations', async () => {
    const schema: DataSchema = {
      collections: [
        {
          name: 'orders',
          fields: [
            { name: 'id', type: 'string', required: true, unique: true },
            { name: 'customerName', type: 'string', required: true },
            { name: 'totalAmount', type: 'number' },
          ],
        },
      ],
    };

    db.initSchema(schema);

    // Create
    const created = await db.create('orders', {
      id: 'ord_100',
      customerName: 'Maria Silva',
      totalAmount: 250.5,
    });
    expect(created.id).toBe('ord_100');
    expect(created.customerName).toBe('Maria Silva');

    // Read
    const readItem = await db.read('orders', 'ord_100');
    expect(readItem).toBeDefined();
    expect(readItem?.totalAmount).toBe(250.5);

    // Update
    const updated = await db.update('orders', 'ord_100', { totalAmount: 300 });
    expect(updated?.totalAmount).toBe(300);

    // Delete
    const deleted = await db.delete('orders', 'ord_100');
    expect(deleted).toBe(true);

    const checkNull = await db.read('orders', 'ord_100');
    expect(checkNull).toBeNull();
  });

  it('2. Query Builder: Filtering, Sorting & Pagination', async () => {
    await db.create('products', { id: 'p1', title: 'Teclado RGB', price: 150 });
    await db.create('products', { id: 'p2', title: 'Mouse Sem Fio', price: 80 });
    await db.create('products', { id: 'p3', title: 'Monitor 4K', price: 1200 });

    // Filter price > 100
    const filtered = await db.query('products', {
      filters: [{ field: 'price', operator: '>', value: 100 }],
      sorts: [{ field: 'price', direction: 'asc' }],
    });

    expect(filtered.length).toBe(2);
    expect(filtered[0].title).toBe('Teclado RGB');
    expect(filtered[1].title).toBe('Monitor 4K');
  });

  it('3. Universal API Manager & Offline Queue Handling', async () => {
    const res = await api.request('https://api.example.com/items', { method: 'GET' });
    expect(res.status).toBe(200);

    const queueCount = await api.syncOfflineQueue();
    expect(queueCount).toBe(0);
  });

  it('4. Universal Runtime Integration with DB & API Actions', async () => {
    runtime.init();

    // Create record via Runtime
    const createRes = await runtime.executeAction({
      type: 'DATABASE_QUERY',
      params: {
        operation: 'CREATE',
        collection: 'tasks',
        record: { id: 'task_1', title: 'Refatorar Data Layer' },
      },
    });

    expect(createRes.id).toBe('task_1');

    // Query record via Runtime
    const queryRes = await runtime.executeAction({
      type: 'DATABASE_QUERY',
      params: {
        operation: 'QUERY',
        collection: 'tasks',
      },
    });

    expect(queryRes.length).toBe(1);
    expect(queryRes[0].title).toBe('Refatorar Data Layer');
  });

  it('5. No-Code Flow compilation for DB and API blocks', () => {
    const dbRule: NoCodeFlowRule = {
      id: 'rule_db_save',
      name: 'Salvar Registro',
      triggerEvent: 'onClick',
      targetComponentId: 'btnSave',
      actions: [
        {
          id: 'act_db',
          type: 'DATABASE_CREATE',
          params: { collection: 'notes', record: { title: 'Nova Nota' } },
        },
        {
          id: 'act_api',
          type: 'API_REQUEST',
          params: { url: 'https://api.notes.com/sync', method: 'POST' },
        },
      ],
    };

    const jsCode = compileNoCodeFlowToJS(dbRule);
    expect(jsCode).toContain('app.database.create("notes"');
    expect(jsCode).toContain('app.api.request("https://api.notes.com/sync"');
  });
});
