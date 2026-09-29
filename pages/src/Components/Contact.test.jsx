import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  apiPost: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    loading: vi.fn().mockReturnValue('toast_id_1'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Contact Component - Form Submission to /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields for name, email, and message', () => {
    render(<Contact />);

    expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@example\.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tell me about your project|Projenizden/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Send Message|Gönder/i })
    ).toBeInTheDocument();
  });

  it('should submit form data to /api/contact and reset form on success', async () => {
    vi.mocked(api.apiPost).mockResolvedValueOnce({
      success: true,
      message: 'Mesajınız başarıyla iletildi!',
    });

    const user = userEvent.setup();
    render(<Contact />);

    const nameInput = screen.getByPlaceholderText(/John Doe/i);
    const emailInput = screen.getByPlaceholderText(/john@example\.com/i);
    const messageInput = screen.getByPlaceholderText(
      /Tell me about your project|Projenizden/i
    );
    const submitBtn = screen.getByRole('button', { name: /Send Message|Gönder/i });

    await user.type(nameInput, 'Berk Yılmaz');
    await user.type(emailInput, 'berk@example.com');
    await user.type(messageInput, 'Mobil uygulama için teklif almak istiyoruz.');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith('/api/contact', {
        name: 'Berk Yılmaz',
        email: 'berk@example.com',
        message: 'Mobil uygulama için teklif almak istiyoruz.',
      });
    });

    // Form inputs should be reset
    expect(nameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(messageInput).toHaveValue('');
  });
});
