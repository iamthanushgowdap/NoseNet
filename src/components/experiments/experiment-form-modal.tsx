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
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs space-y-1">
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Experiment ID {!isEditing && <span className="text-slate-500">(Optional auto)</span>}
            </label>
            <input
              type="text"
              value={id}
              disabled={isEditing}
              onChange={(e) => handleFieldChange(setId, e.target.value)}
              placeholder="e.g. EXP-2026-003"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs disabled:opacity-50 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => handleFieldChange(setStatus, e.target.value as ExperimentStatus)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Experiment Title / Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleFieldChange(setName, e.target.value)}
            placeholder="e.g. Shelf-Life Study: Normal Cake Frozen vs Room Temperature"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description & Objective
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => handleFieldChange(setDescription, e.target.value)}
            placeholder="Briefly state the research hypothesis and test setup..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Testing Date *
            </label>
            <input
              type="date"
              required
              value={testDate}
              onChange={(e) => handleFieldChange(setTestDate, e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Planned Duration (mins) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={plannedDurationMinutes}
              onChange={(e) => handleFieldChange(setPlannedDurationMinutes, e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Actual Duration (mins)
            </label>
            <input
              type="number"
              min={0}
              value={actualDurationMinutes}
              onChange={(e) => handleFieldChange(setActualDurationMinutes, e.target.value)}
              placeholder="e.g. 55"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Protocol Notes & IoT Sensor Setup
          </label>
          <textarea
            rows={2}
            value={protocolNotes}
            onChange={(e) => handleFieldChange(setProtocolNotes, e.target.value)}
            placeholder="Sensor heater profile, sampling intervals, temperature calibration..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Control Runs Section */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Control Runs (Calibration & Baseline Verification)</span>
            </h4>
            <span className="text-[10px] text-slate-500">ROOM & EMPTY_CONTAINER</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* ROOM control */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={roomDone}
                  onChange={(e) => handleFieldChange(setRoomDone, e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs font-medium text-slate-200">
                  ROOM Baseline Completed
                </span>
              </label>
              {roomDone && (
                <div className="mt-2.5">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Room Gas Resistance (kΩ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={roomBaseline}
                    onChange={(e) => handleFieldChange(setRoomBaseline, e.target.value)}
                    placeholder="e.g. 54.2"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* EMPTY_CONTAINER control */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={containerDone}
                  onChange={(e) => handleFieldChange(setContainerDone, e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs font-medium text-slate-200">
                  EMPTY_CONTAINER Completed
                </span>
              </label>
              {containerDone && (
                <div className="mt-2.5">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Container Gas Resistance (kΩ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={containerBaseline}
                    onChange={(e) => handleFieldChange(setContainerBaseline, e.target.value)}
                    placeholder="e.g. 52.8"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
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
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
