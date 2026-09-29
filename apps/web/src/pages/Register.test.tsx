import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { AuthProvider } from '../contexts/AuthContext';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    loading: vi.fn().mockReturnValue('toast_reg_1'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Register Page - Passwordless Account Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.apiGet).mockRejectedValue(new Error('Unauthorized'));
  });

  it('should render username and email input with no password fields', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('kullanici_adi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/adiniz@example\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Geçici Parola İle Kayıt Ol/i })).toBeInTheDocument();

    // Verify absence of password fields
    const passwordInputs = screen.queryAllByPlaceholderText(/şifre|password/i);
    expect(passwordInputs.length).toBe(0);
  });

  it('should transition to code verification and show 10-minute validity notice', async () => {
    vi.mocked(api.apiPost).mockResolvedValueOnce({
      success: true,
      message: 'Geçici parolanız gönderildi',
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText('kullanici_adi'), 'ahmet_dev');
    await user.type(screen.getByPlaceholderText(/adiniz@example\.com/i), 'ahmet@dev.com');
    await user.click(screen.getByRole('button', { name: /Geçici Parola İle Kayıt Ol/i }));

    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith('/api/auth/send-passcode', {
        email: 'ahmet@dev.com',
        username: 'ahmet_dev',
      });
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Hesabı Onayla ve Giriş Yap/i })).toBeInTheDocument();
      expect(screen.getByText(/\* Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir\./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Yeni parola için bekleyin/i })).toBeDisabled();
    });
  });
});
