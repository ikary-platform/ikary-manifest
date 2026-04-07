import type { MockRequest, MockResponse } from './types';
import type { MockEntityStore } from './MockEntityStore';

export class MockApiRouter {
  constructor(
    private store: MockEntityStore,
    private entityKey: string,
  ) {}

  dispatch(request: MockRequest): MockResponse {
    const segments = this.extractRestSegments(request.path, this.entityKey);

    if (segments.length === 0) {
      switch (request.method) {
        case 'GET':
          return this.store.list(this.parseQuery(request.query));
        case 'POST':
          return this.store.create(request.body ?? {});
        default:
          return {
            status: 405,
            body: { error: 'Method Not Allowed', message: `${request.method} not allowed on collection` },
            headers: { 'Content-Type': 'application/json' },
          };
      }
    }

    if (segments.length === 1) {
      const id = segments[0];
      switch (request.method) {
        case 'GET':
          return this.store.getById(id);
        case 'PUT':
          return this.store.update(id, request.body ?? {});
        case 'DELETE':
          return this.store.delete(id);
        default:
          return {
            status: 405,
            body: { error: 'Method Not Allowed', message: `${request.method} not allowed on item` },
            headers: { 'Content-Type': 'application/json' },
          };
      }
    }

    if (segments.length === 3 && request.method === 'POST') {
      const id = segments[0];
      const capKey = segments[2];
      return this.store.executeCapability(capKey, id, request.body ?? {});
    }

    if (segments.length === 2 && request.method === 'POST') {
      const capKey = segments[1];
      return this.store.executeCapability(capKey, null, request.body ?? {});
    }

    return {
      status: 404,
      body: { error: 'Not Found', message: 'Route not matched' },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  private parseQuery(query: Record<string, string>): {
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDir?: string;
    search?: string;
    filter?: unknown;
  } {
    let filter: unknown;
    if (query.filter) {
      try {
        filter = JSON.parse(query.filter);
      } catch {
        filter = undefined;
      }
    }

    return {
      page: parseInt(query.page, 10) || undefined,
      pageSize: parseInt(query.pageSize, 10) || undefined,
      sortField: query.sortField || undefined,
      sortDir: query.sortDir || undefined,
      search: query.search || undefined,
      filter,
    };
  }

  private extractRestSegments(path: string, entityKey: string): string[] {
    const parts = path.split('/').filter(Boolean);
    const entitiesIndex = parts.indexOf('entities');

    let entityIndex: number;
    if (entitiesIndex !== -1 && parts[entitiesIndex + 1] === entityKey) {
      entityIndex = entitiesIndex + 1;
    } else {
      entityIndex = parts.indexOf(entityKey);
    }

    if (entityIndex === -1) return [];
    return parts.slice(entityIndex + 1);
  }
}
