import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Mock DB store
let mockUsers: any[] = [];

vi.mock('../db', () => ({
  getDb: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue(true),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn((_cond) => ({
          limit: vi.fn((_n) => {
            // Find in mockUsers
            return mockUsers;
          }),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((val) => ({
        returning: vi.fn(() => {
          const created = { id: 'usr_new_1', ...val };
          mockUsers.push(created);
          return [created];
        }),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn((updates) => ({
        where: vi.fn((_cond) => {
          if (mockUsers.length > 0) {
            Object.assign(mockUsers[0], updates);
          }
          return Promise.resolve();
        }),
      })),
    })),
  })),
}));

// Mock Email Service
vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: 'mock_resend_id' }),
  generateOtpEmailHtml: vi.fn((name, code) => `<div>Code: ${code} for ${name}</div>`),
}));

import { authRouter } from './auth';

describe('Auth Route - Passwordless OTP & Passcode Verification', () => {
  let app: Hono<any>;
  const mockEnv = {
    DATABASE_URL: 'postgres://mock:mock@localhost/mockdb',
    JWT_SECRET: 'super-secret-jwt-key-for-testing-at-least-32-chars-long',
    RESEND_API_KEY: 're_test_key_abc',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsers = [];
    app = new Hono();
    app.route('/api/auth', authRouter);
  });

  describe('POST /api/auth/send-passcode', () => {
    it('should return 400 when email is missing', async () => {
      const res = await app.request('/api/auth/send-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }, mockEnv);

      expect(res.status).toBe(400);
      const json: any = await res.json();
      expect(json.error).toBe('Lütfen e-posta adresinizi giriniz.');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await app.request('/api/auth/send-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email-address' }),
      }, mockEnv);

      expect(res.status).toBe(400);
      const json: any = await res.json();
      expect(json.error).toBe('Geçerli bir e-posta adresi giriniz.');
    });

    it('should generate a 6-digit code and 10-minute expiry for existing user', async () => {
      const existingUser = {
        id: 'usr_1',
        email: 'onur@test.com',
        username: 'onur',
        isAdmin: true,
        tempCode: null,
        tempCodeExpiresAt: null,
      };
      mockUsers = [existingUser];

      const res = await app.request('/api/auth/send-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'onur@test.com' }),
      }, mockEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.email).toBe('onur@test.com');
      expect(json.message).toContain('10 dakika');

      // Verify the code in user mock object is 6 digits
      expect(existingUser.tempCode).toMatch(/^\d{6}$/);
      expect(existingUser.tempCodeExpiresAt).toBeInstanceOf(Date);

      // Verify 10-minute expiry window
      const diffMinutes =
        ((existingUser.tempCodeExpiresAt as any).getTime() - Date.now()) / (1000 * 60);
      expect(diffMinutes).toBeGreaterThan(9.8);
      expect(diffMinutes).toBeLessThanOrEqual(10.1);
    });

    it('should automatically provision account if user does not exist yet', async () => {
      mockUsers = [];

      const res = await app.request('/api/auth/send-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'newbie@example.com' }),
      }, mockEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.email).toBe('newbie@example.com');
      expect(mockUsers.length).toBeGreaterThan(0);
      expect(mockUsers[0].email).toBe('newbie@example.com');
    });
  });

  describe('POST /api/auth/login-passcode', () => {
    it('should return 400 when email or passcode is missing', async () => {
      const res = await app.request('/api/auth/login-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com' }),
      }, mockEnv);

      expect(res.status).toBe(400);
      const json: any = await res.json();
      expect(json.error).toBe('E-posta ve geçici parola gereklidir.');
    });

    it('should return 404 if user not found', async () => {
      mockUsers = [];

      const res = await app.request('/api/auth/login-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'unknown@test.com', code: '123456' }),
      }, mockEnv);

      expect(res.status).toBe(404);
    });

    it('should reject incorrect passcode with 401', async () => {
      mockUsers = [
        {
          id: 'usr_2',
          email: 'user@test.com',
          username: 'user2',
          isAdmin: false,
          tempCode: '654321',
          tempCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // Valid in future
        },
      ];

      const res = await app.request('/api/auth/login-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', code: '999999' }), // Wrong code
      }, mockEnv);

      expect(res.status).toBe(401);
      const json: any = await res.json();
      expect(json.error).toContain('geçersiz veya hatalı');
    });

    it('should reject expired passcode with 401 and specific expiry error message', async () => {
      mockUsers = [
        {
          id: 'usr_3',
          email: 'expired@test.com',
          username: 'expiredUser',
          isAdmin: false,
          tempCode: '112233',
          // Expired 5 minutes ago
          tempCodeExpiresAt: new Date(Date.now() - 5 * 60 * 1000),
        },
      ];

      const res = await app.request('/api/auth/login-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'expired@test.com', code: '112233' }),
      }, mockEnv);

      expect(res.status).toBe(401);
      const json: any = await res.json();
      expect(json.error).toContain('10 dakikalık geçerlilik süresi dolmuş');
    });

    it('should successfully log in with valid passcode, return JWT, and invalidate code for single-use security', async () => {
      const activeUser = {
        id: 'usr_valid',
        email: 'valid@test.com',
        username: 'validUser',
        isAdmin: true,
        tempCode: '445566',
        tempCodeExpiresAt: new Date(Date.now() + 8 * 60 * 1000),
      };
      mockUsers = [activeUser];

      const res = await app.request('/api/auth/login-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'valid@test.com', code: '445566' }),
      }, mockEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.token).toBeDefined();
      expect(typeof json.token).toBe('string');
      expect(json.user.id).toBe('usr_valid');
      expect(json.user.email).toBe('valid@test.com');
      expect(json.user.isAdmin).toBe(true);

      // Verify single-use: user tempCode must be cleared immediately in DB
      expect(activeUser.tempCode).toBeNull();
      expect(activeUser.tempCodeExpiresAt).toBeNull();

      // Verify Set-Cookie header contains token
      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain('token=');
      expect(cookieHeader).toContain('HttpOnly');
    });
  });
});
