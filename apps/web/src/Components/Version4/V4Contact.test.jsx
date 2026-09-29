import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import V4Contact from './V4Contact';
import * as api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiPost: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    loading: vi.fn().mockReturnValue('toast_v4_1'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('V4Contact Component - Contact Form & i18n Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields for name, email, and message', () => {
    render(<V4Contact />);

    expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@example\.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tell me about your project|Projeniz veya sorunuz/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Send Message|Mesajı İlet/i })
    ).toBeInTheDocument();
  });

  it('should submit form data to /api/contact and show success state', async () => {
    vi.mocked(api.apiPost).mockResolvedValueOnce({
      success: true,
      message: 'Mesajınız başarıyla iletildi!',
    });

    const user = userEvent.setup();
    render(<V4Contact />);

    const nameInput = screen.getByPlaceholderText(/John Doe/i);
    const emailInput = screen.getByPlaceholderText(/john@example\.com/i);
    const messageInput = screen.getByPlaceholderText(
      /Tell me about your project|Projeniz veya sorunuz/i
    );
    const submitBtn = screen.getByRole('button', { name: /Send Message|Mesajı İlet/i });

    await user.type(nameInput, 'Alex Turner');
    await user.type(emailInput, 'alex@turner.com');
    await user.type(messageInput, 'Need architecture review for edge workers.');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith('/api/contact', {
        name: 'Alex Turner',
        email: 'alex@turner.com',
        message: 'Need architecture review for edge workers.',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Message Received!|Mesajınız Alındı!/i)).toBeInTheDocument();
    });
  });
});
