import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '@/lib/storage/memory-storage-adapter';
import { createServiceContainer } from '@/services';

describe('Manual Assessment and Sensory Panel Disagreement', () => {
  let services: ReturnType<typeof createServiceContainer>;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    services = createServiceContainer(storage);
  });

  it('submits manual assessment and records assessor name, confidence, and timestamp', async () => {
    const asm = await services.assessments.submitAssessment({
      experimentId: 'EXP-001',
      sampleId: 'SMP-001',
      assessorName: 'Dr. Nair',
      assessorId: 'usr_nair',
      label: 'Fresh',
      confidenceRating: 5,
      notes: 'Strong natural vanilla aroma',
    });

    expect(asm.id).toBeDefined();
    expect(asm.label).toBe('Fresh');
    expect(asm.assessorName).toBe('Dr. Nair');
    expect(asm.confidenceRating).toBe(5);
    expect(asm.createdAt).toBeDefined();

    const stored = await services.assessments.getAssessments('SMP-001');
    expect(stored.length).toBe(1);
    expect(stored[0].label).toBe('Fresh');
  });

  it('preserves all assessments for a sample and accurately detects panel disagreement', async () => {
    // Assessor 1 votes 'Fresh'
    await services.assessments.submitAssessment({
      experimentId: 'EXP-001',
      sampleId: 'SMP-BORDERLINE',
      assessorName: 'Assessor A',
      assessorId: 'usr_a',
      label: 'Fresh',
      confidenceRating: 4,
    });

    // Assessor 2 votes 'Average'
    await services.assessments.submitAssessment({
      experimentId: 'EXP-001',
      sampleId: 'SMP-BORDERLINE',
      assessorName: 'Assessor B',
      assessorId: 'usr_b',
      label: 'Average',
      confidenceRating: 3,
    });

    // Assessor 3 votes 'Not Good'
    await services.assessments.submitAssessment({
      experimentId: 'EXP-001',
      sampleId: 'SMP-BORDERLINE',
      assessorName: 'Assessor C',
      assessorId: 'usr_c',
      label: 'Not Good',
      confidenceRating: 4,
    });

    const summary = await services.assessments.getSummaryForSample('SMP-BORDERLINE');

    // 1. All 3 assessments are preserved without overwriting
    expect(summary.totalAssessments).toBe(3);
    expect(summary.allAssessments.length).toBe(3);

    // 2. Disagreement is flagged
    expect(summary.hasDisagreement).toBe(true);
    expect(summary.distinctLabels).toContain('Fresh');
    expect(summary.distinctLabels).toContain('Average');
    expect(summary.distinctLabels).toContain('Not Good');

    // 3. Latest assessment reflects the most recently submitted one
    expect(summary.latestAssessment?.assessorName).toBe('Assessor C');
  });

  it('flags hasDisagreement as false when all assessors agree', async () => {
    await services.assessments.submitAssessment({
      experimentId: 'EXP-001',
      sampleId: 'SMP-CONSENSUS',
      assessorName: 'Assessor A',
      assessorId: 'usr_a',
      label: 'Fresh',
    });

    await services.assessments.submitAssessment({
      experimentId: 'EXP-001',
      sampleId: 'SMP-CONSENSUS',
      assessorName: 'Assessor B',
      assessorId: 'usr_b',
      label: 'Fresh',
    });

    const summary = await services.assessments.getSummaryForSample('SMP-CONSENSUS');
    expect(summary.totalAssessments).toBe(2);
    expect(summary.hasDisagreement).toBe(false);
    expect(summary.distinctLabels).toEqual(['Fresh']);
  });
});
