import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import V4Hero from './V4Hero';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}));

describe('V4Hero Component - Cyber Interactive Hero Section', () => {
  let writeTextMock;

  beforeEach(() => {
    vi.clearAllMocks();
    writeTextMock = vi.fn().mockImplementation(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
  });

  it('should render name heading and availability beacon', () => {
    render(<V4Hero />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Onur Dursun/i);
    expect(screen.getByText(/2026 v4/i)).toBeInTheDocument();
  });

  it('should copy email to clipboard and update button state on click', async () => {
    render(<V4Hero />);

    const copyBtn = screen.getByRole('button', { name: /onurdrsn55@gmail\.com/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('onurdrsn55@gmail.com');
    expect(screen.getByText(/Kopyalandı!|Copied!/i)).toBeInTheDocument();
  });

  it('should toggle between architecture, stack, and health terminal tabs', () => {
    render(<V4Hero />);

    // Default tab is Architecture
    expect(screen.getByText('Architecture.ts')).toBeInTheDocument();
    expect(screen.getByText(/Edge Cloud Architecture 2026/i)).toBeInTheDocument();

    // Click Stack.json tab
    fireEvent.click(screen.getByRole('button', { name: /Stack\.json/i }));
    expect(screen.getByText(/"Hono.js"/i)).toBeInTheDocument();
    expect(screen.getByText(/"Cloudflare Workers"/i)).toBeInTheDocument();

    // Click Health.sh tab
    fireEvent.click(screen.getByRole('button', { name: /Health\.sh/i }));
    expect(screen.getByText(/portfolio-worker\.onurd\.com\.tr\/api\/health/i)).toBeInTheDocument();
  });
});
