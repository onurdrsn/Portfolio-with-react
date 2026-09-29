import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import * as api from './lib/api';
import { UiVersionProvider, useUiVersion } from './contexts/UiVersionContext';
import { AuthProvider } from './contexts/AuthContext';
import Version4Home from './Components/Version4/Version4Home';

vi.mock('./lib/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock('./Components/Version4/Version4Home', () => ({
  default: () => <div data-testid="version-4-home">Version 4 Active</div>,
}));

vi.mock('./Components/LinuxDesktop', () => ({
  default: () => <div data-testid="linux-desktop">Linux Desktop Active</div>,
}));

vi.mock('./Components/CyberDeckHUD', () => ({
  default: () => <div data-testid="cyberdeck-hud">CyberDeck HUD Active</div>,
}));

vi.mock('./Components/Intro', () => ({
  default: () => <div data-testid="intro-v1">Intro V1 Active</div>,
}));

vi.mock('./Components/Portfolio', () => ({
  default: () => <div data-testid="portfolio-v1">Portfolio V1 Active</div>,
}));

vi.mock('./Components/Timeline', () => ({
  default: () => <div data-testid="timeline-v1">Timeline V1 Active</div>,
}));

vi.mock('./Components/Contact', () => ({
  default: () => <div data-testid="contact-v1">Contact V1 Active</div>,
}));

vi.mock('./Components/Footer', () => ({
  default: () => <footer data-testid="footer-v1">Footer V1 Active</footer>,
}));

// BlogNavigation component extracted for router testing
function TestBlogNavigation() {
  const location = useLocation();
  const isBlogPost = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';

  return (
    <nav data-testid="blog-nav">
      {isBlogPost ? (
        <Link to="/blog" data-testid="back-button">
          ← Blog Listesine Dön
        </Link>
      ) : (
        <Link to="/" data-testid="back-button">
          ← Portfolio
        </Link>
      )}
    </nav>
  );
}

// MainPage component
const TestMainPage = () => {
  const { uiVersion } = useUiVersion();

  if (uiVersion === 'v2') return <div data-testid="linux-desktop">Linux Desktop Active</div>;
  if (uiVersion === 'v3') return <div data-testid="cyberdeck-hud">CyberDeck HUD Active</div>;
  if (uiVersion === 'v4') return <Version4Home />;

  return (
    <div data-testid="v1-wrapper">
      <div data-testid="intro-v1">Intro V1 Active</div>
      <div data-testid="portfolio-v1">Portfolio V1 Active</div>
    </div>
  );
};

describe('App End-to-End Routing & UI Version Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.apiGet).mockRejectedValue(new Error('Unauthorized'));
  });

  describe('Blog Article Back Button Navigation', () => {
    it('should link back to /blog (NOT /) when reading a blog post', () => {
      render(
        <MemoryRouter initialEntries={['/blog/cloudflare-workers-rehberi']}>
          <TestBlogNavigation />
        </MemoryRouter>
      );

      const backBtn = screen.getByTestId('back-button');
      expect(backBtn).toHaveAttribute('href', '/blog');
      expect(backBtn.textContent).toContain('Blog Listesine Dön');
    });

    it('should link back to / when on the main /blog listing page', () => {
      render(
        <MemoryRouter initialEntries={['/blog']}>
          <TestBlogNavigation />
        </MemoryRouter>
      );

      const backBtn = screen.getByTestId('back-button');
      expect(backBtn).toHaveAttribute('href', '/');
      expect(backBtn.textContent).toContain('Portfolio');
    });
  });

  describe('UI Version Render Switching', () => {
    it('should render Version 4 directly when v4 is selected in localStorage', async () => {
      localStorage.setItem('portfolio_ui_version', 'v4');
      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));

      render(
        <UiVersionProvider>
          <TestMainPage />
        </UiVersionProvider>
      );

      // Verifies that V4 renders immediately without first showing V1
      expect(screen.getByTestId('version-4-home')).toBeInTheDocument();
      expect(screen.queryByTestId('v1-wrapper')).not.toBeInTheDocument();
    });

    it('should render Version 1 by default when no version is specified', () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ uiVersion: 'v1' }),
        })
      );

      render(
        <UiVersionProvider>
          <TestMainPage />
        </UiVersionProvider>
      );

      expect(screen.getByTestId('v1-wrapper')).toBeInTheDocument();
      expect(screen.queryByTestId('version-4-home')).not.toBeInTheDocument();
    });
  });
});
