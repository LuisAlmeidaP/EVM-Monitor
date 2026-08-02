import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardSkeleton } from './DashboardSkeleton';

describe('DashboardSkeleton', () => {
  it('announces the loading state for assistive technology', () => {
    render(<DashboardSkeleton />);

    expect(screen.getByRole('status', { name: 'Cargando dashboard del proyecto' })).toBeInTheDocument();
  });
});
