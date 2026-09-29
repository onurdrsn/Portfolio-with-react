import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

let mockPortfolioItems: any[] = [];

vi.mock('../db', () => ({
  getDb: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue(true),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => mockPortfolioItems),
        where: vi.fn((_cond) => ({
          limit: vi.fn(() => mockPortfolioItems.slice(0, 1)),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((val) => ({
        returning: vi.fn(() => {
          const item = { id: 'proj_' + Date.now(), ...val };
          mockPortfolioItems.push(item);
          return [item];
        }),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn((updates) => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => {
            if (mockPortfolioItems[0]) {
              Object.assign(mockPortfolioItems[0], updates);
            }
            return [mockPortfolioItems[0]];
          }),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  })),
}));

vi.mock('../middleware/auth', () => ({
  requireAdmin: async (_c: any, next: any) => await next(),
}));

import { registerPortfolioRoutes } from './portfolio';

describe('Portfolio Route - Projects & showOnHome Visibility', () => {
  let app: Hono<any>;
  const mockEnv = {
    DATABASE_URL: 'postgres://mock:mock@localhost/mockdb',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPortfolioItems = [];
    app = new Hono();
    registerPortfolioRoutes(app);
  });

  describe('GET /api/portfolio', () => {
    it('should return list of portfolio items', async () => {
      mockPortfolioItems = [
        { id: '1', title: 'Cyber Strike 3D', showOnHome: true },
        { id: '2', title: 'Internal Tool', showOnHome: false },
      ];

      const res = await app.request('/api/portfolio', { method: 'GET' }, mockEnv);
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2);
    });
  });

  describe('POST /api/portfolio', () => {
    it('should return 400 when title or description is missing', async () => {
      const res = await app.request('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Just a title' }), // Missing description
      }, mockEnv);

      expect(res.status).toBe(400);
      const json: any = await res.json();
      expect(json.error).toBe('Title and description are required');
    });

    it('should create project with showOnHome defaulting to true if not specified', async () => {
      const res = await app.request('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Full Stack Platform',
          description: 'High-performance edge portfolio platform',
          category: 'Full Stack',
        }),
      }, mockEnv);

      expect(res.status).toBe(201);
      const json: any = await res.json();
      expect(json.title).toBe('Full Stack Platform');
      expect(json.showOnHome).toBe(true);
    });

    it('should respect showOnHome = false when explicitly provided', async () => {
      const res = await app.request('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Hidden Architecture Lab',
          description: 'Experimental laboratory project',
          showOnHome: false,
        }),
      }, mockEnv);

      expect(res.status).toBe(201);
      const json: any = await res.json();
      expect(json.showOnHome).toBe(false);
    });
  });

  describe('PATCH /api/portfolio/:id/toggle-home', () => {
    it('should toggle showOnHome from true to false', async () => {
      mockPortfolioItems = [
        {
          id: 'proj_toggle',
          title: 'Awesome App',
          showOnHome: true,
        },
      ];

      const res = await app.request('/api/portfolio/proj_toggle/toggle-home', {
        method: 'PATCH',
      }, mockEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.showOnHome).toBe(false);
    });
  });
});
