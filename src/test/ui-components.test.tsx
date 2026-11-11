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

  it('encodes and decodes assessor material metadata safely within column limits', async () => {
    const { encodeAssessorMeta, decodeAssessorMeta } = await import('@/lib/sync/live-sync');
    const encoded = encodeAssessorMeta('Phone Assessor', 'wet_sponge', 30);
    expect(encoded.length).toBeLessThan(100);
    const decoded = decodeAssessorMeta(encoded);
    expect(decoded.label).toBe('Phone Assessor');
    expect(decoded.material).toBe('wet_sponge');
    expect(decoded.durationSeconds).toBe(30);

    const fallback = decodeAssessorMeta('Legacy Assessor');
    expect(fallback.material).toBe('cake');
    expect(fallback.durationSeconds).toBeNull();
  });

  it('renders ArchitecturalOutputBento with 4-tier decision matrix (hiding reading section on verdict) and live telemetry while testing', async () => {
    const { ArchitecturalOutputBento } = await import(
      '@/components/dashboard/architectural-output-bento'
    );
    const onReset = vi.fn();
    const onTryAgain = vi.fn();

    const { rerender } = render(
      <ArchitecturalOutputBento
        selectedCake="Normal Cake — Unfrozen"
        gasHistory={[40.0, 32.0]}
        collectedReadings={[
          {
            gasResistanceKohm: 40.0,
            gasResistanceOhm: 40000,
            temperatureC: 27.4,
            humidityPercent: 72,
            pressureHpa: 715,
            sensorStatus: 'OK',
            timestamp: '2026-11-11T07:00:00Z',
          },
          {
            gasResistanceKohm: 32.0,
            gasResistanceOhm: 32000,
            temperatureC: 27.6,
            humidityPercent: 86,
            pressureHpa: 715,
            sensorStatus: 'OK',
            timestamp: '2026-11-11T07:00:30Z',
          },
        ]}
        liveTest={{
          isTestRunning: true,
          selectedCakeType: 'Normal Cake — Unfrozen',
          startedAt: '2026-11-11T07:00:00Z',
          testId: 'TEST-123456',
          lastSensorReading: {
            gasResistanceKohm: 32.0,
            gasResistanceOhm: 32000,
            temperatureC: 27.6,
            humidityPercent: 86,
            pressureHpa: 715,
            sensorStatus: 'OK',
            timestamp: '2026-11-11T07:00:30Z',
          },
          sensorReadingsCount: 2,
          verdict: null,
          freshnessScore: null,
          durationSeconds: null,
          verdictSubmittedAt: null,
          assessorName: null,
        }}
        isTesting={true}
        onReset={onReset}
        onTryAgain={onTryAgain}
        isConnected={true}
      />
    );

    // While test is actively running, live telemetry readings display
    expect(screen.getAllByText('40.00 kΩ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('32.00 kΩ').length).toBeGreaterThanOrEqual(1);

    // Once verdict arrives, raw readings section is removed and 4-tier decision matrix renders
    rerender(
      <ArchitecturalOutputBento
        selectedCake="Normal Cake — Unfrozen"
        gasHistory={[40.0, 32.0]}
        collectedReadings={[
          {
            gasResistanceKohm: 40.0,
            gasResistanceOhm: 40000,
            temperatureC: 27.4,
            humidityPercent: 72,
            pressureHpa: 715,
            sensorStatus: 'OK',
            timestamp: '2026-11-11T07:00:00Z',
          },
          {
            gasResistanceKohm: 32.0,
            gasResistanceOhm: 32000,
            temperatureC: 27.6,
            humidityPercent: 86,
            pressureHpa: 715,
            sensorStatus: 'OK',
            timestamp: '2026-11-11T07:00:30Z',
          },
        ]}
        liveTest={{
          isTestRunning: false,
          selectedCakeType: 'Normal Cake — Unfrozen',
          startedAt: '2026-11-11T07:00:00Z',
          testId: 'TEST-123456',
          lastSensorReading: {
            gasResistanceKohm: 32.0,
            gasResistanceOhm: 32000,
            temperatureC: 27.6,
            humidityPercent: 86,
            pressureHpa: 715,
            sensorStatus: 'OK',
            timestamp: '2026-11-11T07:00:30Z',
          },
          sensorReadingsCount: 2,
          verdict: 'Stale',
          freshnessScore: 51.4,
          durationSeconds: 30,
          verdictSubmittedAt: '2026-11-11T07:00:30Z',
          assessorName: 'Phone Assessor|m:wet_tissue|d:30',
          materialType: 'wet_tissue',
        }}
        isTesting={false}
        onReset={onReset}
        onTryAgain={onTryAgain}
        isConnected={true}
      />
    );

    expect(screen.getAllByText('Stale').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('ACTIVE DECISION')).toBeInTheDocument();
    expect(screen.getByText(/4-Tier Decision Classification Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/hydroxyl \(OH⁻\)/i)).toBeInTheDocument();
    expect(screen.queryByText('40.00 kΩ')).not.toBeInTheDocument();
    expect(screen.queryByText('32.00 kΩ')).not.toBeInTheDocument();

    const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(tryAgainBtn);
    expect(onTryAgain).toHaveBeenCalledTimes(1);
  });
});
