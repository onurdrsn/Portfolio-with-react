import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

function AuthConsumer() {
  const { user, loading, sendPasscode, loginWithPasscode, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="auth-user">{user ? user.username : 'guest'}</span>
      <button onClick={() => sendPasscode('test@user.com', 'testuser')}>Send Code</button>
      <button onClick={() => loginWithPasscode('test@user.com', '123456')}>Verify Code</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext - Passwordless OTP State & Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should restore active user session from /api/auth/me on load', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce({
      id: 'u1',
      username: 'onurdursun',
      email: 'onur@test.com',
      isAdmin: true,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-loading').textContent).toBe('loading');

    await waitFor(() => {
      expect(screen.getByTestId('auth-loading').textContent).toBe('ready');
      expect(screen.getByTestId('auth-user').textContent).toBe('onurdursun');
    });
  });

  it('should handle guest state when /api/auth/me fails', async () => {
    vi.mocked(api.apiGet).mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-loading').textContent).toBe('ready');
      expect(screen.getByTestId('auth-user').textContent).toBe('guest');
    });
  });

  it('should call sendPasscode with email and username', async () => {
    vi.mocked(api.apiGet).mockRejectedValueOnce(new Error('Unauthorized'));
    vi.mocked(api.apiPost).mockResolvedValueOnce({
      success: true,
      message: 'Code sent',
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-loading').textContent).toBe('ready');
    });

    await user.click(screen.getByText('Send Code'));

    expect(api.apiPost).toHaveBeenCalledWith('/api/auth/send-passcode', {
      email: 'test@user.com',
      username: 'testuser',
    });
  });

  it('should log in successfully with passcode and store token in localStorage', async () => {
    vi.mocked(api.apiGet).mockRejectedValueOnce(new Error('Unauthorized'));
    vi.mocked(api.apiPost).mockResolvedValueOnce({
      token: 'jwt-auth-token-xyz',
      user: { id: 'u2', username: 'verifiedUser', email: 'test@user.com', isAdmin: false },
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-loading').textContent).toBe('ready');
    });

    await user.click(screen.getByText('Verify Code'));

    expect(api.apiPost).toHaveBeenCalledWith('/api/auth/login-passcode', {
      email: 'test@user.com',
      code: '123456',
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-user').textContent).toBe('verifiedUser');
      expect(localStorage.getItem('token')).toBe('jwt-auth-token-xyz');
    });
  });

  it('should clear user session and remove token on logout', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce({
      id: 'u3',
      username: 'loggingOutUser',
      email: 'logout@test.com',
      isAdmin: false,
    });
    vi.mocked(api.apiPost).mockResolvedValueOnce({ success: true });
    localStorage.setItem('token', 'existing-token');

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-user').textContent).toBe('loggingOutUser');
    });

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-user').textContent).toBe('guest');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
