import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { AIModelStatus, AIReadinessMetrics } from '@/types/ai';

export class AIService {
  constructor(private storage: IStorageAdapter) {}

  async getReadinessMetrics(): Promise<AIReadinessMetrics> {
    const samples = await this.storage.getSamples();
    const assessments = await this.storage.getAssessments();
    const readings = await this.storage.getSensorReadings();

    const labeledSampleIds = new Set(assessments.map((a) => a.sampleId));
    const sensorSampleIds = new Set(readings.map((r) => r.sampleId));

    // Samples that have both sensor readings AND at least one manual sensory assessment
    let pairedCount = 0;
    for (const sid of labeledSampleIds) {
      if (sensorSampleIds.has(sid)) {
        pairedCount++;
      }
    }

    const minimumRequiredForTraining = 200; // Statistically sound minimum paired samples for multi-sensor electronic nose pattern recognition
    const isReadyForValidation = pairedCount >= minimumRequiredForTraining;

    // AI model state is strictly controlled. By default, it is 'Not Configured' / 'Unavailable'.
    const status: AIModelStatus = isReadyForValidation
      ? 'Ready for Validation'
      : 'Not Configured';

    const statusMessage =
      'AI prediction unavailable — insufficient validated data. Real inferencing requires an independently trained, peer-evaluated classification model and calibrated baseline sensors.';

    return {
      status,
      statusMessage,
      totalSamples: samples.length,
      labeledSamples: labeledSampleIds.size,
      sensorReadingsCount: readings.length,
      pairedSamplesCount: pairedCount,
      minimumRequiredForTraining,
      isReadyForValidation,
    };
  }

  getScientificPrinciples(): {
    title: string;
    description: string;
  }[] {
    return [
      {
        title: 'Multi-Sensor Confounding Factors',
        description:
          'Metal oxide (MOX) gas sensors inherently exhibit cross-sensitivity to relative humidity and ambient temperature fluctuations. Gas resistance alone cannot confirm spoilage without normalization against environmental baselines.',
      },
      {
        title: 'Sensory vs. Chemical Realities',
        description:
          'Human sensory evaluation (olfactory, visual, tactile) reflects organoleptic changes. Microbial spoilage producing volatile organic compounds (VOCs, alcohols, esters) follows kinetics that require GC-MS validation before autonomous classification can be deemed safe.',
      },
      {
        title: 'Zero Hallucinated Metrics',
        description:
          'In alignment with academic integrity, NoseNet will never fabricate accuracy scores, precision/recall figures, or pseudo-predictions until a real trained model is deployed.',
      },
    ];
  }
}
