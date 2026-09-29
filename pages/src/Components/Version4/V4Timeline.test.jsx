import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import V4Timeline from './V4Timeline';
import * as api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiGet: vi.fn(),
}));

const mockTimeline = [
  {
    id: 't1',
    title: 'Lead Full Stack Architect',
    company: 'Cloud Scale Inc.',
    year: '2024 - Present',
    duration: '2 Yıl',
    details: ['Designed edge microservices handling 50k requests/second.'],
  },
  {
    id: 't2',
    title: 'Senior Software Engineer',
    company: 'Tech Solutions',
    year: '2022 - 2024',
    duration: '2 Yıl',
    details: ['Implemented distributed WebSocket infrastructure.'],
  },
];

describe('V4Timeline Component - Career Milestones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render timeline entries fetched from API', async () => {
    vi.mocked(api.apiGet).mockResolvedValueOnce(mockTimeline);

    render(<V4Timeline />);

    await waitFor(() => {
      expect(screen.getByText('Lead Full Stack Architect')).toBeInTheDocument();
      expect(screen.getByText('Cloud Scale Inc.')).toBeInTheDocument();
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
      expect(screen.getByText(/Designed edge microservices/i)).toBeInTheDocument();
    });
  });
});
