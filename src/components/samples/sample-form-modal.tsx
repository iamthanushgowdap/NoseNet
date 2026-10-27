'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/modal';
import { Button } from '@/components/common/button';
import { Sample, CakeCategory, StorageCondition, SampleTestStatus } from '@/types/sample';
import { Experiment } from '@/types/experiment';
import { services } from '@/services';
import { AlertCircle } from 'lucide-react';

interface SampleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Sample | null;
  defaultExperimentId?: string;
  experiments: Experiment[];
}

export function SampleFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  defaultExperimentId,
  experiments,
}: SampleFormModalProps) {
  const isEditing = Boolean(initialData);

  const [id, setId] = useState('');
  const [experimentId, setExperimentId] = useState('');
  const [category, setCategory] = useState<CakeCategory>('Normal Cake');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('Unfrozen');
  const [replicateNumber, setReplicateNumber] = useState('Sample 1');
  const [testDateTime, setTestDateTime] = useState('');
  const [massGrams, setMassGrams] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<SampleTestStatus>('Planned');

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setExperimentId(initialData.experimentId);
      setCategory(initialData.category);
      setStorageCondition(initialData.storageCondition);
      setReplicateNumber(initialData.replicateNumber || 'Sample 1');
      setTestDateTime(
        initialData.testDateTime
          ? initialData.testDateTime.slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      );
      setMassGrams(initialData.massGrams ?? '');
      setNotes(initialData.notes || '');
      setStatus(initialData.status);
    } else {
      setId('');
      setExperimentId(defaultExperimentId || (experiments[0]?.id ?? ''));
      setCategory('Normal Cake');
      setStorageCondition('Unfrozen');
      setReplicateNumber('Sample 1');
      setTestDateTime(new Date().toISOString().slice(0, 16));
      setMassGrams('');
      setNotes('');
      setStatus('Planned');
    }
    setErrors([]);
  }, [initialData, defaultExperimentId, experiments, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      if (!experimentId) {
        throw new Error('Please select an experiment for this sample.');
      }

      if (isEditing && initialData) {
        await services.samples.updateSample(initialData.id, {
          category,
          storageCondition,
          replicateNumber,
          testDateTime: new Date(testDateTime).toISOString(),
          massGrams: massGrams !== '' ? Number(massGrams) : undefined,
          notes,
          status,
        });
      } else {
        await services.samples.createSample({
          id: id.trim() || undefined,
          experimentId,
          category,
          storageCondition,
          replicateNumber,
          testDateTime: new Date(testDateTime).toISOString(),
          massGrams: massGrams !== '' ? Number(massGrams) : undefined,
          notes,
          status,
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors([err.message]);
      } else {
        setErrors(['Failed to save sample.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const combinationLabel = `${category} — ${storageCondition}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Sample: ${initialData?.id}` : 'Register New Cake Sample'}
      description="Record cake matrix type, storage condition, replicate count, and testing status."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs space-y-1">
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-white" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Experiment Selector */}
        <div>
          <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
            Associated Experiment *
          </label>
          <select
            value={experimentId}
            disabled={isEditing}
            onChange={(e) => setExperimentId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white disabled:opacity-50"
            required
          >
            <option value="" className="bg-black text-white">Select an experiment...</option>
            {experiments.map((e) => (
              <option key={e.id} value={e.id} className="bg-black text-white">
                {e.id} — {e.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Sample ID {!isEditing && <span className="text-neutral-400 font-normal">(Optional auto)</span>}
            </label>
            <input
              type="text"
              value={id}
              disabled={isEditing}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. SMP-004"
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white font-mono disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Replicate Number *
            </label>
            <input
              type="text"
              required
              value={replicateNumber}
              onChange={(e) => setReplicateNumber(e.target.value)}
              placeholder="e.g. Sample 1, Sample 2"
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Category & Storage Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Cake Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CakeCategory)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white"
            >
              <option value="Normal Cake" className="bg-black text-white">Normal Cake</option>
              <option value="Pastry Cake" className="bg-black text-white">Pastry Cake</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Storage Condition *
            </label>
            <select
              value={storageCondition}
              onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white"
            >
              <option value="Unfrozen" className="bg-black text-white">Unfrozen (Ambient / Chilled)</option>
              <option value="Frozen" className="bg-black text-white">Frozen (-18°C)</option>
            </select>
          </div>
        </div>

        {/* Live combination preview badge */}
        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-300">Classified Combination:</span>
          <span className="font-semibold text-white">{combinationLabel}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Testing Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={testDateTime}
              onChange={(e) => setTestDateTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Sample Mass (grams)
            </label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={massGrams}
              onChange={(e) => setMassGrams(e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 45.0"
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Testing Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SampleTestStatus)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white"
            >
              <option value="Planned" className="bg-black text-white">Planned (Not Yet Tested)</option>
              <option value="Testing" className="bg-black text-white">Testing (In Progress)</option>
              <option value="Completed" className="bg-black text-white">Completed</option>
              <option value="Invalid" className="bg-black text-white">Invalid (Discarded / Error)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
            Sample Notes & Observations
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Visual appearance, crumb moisture, icing details, odor before test..."
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Register Sample'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
