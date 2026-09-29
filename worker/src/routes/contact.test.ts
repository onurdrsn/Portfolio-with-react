import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

let mockMessages: any[] = [];

vi.mock('../db', () => ({
  getDb: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue(true),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => mockMessages),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((val) => ({
        returning: vi.fn(() => {
          const item = { id: 'msg_' + Date.now(), read: false, createdAt: new Date(), ...val };
          mockMessages.push(item);
          return [item];
        }),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn((val) => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => {
            if (mockMessages[0]) Object.assign(mockMessages[0], val);
            return [mockMessages[0]];
          }),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  })),
}));

vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: 'resend_123' }),
  generateContactEmailHtml: vi.fn(() => '<div>Contact message html</div>'),
  getContactEmail: vi.fn().mockResolvedValue('owner@example.com'),
}));

// Mock requireAdmin middleware to allow pass-through
vi.mock('../middleware/auth', () => ({
  requireAdmin: async (_c: any, next: any) => await next(),
}));

import { contactRouter } from './contact';

describe('Contact Route - Message Submission & Admin Management', () => {
  let app: Hono<any>;
  const mockEnv = {
    DATABASE_URL: 'postgres://mock:mock@localhost/mockdb',
    RESEND_API_KEY: 're_test_contact_key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMessages = [];
    app = new Hono();
    app.route('/api/contact', contactRouter);
  });

  describe('POST /api/contact', () => {
    it('should return 400 when name, email, or message is missing', async () => {
      const res = await app.request('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ali', email: '' }),
      }, mockEnv);

      expect(res.status).toBe(400);
      const json: any = await res.json();
      expect(json.error).toContain('Lütfen tüm alanları');
    });

    it('should return 400 when email format is invalid', async () => {
      const res = await app.request('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ali', email: 'notanemail', message: 'Hello!' }),
      }, mockEnv);

      expect(res.status).toBe(400);
      const json: any = await res.json();
      expect(json.error).toBe('Geçerli bir e-posta adresi giriniz.');
    });

    it('should save message to DB and return 201 on valid submission', async () => {
      const res = await app.request('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Selin Demir',
          email: 'selin@company.com',
          message: 'Yeni bir React projesi geliştirmek istiyoruz.',
        }),
      }, mockEnv);

      expect(res.status).toBe(201);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Mesajınız başarıyla gönderildi');
      expect(mockMessages.length).toBe(1);
      expect(mockMessages[0].name).toBe('Selin Demir');
      expect(mockMessages[0].email).toBe('selin@company.com');
    });
  });

  describe('GET /api/contact', () => {
    it('should list all contact messages', async () => {
      mockMessages = [
        { id: '1', name: 'User 1', email: 'u1@test.com', message: 'Hi' },
        { id: '2', name: 'User 2', email: 'u2@test.com', message: 'Hello' },
      ];

      const res = await app.request('/api/contact', { method: 'GET' }, mockEnv);
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2);
    });
  });

  describe('PATCH /api/contact/:id/read', () => {
    it('should mark message as read', async () => {
      mockMessages = [{ id: 'msg_10', read: false, name: 'Test' }];

      const res = await app.request('/api/contact/msg_10/read', { method: 'PATCH' }, mockEnv);
      expect(res.status).toBe(200);
      expect(mockMessages[0].read).toBe(true);
    });
  });

  describe('DELETE /api/contact/:id', () => {
    it('should delete a message successfully', async () => {
      const res = await app.request('/api/contact/msg_10', { method: 'DELETE' }, mockEnv);
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
