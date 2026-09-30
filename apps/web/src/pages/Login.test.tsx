import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../contexts/AuthContext';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    loading: vi.fn().mockReturnValue('toast_login_1'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Login Page - Passwordless OTP Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.apiGet).mockRejectedValue(new Error('Unauthorized'));
  });

  it('should render email input and have NO password fields on initial step', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // Email field should be present
    expect(screen.getByPlaceholderText(/(?:adiniz|example)@/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /(?:Giriş Parolası Gönder|Send Login Passcode)/i })).toBeInTheDocument();

    // Password input MUST NOT exist anywhere
    const passwordInputs = screen.queryAllByPlaceholderText(/şifre|password/i);
    expect(passwordInputs.length).toBe(0);
  });

  it('should transition to 6-digit code entry step upon submitting email', async () => {
    vi.mocked(api.apiPost).mockResolvedValueOnce({
      success: true,
      message: 'Geçici parola gönderildi',
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/(?:adiniz|example)@/i);
    await user.type(emailInput, 'developer@onurd.com');
    await user.click(screen.getByRole('button', { name: /(?:Giriş Parolası Gönder|Send Login Passcode)/i }));

    // Should call API to send passcode
    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith('/api/auth/send-passcode', {
        email: 'developer@onurd.com',
        username: undefined,
      });
    });

    // Should now show Step 2 (Passcode verification with 10-minute timer and 10-minute validity notice)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /(?:Giriş Yap|Log In)/i })).toBeInTheDocument();
      expect(screen.getByText(/\* (?:Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir|This passcode remains valid for 10 minutes)/i)).toBeInTheDocument();
      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /(?:Yeni parola için bekleyin|Wait for new passcode)/i })).toBeDisabled();
    });
  });

  it('should verify code and complete login when passcode is submitted', async () => {
    vi.mocked(api.apiPost)
      .mockResolvedValueOnce({ success: true, message: 'Code sent' })
      .mockResolvedValueOnce({
        token: 'auth-jwt-token-12345',
        user: { id: 'u_logged_in', username: 'onur', email: 'developer@onurd.com', isAdmin: true },
      });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // Step 1: Send code
    const emailInput = screen.getByPlaceholderText(/(?:adiniz|example)@/i);
    await user.type(emailInput, 'developer@onurd.com');
    await user.click(screen.getByRole('button', { name: /(?:Giriş Parolası Gönder|Send Login Passcode)/i }));

    // Step 2: Enter code
    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('123456');
    await user.type(codeInput, '852963');
    await user.click(screen.getByRole('button', { name: /(?:Giriş Yap|Log In)/i }));

    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith('/api/auth/login-passcode', {
        email: 'developer@onurd.com',
        code: '852963',
      });
      expect(localStorage.getItem('token')).toBe('auth-jwt-token-12345');
    });
  });

  it('should lock input and show lockout banner when 5 failed attempts reached (HTTP 423)', async () => {
    vi.mocked(api.apiPost)
      .mockResolvedValueOnce({ success: true, message: 'Code sent' })
      .mockRejectedValueOnce({
        status: 423,
        locked: true,
        remainingSec: 900,
        failedAttempts: 5,
        remainingAttempts: 0,
        message: '5 kez hatalı şifre girdiniz! Güvenlik sebebiyle şifre girme kilitlendi. Lütfen 15 dakika bekleyiniz.',
      });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // Step 1: Send code
    const emailInput = screen.getByPlaceholderText(/(?:adiniz|example)@/i);
    await user.type(emailInput, 'hacker@onurd.com');
    await user.click(screen.getByRole('button', { name: /(?:Giriş Parolası Gönder|Send Login Passcode)/i }));

    // Step 2: Enter wrong code
    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('123456');
    await user.type(codeInput, '000000');
    await user.click(screen.getByRole('button', { name: /(?:Giriş Yap|Log In)/i }));

    // Verification step should now be locked
    await waitFor(() => {
      expect(screen.getByText(/(?:Güvenlik Kilidi Aktif|Security Lockout Active)/i)).toBeInTheDocument();
      expect(screen.getByText(/(?:Kalan Kilit Süresi|Remaining Lockout Time): 15:00/i)).toBeInTheDocument();
      expect(codeInput).toBeDisabled();
      expect(screen.getByRole('button', { name: /(?:Giriş Yap|Log In)/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /(?:Değiştir|Change)/i })).toBeDisabled();
    });
  });
});
