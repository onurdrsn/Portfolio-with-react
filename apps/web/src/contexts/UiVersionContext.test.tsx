import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UiVersionProvider, useUiVersion } from './UiVersionContext';

// Helper component to consume context
function TestConsumer() {
  const { uiVersion, setUiVersion, isLoading } = useUiVersion();
  return (
    <div>
      <span data-testid="version">{uiVersion}</span>
      <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>
      <button onClick={() => setUiVersion('v4')}>Set V4</button>
      <button onClick={() => setUiVersion('v2')}>Set V2</button>
    </div>
  );
}

describe('UiVersionContext - Flash Prevention & State Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize immediately from localStorage to prevent UI flicker/flash', () => {
    // Pre-seed localStorage with v3
    localStorage.setItem('portfolio_ui_version', 'v3');

    // Mock fetch so server request takes time
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));

    render(
      <UiVersionProvider>
        <TestConsumer />
      </UiVersionProvider>
    );

    // Context must immediately return v3 synchronously on first paint — NO flicker to v1
    expect(screen.getByTestId('version').textContent).toBe('v3');
  });

  it('should default to v1 if no version is saved in localStorage', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ uiVersion: 'v1' }),
      })
    );

    render(
      <UiVersionProvider>
        <TestConsumer />
      </UiVersionProvider>
    );

    expect(screen.getByTestId('version').textContent).toBe('v1');
  });

  it('should update state and write synchronously to localStorage when setUiVersion is called', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ uiVersion: 'v1' }),
      })
    );

    const user = userEvent.setup();

    render(
      <UiVersionProvider>
        <TestConsumer />
      </UiVersionProvider>
    );

    const btn = screen.getByText('Set V4');
    await user.click(btn);

    expect(screen.getByTestId('version').textContent).toBe('v4');
    expect(localStorage.getItem('portfolio_ui_version')).toBe('v4');
  });

  it('should sync with server settings API on load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ uiVersion: 'v4' }),
      })
    );

    await act(async () => {
      render(
        <UiVersionProvider>
          <TestConsumer />
        </UiVersionProvider>
      );
    });

    expect(screen.getByTestId('version').textContent).toBe('v4');
    expect(localStorage.getItem('portfolio_ui_version')).toBe('v4');
  });
});
