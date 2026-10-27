import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { Experiment, ExperimentStatus, ControlRunMetadata } from '@/types/experiment';
import { CreateExperimentInputSchema } from '@/lib/validation/experiment.schema';

export class ExperimentService {
  constructor(private storage: IStorageAdapter) {}

  async getExperiments(): Promise<Experiment[]> {
    const list = await this.storage.getExperiments();
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getExperimentById(id: string): Promise<Experiment | null> {
    const list = await this.storage.getExperiments();
    return list.find((exp) => exp.id === id) || null;
  }

  async createExperiment(input: unknown): Promise<Experiment> {
    const validated = CreateExperimentInputSchema.parse(input);
    const list = await this.storage.getExperiments();

    const id = validated.id?.trim() || `EXP-${String(list.length + 1).padStart(3, '0')}`;
    if (list.some((e) => e.id.toLowerCase() === id.toLowerCase())) {
      throw new Error(`Experiment ID "${id}" already exists. Please choose a unique ID.`);
    }

    const now = new Date().toISOString();
    const newExperiment: Experiment = {
      id,
      name: validated.name,
      description: validated.description || '',
      createdAt: now,
      testDate: validated.testDate,
      protocolNotes: validated.protocolNotes || '',
      plannedDurationMinutes: validated.plannedDurationMinutes,
      actualDurationMinutes: validated.actualDurationMinutes,
      status: validated.status || 'Draft',
      sampleIds: [],
      controls: validated.controls || {
        roomStageCompleted: false,
        emptyContainerStageCompleted: false,
      },
      updatedAt: now,
    };

    list.push(newExperiment);
    await this.storage.saveExperiments(list);
    return newExperiment;
  }

  async updateExperiment(
    id: string,
    updates: Partial<Omit<Experiment, 'id' | 'createdAt'>>
  ): Promise<Experiment> {
    const list = await this.storage.getExperiments();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Experiment with ID "${id}" not found.`);
    }

    const current = list[index];
    const updated: Experiment = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    await this.storage.saveExperiments(list);
    return updated;
  }

  async updateStatus(id: string, status: ExperimentStatus): Promise<Experiment> {
    return this.updateExperiment(id, { status });
  }

  async updateControls(id: string, controls: Partial<ControlRunMetadata>): Promise<Experiment> {
    const experiment = await this.getExperimentById(id);
    if (!experiment) throw new Error(`Experiment "${id}" not found`);

    const updatedControls: ControlRunMetadata = {
      ...experiment.controls,
      ...controls,
    };

    return this.updateExperiment(id, { controls: updatedControls });
  }

  async archiveExperiment(id: string): Promise<Experiment> {
    return this.updateStatus(id, 'Archived');
  }

  async deleteExperiment(id: string): Promise<void> {
    const list = await this.storage.getExperiments();
    const filtered = list.filter((e) => e.id !== id);
    await this.storage.saveExperiments(filtered);
  }
}
