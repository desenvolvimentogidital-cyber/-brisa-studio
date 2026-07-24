import { studioEventBus } from './eventBus';
import { StudioIR, IRDatabaseCollection, IRApiEndpoint } from './irCompiler';

// ==========================================
// 1. DATA SCHEMA BUILDER TYPES
// ==========================================

export type FieldType =
  | 'string'
  | 'number' | 'boolean'
  | 'date'
  | 'image'
  | 'file'
  | 'array'
  | 'object'
  | 'json';

export type RelationType = 'oneToOne' | 'oneToMany' | 'manyToMany';

export interface DataField {
  name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
}

export interface DataRelation {
  name: string;
  targetCollection: string;
  type: RelationType;
  foreignKey: string;
}

export interface DataCollection {
  name: string;
  fields: DataField[];
  relations?: DataRelation[];
  indexes?: string[];
}

export interface DataSchema {
  collections: DataCollection[];
}

// ==========================================
// 2. QUERY BUILDER TYPES
// ==========================================

export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'in';
  value: any;
}

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  filters?: QueryFilter[];
  sorts?: QuerySort[];
  limit?: number;
  offset?: number;
}

// ==========================================
// 3. UNIVERSAL DATABASE ENGINE
// ==========================================

export class UniversalDatabaseEngine {
  private memoryStore: Map<string, Map<string, any>> = new Map();
  private schema: DataSchema = { collections: [] };

  constructor(initialSchema?: DataSchema) {
    if (initialSchema) {
      this.initSchema(initialSchema);
    }
  }

  initSchema(schema: DataSchema): void {
    this.schema = schema;
    schema.collections.forEach((col) => {
      if (!this.memoryStore.has(col.name)) {
        this.memoryStore.set(col.name, new Map());
        // Attempt load persistent items
        this.loadLocalCollection(col.name);
      }
    });
  }

  private loadLocalCollection(colName: string): void {
    try {
      const stored = localStorage.getItem(`studio_db_${colName}`);
      if (stored) {
        const parsed: any[] = JSON.parse(stored);
        const map = this.memoryStore.get(colName)!;
        parsed.forEach((item) => {
          if (item.id) map.set(item.id, item);
        });
      }
    } catch (e) {}
  }

  private persistCollection(colName: string): void {
    try {
      const map = this.memoryStore.get(colName);
      if (map) {
        const items = Array.from(map.values());
        localStorage.setItem(`studio_db_${colName}`, JSON.stringify(items));
      }
    } catch (e) {}
  }

  async create(collection: string, record: Record<string, any>): Promise<any> {
    if (!this.memoryStore.has(collection)) {
      this.memoryStore.set(collection, new Map());
    }

    const colMap = this.memoryStore.get(collection)!;
    const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newRecord = { ...record, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    colMap.set(id, newRecord);
    this.persistCollection(collection);

    studioEventBus.publish('DatabaseConnected', { action: 'create', collection, id });
    return newRecord;
  }

  async read(collection: string, id: string): Promise<any | null> {
    const colMap = this.memoryStore.get(collection);
    if (!colMap) return null;
    return colMap.get(id) || null;
  }

  async update(collection: string, id: string, updates: Record<string, any>): Promise<any | null> {
    const colMap = this.memoryStore.get(collection);
    if (!colMap || !colMap.has(id)) return null;

    const existing = colMap.get(id);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    colMap.set(id, updated);
    this.persistCollection(collection);

    studioEventBus.publish('DatabaseConnected', { action: 'update', collection, id });
    return updated;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const colMap = this.memoryStore.get(collection);
    if (!colMap || !colMap.has(id)) return false;

    colMap.delete(id);
    this.persistCollection(collection);

    studioEventBus.publish('DatabaseConnected', { action: 'delete', collection, id });
    return true;
  }

  async query(collection: string, options: QueryOptions = {}): Promise<any[]> {
    const colMap = this.memoryStore.get(collection);
    if (!colMap) return [];

    let results = Array.from(colMap.values());

    // 1. Filtering
    if (options.filters && options.filters.length > 0) {
      results = results.filter((item) => {
        return options.filters!.every((f) => {
          const val = item[f.field];
          switch (f.operator) {
            case '==':
              return val == f.value;
            case '!=':
              return val != f.value;
            case '>':
              return val > f.value;
            case '>=':
              return val >= f.value;
            case '<':
              return val < f.value;
            case '<=':
              return val <= f.value;
            case 'contains':
              return String(val || '').toLowerCase().includes(String(f.value).toLowerCase());
            case 'in':
              return Array.isArray(f.value) && f.value.includes(val);
            default:
              return true;
          }
        });
      });
    }

    // 2. Sorting
    if (options.sorts && options.sorts.length > 0) {
      results.sort((a, b) => {
        for (const s of options.sorts!) {
          const valA = a[s.field];
          const valB = b[s.field];
          if (valA < valB) return s.direction === 'asc' ? -1 : 1;
          if (valA > valB) return s.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // 3. Offset & Limit Pagination
    const offset = options.offset || 0;
    const limit = options.limit || results.length;
    return results.slice(offset, offset + limit);
  }

  clear(): void {
    this.memoryStore.clear();
  }
}

// ==========================================
// 4. API MANAGER & OFFLINE CACHE
// ==========================================

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeoutMs?: number;
}

export class UniversalApiManager {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private offlineQueue: { id: string; url: string; options: ApiRequestOptions }[] = [];

  async request(url: string, options: ApiRequestOptions = {}): Promise<any> {
    const method = options.method || 'GET';
    const cacheKey = `${method}_${url}_${JSON.stringify(options.params || {})}`;

    // Return unexpired cached GET response if present
    if (method === 'GET' && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() < cached.expiry) {
        return cached.data;
      }
    }

    try {
      // Proxy or mock fetch request
      let responseData: any = { status: 200, data: { success: true, url, method } };

      if (options.params) responseData.data.query = options.params;
      if (options.body) responseData.data.body = options.body;

      // Cache GET responses for 60 seconds
      if (method === 'GET') {
        this.cache.set(cacheKey, { data: responseData, expiry: Date.now() + 60000 });
      }

      studioEventBus.publish('ApiRequestFinished', { url, method, status: 200 });
      return responseData;
    } catch (err: any) {
      // Offline fallback: enqueue write operations
      if (method !== 'GET') {
        this.offlineQueue.push({ id: `item_${Date.now()}`, url, options });
      }
      throw err;
    }
  }

  getOfflineQueue() {
    return [...this.offlineQueue];
  }

  async syncOfflineQueue(): Promise<number> {
    const count = this.offlineQueue.length;
    this.offlineQueue = [];
    return count;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const universalDatabase = new UniversalDatabaseEngine();
export const universalApi = new UniversalApiManager();
