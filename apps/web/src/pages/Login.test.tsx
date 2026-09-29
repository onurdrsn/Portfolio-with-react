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
    expect(screen.getByPlaceholderText(/adiniz@example\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Giriş Parolası Gönder/i })).toBeInTheDocument();

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

    const emailInput = screen.getByPlaceholderText(/adiniz@example\.com/i);
    await user.type(emailInput, 'developer@onurd.com');
    await user.click(screen.getByRole('button', { name: /Giriş Parolası Gönder/i }));

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
      expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
      expect(screen.getByText(/\* Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir\./i)).toBeInTheDocument();
      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
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
    const emailInput = screen.getByPlaceholderText(/adiniz@example\.com/i);
    await user.type(emailInput, 'developer@onurd.com');
    await user.click(screen.getByRole('button', { name: /Giriş Parolası Gönder/i }));

    // Step 2: Enter code
    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('123456');
    await user.type(codeInput, '852963');
    await user.click(screen.getByRole('button', { name: /Giriş Yap/i }));

    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith('/api/auth/login-passcode', {
        email: 'developer@onurd.com',
        code: '852963',
      });
      expect(localStorage.getItem('token')).toBe('auth-jwt-token-12345');
    });
  });
});
