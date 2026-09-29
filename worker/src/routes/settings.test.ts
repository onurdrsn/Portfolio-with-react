import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

const mockSettings = new Map<string, string>();

vi.mock('../db', () => ({
  getDb: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue(true),
    select: vi.fn(() => ({
      from: vi.fn(() => {
        return Array.from(mockSettings.entries()).map(([key, value]) => ({ key, value }));
      }),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((val) => ({
        onConflictDoUpdate: vi.fn(({ set }) => {
          mockSettings.set(val.key, set.value || val.value);
          return Promise.resolve();
        }),
      })),
    })),
  })),
}));

vi.mock('../middleware/auth', () => ({
  requireAdmin: async (_c: any, next: any) => await next(),
}));

import { registerSettingsRoutes } from './settings';

describe('Settings Route - UI Version & Config Management', () => {
  let app: Hono<any>;
  const mockEnv = {
    DATABASE_URL: 'postgres://mock:mock@localhost/mockdb',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.clear();
    app = new Hono();
    registerSettingsRoutes(app);
  });

  describe('GET /api/settings', () => {
    it('should default uiVersion to v1 when no settings exist', async () => {
      const res = await app.request('/api/settings', { method: 'GET' }, mockEnv);
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.uiVersion).toBe('v1');
    });

    it('should return stored settings from database', async () => {
      mockSettings.set('uiVersion', 'v4');
      mockSettings.set('contact_email', 'admin@onurd.com');

      const res = await app.request('/api/settings', { method: 'GET' }, mockEnv);
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.uiVersion).toBe('v4');
      expect(json.contact_email).toBe('admin@onurd.com');
    });
  });

  describe('PUT /api/settings', () => {
    it('should reject invalid uiVersion with 400', async () => {
      const res = await app.request('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uiVersion: 'v99' }),
      }, mockEnv);

      expect(res.status).toBe(400);
      const json: any = await res.json();
      expect(json.error).toContain("Must be 'v1', 'v2', 'v3', or 'v4'");
    });

    it('should successfully update uiVersion to v4', async () => {
      const res = await app.request('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uiVersion: 'v4' }),
      }, mockEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.uiVersion).toBe('v4');
      expect(mockSettings.get('uiVersion')).toBe('v4');
    });

    it('should update other arbitrary configuration settings', async () => {
      const res = await app.request('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uiVersion: 'v2',
          resend_api_key: 're_custom_production_key',
          contact_email: 'newowner@test.com',
        }),
      }, mockEnv);

      expect(res.status).toBe(200);
      expect(mockSettings.get('uiVersion')).toBe('v2');
      expect(mockSettings.get('resend_api_key')).toBe('re_custom_production_key');
      expect(mockSettings.get('contact_email')).toBe('newowner@test.com');
    });
  });
});
