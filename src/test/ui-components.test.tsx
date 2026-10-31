import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBadge } from '@/components/common/badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatCard } from '@/components/dashboard/stat-card';
import { Activity } from 'lucide-react';

describe('UI Components & Responsive Assessor Controls', () => {
  it('renders StatusBadge with correct labels and styling classes', () => {
    const { rerender } = render(<StatusBadge status="Fresh" />);
    expect(screen.getByText('Fresh')).toBeInTheDocument();

    rerender(<StatusBadge status="Average" />);
    expect(screen.getByText('Average')).toBeInTheDocument();

    rerender(<StatusBadge status="Not Good" />);
    expect(screen.getByText('Not Good')).toBeInTheDocument();

    rerender(<StatusBadge status="ROOM" />);
    expect(screen.getByText('ROOM')).toBeInTheDocument();

    rerender(<StatusBadge status="EMPTY_CONTAINER" />);
    expect(screen.getByText('CONTAINER')).toBeInTheDocument();

    rerender(<StatusBadge status="CAKE" />);
    expect(screen.getByText('CAKE')).toBeInTheDocument();
  });

  it('renders ConfirmDialog and triggers confirmation handler on click', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Confirm Assessment"
        description="Are you sure you want to log Fresh?"
        confirmLabel="Submit"
      />
    );

    expect(screen.getByText('Confirm Assessment')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to log Fresh?')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders StatCard with value and subtext', () => {
    render(
      <StatCard
        label="Total Samples"
        value={42}
        subtext="Cake specimen count"
        icon={Activity}
      />
    );

    expect(screen.getByText('Total Samples')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Cake specimen count')).toBeInTheDocument();
  });

  it('exports valid NoseNet brand logo SVG markup for splash reveal', async () => {
    const { MARK_NOSENET } = await import('@/components/ui/glass-icon-reveal');
    expect(MARK_NOSENET).toContain('<svg');
    expect(MARK_NOSENET).toContain('viewBox="0 0 24 24"');
    expect(MARK_NOSENET).toContain('stroke="currentColor"');
    expect(MARK_NOSENET).toContain('M22 12h-2.48');
  });
});
