import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Portfolio from './Portfolio';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

const mockProjects = [
  {
    id: 'proj_1',
    title: 'Cyber Strike 3D Game',
    description: 'An interactive 3D browser space combat game',
    category: 'Game Dev',
    featured: true,
    showOnHome: true,
    stack: ['Three.js', 'React', 'WebAudio'],
    link: 'https://cyberstrike.game',
    github: 'https://github.com/onur/cyberstrike',
  },
  {
    id: 'proj_2',
    title: 'Cloudflare AI Neural Gateway',
    description: 'Ultra-fast edge proxy for LLM routing',
    category: 'AI',
    featured: true,
    showOnHome: true,
    stack: ['Cloudflare Workers', 'Hono', 'TypeScript'],
    link: 'https://neural.gateway',
    github: 'https://github.com/onur/gateway',
  },
  {
    id: 'proj_hidden',
    title: 'Secret Internal Dashboard',
    description: 'Private administration panel not for public home',
    category: 'Full Stack',
    featured: true,
    showOnHome: false, // HIDDEN FROM HOME
    stack: ['Internal', 'Admin'],
  },
];

describe('Portfolio Component - Mobile Touch Swipe & showOnHome Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render public project on load and hide projects where showOnHome === false', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockProjects);

    render(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Cyber Strike 3D Game')).toBeInTheDocument();
    });

    // Secret Internal Dashboard should NEVER be rendered on homepage
    expect(screen.queryByText('Secret Internal Dashboard')).not.toBeInTheDocument();
  });

  it('should handle mobile touch swipe left to advance to next featured project', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockProjects);

    const { container } = render(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Cyber Strike 3D Game')).toBeInTheDocument();
    });

    // Find the deck container with touch handlers
    const deckContainer = container.querySelector('[style*="pan-y"]');
    expect(deckContainer).not.toBeNull();

    // Simulate touch swipe left (start clientX: 300, end clientX: 100 -> deltaX: 200 > 40)
    fireEvent.touchStart(deckContainer, {
      touches: [{ clientX: 300, clientY: 200 }],
    });
    fireEvent.touchEnd(deckContainer, {
      changedTouches: [{ clientX: 100, clientY: 200 }],
    });

    // Now active slide should be the second project (Cloudflare AI Neural Gateway)
    await waitFor(() => {
      expect(screen.getByText('Cloudflare AI Neural Gateway')).toBeInTheDocument();
    });
  });

  it('should ignore vertical swipe and not change slide index', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockProjects);

    const { container } = render(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Cyber Strike 3D Game')).toBeInTheDocument();
    });

    const deckContainer = container.querySelector('[style*="pan-y"]');

    // Simulate vertical scroll: deltaY (300) > deltaX (10)
    fireEvent.touchStart(deckContainer, {
      touches: [{ clientX: 200, clientY: 500 }],
    });
    fireEvent.touchEnd(deckContainer, {
      changedTouches: [{ clientX: 190, clientY: 200 }],
    });

    // First project should still be the active slide
    expect(screen.getByText('Cyber Strike 3D Game')).toBeInTheDocument();
  });

  it('should switch between Deck and Grid view mode and show multiple projects', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockProjects);
    const user = userEvent.setup();

    render(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Cyber Strike 3D Game')).toBeInTheDocument();
    });

    // Find Grid view toggle button by text or icon
    const gridButtons = screen.getAllByRole('button');
    const bentoGridBtn = gridButtons.find(b => b.textContent && b.textContent.includes('Bento Grid'));
    expect(bentoGridBtn).toBeDefined();

    await user.click(bentoGridBtn);

    // Both visible projects should now be simultaneously visible in grid
    await waitFor(() => {
      expect(screen.getByText('Cyber Strike 3D Game')).toBeInTheDocument();
      expect(screen.getByText('Cloudflare AI Neural Gateway')).toBeInTheDocument();
    });

    // Hidden item remains excluded
    expect(screen.queryByText('Secret Internal Dashboard')).not.toBeInTheDocument();
  });
});
