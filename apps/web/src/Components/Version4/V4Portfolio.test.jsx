import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import V4Portfolio from './V4Portfolio';
import * as api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiGet: vi.fn(),
}));

const mockProjects = [
  {
    id: 'p1',
    title: 'Distributed Neural Cluster',
    description: 'Autonomous multi-agent cluster orchestrator',
    category: 'AI',
    featured: true,
    showOnHome: true,
    stack: ['Rust', 'WebAssembly', 'Workers'],
  },
  {
    id: 'p2',
    title: 'Edge Stream Video Engine',
    description: 'Global low latency video streaming matrix',
    category: 'Full Stack',
    featured: true,
    showOnHome: true,
    stack: ['Cloudflare Calls', 'WebRTC'],
  },
  {
    id: 'p_hidden',
    title: 'Secret Backdoor Prototype',
    description: 'Private unreleased system',
    category: 'AI',
    featured: true,
    showOnHome: false, // EXCLUDED FROM HOME
    stack: ['Secret'],
  },
];

describe('V4Portfolio Component - Mobile Swipe & Filter Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render active project and hide projects where showOnHome === false', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockProjects);

    render(<V4Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Distributed Neural Cluster')).toBeInTheDocument();
    });

    expect(screen.queryByText('Secret Backdoor Prototype')).not.toBeInTheDocument();
  });

  it('should advance slide on mobile touch swipe left', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockProjects);

    const { container } = render(<V4Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Distributed Neural Cluster')).toBeInTheDocument();
    });

    const swipeZone = container.querySelector('[style*="pan-y"]');
    expect(swipeZone).not.toBeNull();

    // Swipe left (deltaX: 180 > 40)
    fireEvent.touchStart(swipeZone, {
      touches: [{ clientX: 280, clientY: 100 }],
    });
    fireEvent.touchEnd(swipeZone, {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    });

    await waitFor(() => {
      expect(screen.getByText('Edge Stream Video Engine')).toBeInTheDocument();
    });
  });

  it('should filter projects using search query', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockProjects);
    const user = userEvent.setup();

    render(<V4Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Distributed Neural Cluster')).toBeInTheDocument();
    });

    // Switch to grid view
    const buttons = screen.getAllByRole('button');
    const gridBtn = buttons.find(b => b.textContent && b.textContent.includes('Bento Grid'));
    if (gridBtn) await user.click(gridBtn);

    const searchInput = screen.getByPlaceholderText(/Proje veya teknoloji ara|Search project or technology/i);
    await user.type(searchInput, 'Neural');

    expect(screen.getAllByText('Distributed Neural Cluster').length).toBeGreaterThanOrEqual(1);
  });
});
