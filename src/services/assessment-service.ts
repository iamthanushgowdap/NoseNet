import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { ManualAssessment, SampleAssessmentSummary } from '@/types/assessment';
import { CreateAssessmentInputSchema } from '@/lib/validation/assessment.schema';
import { generateId } from '@/lib/utils';
import Papa from 'papaparse';

export class AssessmentService {
  constructor(private storage: IStorageAdapter) {}

  async getAssessments(sampleId?: string, experimentId?: string): Promise<ManualAssessment[]> {
    let list = await this.storage.getAssessments();
    if (sampleId) {
      list = list.filter((a) => a.sampleId === sampleId);
    }
    if (experimentId) {
      list = list.filter((a) => a.experimentId === experimentId);
    }
    return [...list].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (diff !== 0) return diff;
      return list.indexOf(b) - list.indexOf(a);
    });
  }

  async submitAssessment(input: unknown): Promise<ManualAssessment> {
    const validated = CreateAssessmentInputSchema.parse(input);
    const list = await this.storage.getAssessments();

    const assessment: ManualAssessment = {
      id: generateId('asm'),
      experimentId: validated.experimentId,
      sampleId: validated.sampleId,
      assessorName: validated.assessorName,
      assessorId: validated.assessorId,
      label: validated.label,
      confidenceRating: validated.confidenceRating ?? 4,
      notes: validated.notes || '',
      createdAt: new Date().toISOString(),
    };

    list.push(assessment);
    await this.storage.saveAssessments(list);
    return assessment;
  }

  async getSummaryForSample(sampleId: string): Promise<SampleAssessmentSummary> {
    const allForSample = await this.getAssessments(sampleId);
    const distinctLabels = Array.from(new Set(allForSample.map((a) => a.label)));

    return {
      sampleId,
      totalAssessments: allForSample.length,
      latestAssessment: allForSample.length > 0 ? allForSample[0] : undefined,
      hasDisagreement: distinctLabels.length > 1,
      distinctLabels,
      allAssessments: allForSample,
    };
  }

  async getAllSummaries(): Promise<Record<string, SampleAssessmentSummary>> {
    const all = await this.storage.getAssessments();
    const map: Record<string, ManualAssessment[]> = {};

    for (const a of all) {
      if (!map[a.sampleId]) map[a.sampleId] = [];
      map[a.sampleId].push(a);
    }

    const summaries: Record<string, SampleAssessmentSummary> = {};
    for (const [sampleId, list] of Object.entries(map)) {
      list.sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (diff !== 0) return diff;
        return map[sampleId].indexOf(b) - map[sampleId].indexOf(a);
      });
      const distinct = Array.from(new Set(list.map((a) => a.label)));
      summaries[sampleId] = {
        sampleId,
        totalAssessments: list.length,
        latestAssessment: list[0],
        hasDisagreement: distinct.length > 1,
        distinctLabels: distinct,
        allAssessments: list,
      };
    }

    return summaries;
  }

  exportToCsv(assessments: ManualAssessment[]): string {
    const rows = assessments.map((a) => ({
      assessment_id: a.id,
      experiment_id: a.experimentId,
      sample_id: a.sampleId,
      assessor_name: a.assessorName,
      assessor_id: a.assessorId,
      label: a.label,
      confidence_rating: a.confidenceRating ?? '',
      notes: a.notes ?? '',
      created_at: a.createdAt,
    }));

    return Papa.unparse(rows);
  }
}
