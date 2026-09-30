import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import V4BentoGrid from './V4BentoGrid';

describe('V4BentoGrid Component - System Capabilities Matrix', () => {
  it('should render all core architecture capability cards', () => {
    render(<V4BentoGrid />);

    expect(screen.getByRole('heading', { name: 'Cloudflare Edge & Serverless' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Realtime WebSocket Hub' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI & Neural Vector Intelligence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Neon Serverless Postgres & Drizzle' })).toBeInTheDocument();

    // Badges
    expect(screen.getByText('< 15ms Latency')).toBeInTheDocument();
    expect(screen.getByText('Zero Cold Start')).toBeInTheDocument();
  });
});
