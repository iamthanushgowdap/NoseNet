'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/modal';
import { Button } from '@/components/common/button';
import { Experiment, ExperimentStatus, ControlRunMetadata } from '@/types/experiment';
import { services } from '@/services';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ExperimentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Experiment | null;
}

export function ExperimentFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ExperimentFormModalProps) {
  const isEditing = Boolean(initialData);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [testDate, setTestDate] = useState('');
  const [protocolNotes, setProtocolNotes] = useState('');
  const [plannedDurationMinutes, setPlannedDurationMinutes] = useState(60);
  const [actualDurationMinutes, setActualDurationMinutes] = useState<number | ''>('');
  const [status, setStatus] = useState<ExperimentStatus>('Draft');

  // Control runs
  const [roomDone, setRoomDone] = useState(false);
  const [roomBaseline, setRoomBaseline] = useState<number | ''>('');
  const [containerDone, setContainerDone] = useState(false);
  const [containerBaseline, setContainerBaseline] = useState<number | ''>('');
  const [controlNotes, setControlNotes] = useState('');

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setName(initialData.name);
      setDescription(initialData.description || '');
      setTestDate(initialData.testDate || new Date().toISOString().split('T')[0]);
      setProtocolNotes(initialData.protocolNotes || '');
      setPlannedDurationMinutes(initialData.plannedDurationMinutes || 60);
      setActualDurationMinutes(initialData.actualDurationMinutes ?? '');
      setStatus(initialData.status);

      setRoomDone(initialData.controls.roomStageCompleted);
      setRoomBaseline(initialData.controls.roomBaselineResistanceKohm ?? '');
      setContainerDone(initialData.controls.emptyContainerStageCompleted);
      setContainerBaseline(initialData.controls.emptyContainerBaselineResistanceKohm ?? '');
      setControlNotes(initialData.controls.notes || '');
    } else {
      setId('');
      setName('');
      setDescription('');
      setTestDate(new Date().toISOString().split('T')[0]);
      setProtocolNotes('');
      setPlannedDurationMinutes(60);
      setActualDurationMinutes('');
      setStatus('Draft');

      setRoomDone(false);
      setRoomBaseline('');
      setContainerDone(false);
      setContainerBaseline('');
      setControlNotes('');
    }
    setErrors([]);
    setIsDirty(false);
  }, [initialData, isOpen]);

  const handleFieldChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes in this experiment form. Discard changes?'
      );
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      const controls: ControlRunMetadata = {
        roomStageCompleted: roomDone,
        roomBaselineResistanceKohm: roomBaseline !== '' ? Number(roomBaseline) : undefined,
        emptyContainerStageCompleted: containerDone,
        emptyContainerBaselineResistanceKohm:
          containerBaseline !== '' ? Number(containerBaseline) : undefined,
        notes: controlNotes,
      };

      if (isEditing && initialData) {
        await services.experiments.updateExperiment(initialData.id, {
          name,
          description,
          testDate,
          protocolNotes,
          plannedDurationMinutes: Number(plannedDurationMinutes),
          actualDurationMinutes:
            actualDurationMinutes !== '' ? Number(actualDurationMinutes) : undefined,
          status,
          controls,
        });
      } else {
        await services.experiments.createExperiment({
          id: id.trim() || undefined,
          name,
          description,
          testDate,
          protocolNotes,
          plannedDurationMinutes: Number(plannedDurationMinutes),
          actualDurationMinutes:
            actualDurationMinutes !== '' ? Number(actualDurationMinutes) : undefined,
          status,
          controls,
        });
      }

      setIsDirty(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors([err.message]);
      } else {
        setErrors(['Failed to save experiment. Please check inputs.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? `Edit Experiment: ${initialData?.id}` : 'Create New Experiment'}
      description="Record parameters, protocol notes, and baseline control run observations."
      maxWidth="2xl"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Experiment ID {!isEditing && <span className="text-neutral-400 font-normal">(Optional auto)</span>}
            </label>
            <input
              type="text"
              value={id}
              disabled={isEditing}
              onChange={(e) => handleFieldChange(setId, e.target.value)}
              placeholder="e.g. EXP-2026-003"
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs disabled:opacity-50 focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => handleFieldChange(setStatus, e.target.value as ExperimentStatus)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white"
            >
              <option value="Draft" className="bg-black text-white">Draft</option>
              <option value="Active" className="bg-black text-white">Active</option>
              <option value="Completed" className="bg-black text-white">Completed</option>
              <option value="Archived" className="bg-black text-white">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
            Experiment Title / Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleFieldChange(setName, e.target.value)}
            placeholder="e.g. Shelf-Life Study: Normal Cake Frozen vs Room Temperature"
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
            Description & Objective
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => handleFieldChange(setDescription, e.target.value)}
            placeholder="Briefly state the research hypothesis and test setup..."
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Testing Date *
            </label>
            <input
              type="date"
              required
              value={testDate}
              onChange={(e) => handleFieldChange(setTestDate, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Planned Duration (mins) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={plannedDurationMinutes}
              onChange={(e) => handleFieldChange(setPlannedDurationMinutes, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Actual Duration (mins)
            </label>
            <input
              type="number"
              min={0}
              value={actualDurationMinutes}
              onChange={(e) => handleFieldChange(setActualDurationMinutes, e.target.value)}
              placeholder="e.g. 55"
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
            Protocol Notes & IoT Sensor Setup
          </label>
          <textarea
            rows={2}
            value={protocolNotes}
            onChange={(e) => handleFieldChange(setProtocolNotes, e.target.value)}
            placeholder="Sensor heater profile, sampling intervals, temperature calibration..."
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
          />
        </div>

        {/* Control Runs Section */}
        <div className="p-4 rounded-lg bg-black border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
              <span>Control Runs (Calibration & Baseline Verification)</span>
            </h4>
            <span className="text-[10px] text-neutral-400 font-mono">ROOM & EMPTY_CONTAINER</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* ROOM control */}
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={roomDone}
                  onChange={(e) => handleFieldChange(setRoomDone, e.target.checked)}
                  className="rounded border-neutral-700 bg-black text-white focus:ring-white"
                />
                <span className="text-xs font-medium text-white">
                  ROOM Baseline Completed
                </span>
              </label>
              {roomDone && (
                <div className="mt-2.5">
                  <label className="block text-[11px] text-neutral-300 mb-1">
                    Room Gas Resistance (kΩ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={roomBaseline}
                    onChange={(e) => handleFieldChange(setRoomBaseline, e.target.value)}
                    placeholder="e.g. 54.2"
                    className="w-full px-2.5 py-1.5 rounded bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
                  />
                </div>
              )}
            </div>

            {/* EMPTY_CONTAINER control */}
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={containerDone}
                  onChange={(e) => handleFieldChange(setContainerDone, e.target.checked)}
                  className="rounded border-neutral-700 bg-black text-white focus:ring-white"
                />
                <span className="text-xs font-medium text-white">
                  EMPTY_CONTAINER Completed
                </span>
              </label>
              {containerDone && (
                <div className="mt-2.5">
                  <label className="block text-[11px] text-neutral-300 mb-1">
                    Container Gas Resistance (kΩ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={containerBaseline}
                    onChange={(e) => handleFieldChange(setContainerBaseline, e.target.value)}
                    placeholder="e.g. 52.8"
                    className="w-full px-2.5 py-1.5 rounded bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <input
              type="text"
              value={controlNotes}
              onChange={(e) => handleFieldChange(setControlNotes, e.target.value)}
              placeholder="Control notes (e.g. chamber purged with dry air for 5 min)"
              className="w-full px-3 py-1.5 rounded bg-black border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Experiment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
