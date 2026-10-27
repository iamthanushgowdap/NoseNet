'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { services } from '@/services';
import { Experiment } from '@/types/experiment';
import { ExperimentFormModal } from '@/components/experiments/experiment-form-modal';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Archive,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function ExperimentsPage() {
  const { experiments, refreshData } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experiment | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const filteredExperiments = experiments.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingExp(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp: Experiment) => {
    setEditingExp(exp);
    setIsFormOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!confirmArchiveId) return;
    setIsActionLoading(true);
    try {
      await services.experiments.archiveExperiment(confirmArchiveId);
      await refreshData();
      setConfirmArchiveId(null);
    } catch (e) {
      console.error('Failed to archive experiment:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsActionLoading(true);
    try {
      await services.experiments.deleteExperiment(confirmDeleteId);
      await refreshData();
      setConfirmDeleteId(null);
    } catch (e) {
      console.error('Failed to delete experiment:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-white" />
            <span>Experiment Protocols</span>
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Manage electronic nose cake testing runs, control baselines (ROOM / EMPTY_CONTAINER), and protocol notes.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5 text-black" />
          <span>New Experiment</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experiments by ID, title, or keywords..."
            className="w-full pl-9 pr-3.5 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Experiments Grid */}
      {filteredExperiments.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title={search || statusFilter !== 'ALL' ? 'No matching experiments' : 'No experiments created'}
          description={
            search || statusFilter !== 'ALL'
              ? 'Try modifying your search keywords or clearing status filters.'
              : 'Create your first cake spoilage experiment to get started.'
          }
          actionLabel={search || statusFilter !== 'ALL' ? 'Clear Filters' : 'Create Experiment'}
          onAction={() => {
            if (search || statusFilter !== 'ALL') {
              setSearch('');
              setStatusFilter('ALL');
            } else {
              handleOpenCreate();
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((exp) => (
            <div
              key={exp.id}
              className="bg-black border border-neutral-800 rounded-xl p-5 hover:border-neutral-600 transition-colors flex flex-col justify-between text-white"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-800 mb-3">
                  <span className="font-mono text-xs font-bold text-white">
                    {exp.id}
                  </span>
                  <StatusBadge status={exp.status} />
                </div>

                <h3 className="text-base font-bold text-white hover:underline transition-colors">
                  <Link href={`/experiments/${exp.id}`}>{exp.name}</Link>
                </h3>

                <p className="text-xs text-neutral-300 mt-1.5 line-clamp-2 leading-relaxed">
                  {exp.description || 'No description provided.'}
                </p>

                {/* Control verification indicators */}
                <div className="mt-4 pt-3 border-t border-neutral-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        exp.controls.roomStageCompleted ? 'text-white' : 'text-neutral-600'
                      }`}
                    />
                    <span>ROOM: {exp.controls.roomStageCompleted ? 'Verified' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        exp.controls.emptyContainerStageCompleted ? 'text-white' : 'text-neutral-600'
                      }`}
                    />
                    <span>CONT: {exp.controls.emptyContainerStageCompleted ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-white">
                    <Layers className="w-3.5 h-3.5 text-white" />
                    <span>{exp.sampleIds.length} Samples</span>
                  </span>
                  <span>Date: {exp.testDate}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                <Link
                  href={`/experiments/${exp.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold border border-neutral-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>View Details</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                    title="Edit Experiment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {exp.status !== 'Archived' && (
                    <button
                      onClick={() => setConfirmArchiveId(exp.id)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-amber-400 hover:bg-neutral-900 transition-colors"
                      title="Archive Experiment"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(exp.id)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 transition-colors"
                    title="Delete Experiment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experiment Create/Edit Modal */}
      <ExperimentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={refreshData}
        initialData={editingExp}
      />

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmArchiveId)}
        onClose={() => setConfirmArchiveId(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Experiment"
        description="Are you sure you want to archive this experiment? It will be marked as Archived but data will be preserved."
        confirmLabel="Archive"
        isLoading={isActionLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Experiment"
        description="Are you sure you want to permanently delete this experiment from local storage? Associated samples will be unlinked."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
}
