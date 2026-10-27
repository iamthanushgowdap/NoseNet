import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { Sample, SampleTestStatus } from '@/types/sample';
import { CreateSampleInputSchema } from '@/lib/validation/sample.schema';

export class SampleService {
  constructor(private storage: IStorageAdapter) {}

  async getSamples(experimentId?: string): Promise<Sample[]> {
    const list = await this.storage.getSamples();
    if (experimentId) {
      return list.filter((s) => s.experimentId === experimentId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSampleById(id: string): Promise<Sample | null> {
    const list = await this.storage.getSamples();
    return list.find((s) => s.id === id) || null;
  }

  async createSample(input: unknown): Promise<Sample> {
    const validated = CreateSampleInputSchema.parse(input);
    const list = await this.storage.getSamples();

    const id = validated.id?.trim() || `SMP-${String(list.length + 1).padStart(3, '0')}`;
    if (list.some((s) => s.id.toLowerCase() === id.toLowerCase())) {
      throw new Error(`Sample ID "${id}" already exists. Please choose a unique Sample ID.`);
    }

    const now = new Date().toISOString();
    const newSample: Sample = {
      id,
      experimentId: validated.experimentId,
      category: validated.category,
      storageCondition: validated.storageCondition,
      replicateNumber: validated.replicateNumber || 'Sample 1',
      testDateTime: validated.testDateTime,
      massGrams: validated.massGrams,
      notes: validated.notes || '',
      status: validated.status || 'Planned',
      createdAt: now,
      updatedAt: now,
    };

    list.push(newSample);
    await this.storage.saveSamples(list);

    // Link sample ID to experiment if it exists
    const experiments = await this.storage.getExperiments();
    const expIndex = experiments.findIndex((e) => e.id === validated.experimentId);
    if (expIndex !== -1 && !experiments[expIndex].sampleIds.includes(id)) {
      experiments[expIndex].sampleIds.push(id);
      await this.storage.saveExperiments(experiments);
    }

    return newSample;
  }

  async updateSample(
    id: string,
    updates: Partial<Omit<Sample, 'id' | 'createdAt'>>
  ): Promise<Sample> {
    const list = await this.storage.getSamples();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Sample with ID "${id}" not found.`);
    }

    const current = list[index];
    const updated: Sample = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    await this.storage.saveSamples(list);
    return updated;
  }

  async updateStatus(id: string, status: SampleTestStatus): Promise<Sample> {
    return this.updateSample(id, { status });
  }

  async deleteSample(id: string): Promise<void> {
    const list = await this.storage.getSamples();
    const target = list.find((s) => s.id === id);
    const filtered = list.filter((s) => s.id !== id);
    await this.storage.saveSamples(filtered);

    // Unlink from experiment
    if (target) {
      const experiments = await this.storage.getExperiments();
      const expIndex = experiments.findIndex((e) => e.id === target.experimentId);
      if (expIndex !== -1) {
        experiments[expIndex].sampleIds = experiments[expIndex].sampleIds.filter((sid) => sid !== id);
        await this.storage.saveExperiments(experiments);
      }
    }
  }
}
