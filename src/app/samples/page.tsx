'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { services } from '@/services';
import { Sample, SampleTestStatus } from '@/types/sample';
import { SampleFormModal } from '@/components/samples/sample-form-modal';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { formatDate } from '@/lib/utils';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  ClipboardCheck,
} from 'lucide-react';

function SamplesContent() {
  const searchParams = useSearchParams();
  const urlExperimentId = searchParams.get('experimentId');

  const { samples, experiments, refreshData } = useApp();

  const [search, setSearch] = useState('');
  const [expFilter, setExpFilter] = useState<string>(urlExperimentId || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [storageFilter, setStorageFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (urlExperimentId) {
      setExpFilter(urlExperimentId);
    }
  }, [urlExperimentId]);

  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.experimentId.toLowerCase().includes(search.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesExp = expFilter === 'ALL' || s.experimentId === expFilter;
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesStorage = storageFilter === 'ALL' || s.storageCondition === storageFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesExp && matchesCategory && matchesStorage && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingSample(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (smp: Sample) => {
    setEditingSample(smp);
    setIsFormOpen(true);
  };

  const handleQuickStatusChange = async (sampleId: string, newStatus: SampleTestStatus) => {
    try {
      await services.samples.updateStatus(sampleId, newStatus);
      await refreshData();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsActionLoading(true);
    try {
      await services.samples.deleteSample(confirmDeleteId);
      await refreshData();
      setConfirmDeleteId(null);
    } catch (e) {
      console.error('Failed to delete sample:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    const csv = await services.backup.exportSamplesCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nosenet_samples_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-white" />
            <span>Cake Sample Management</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Registered specimens across Normal Cake & Pastry Cake, Frozen & Unfrozen storage conditions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={samples.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register Sample</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search samples..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white"
          />
        </div>

        <div>
          <select
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
          >
            <option value="ALL" className="bg-black text-white">All Experiments</option>
            {experiments.map((e) => (
              <option key={e.id} value={e.id} className="bg-black text-white">
                {e.id} ({e.name.substring(0, 20)}...)
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
          >
            <option value="ALL" className="bg-black text-white">All Categories</option>
            <option value="Normal Cake" className="bg-black text-white">Normal Cake</option>
            <option value="Pastry Cake" className="bg-black text-white">Pastry Cake</option>
          </select>
        </div>

        <div>
          <select
            value={storageFilter}
            onChange={(e) => setStorageFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
          >
            <option value="ALL" className="bg-black text-white">All Storage Conditions</option>
            <option value="Unfrozen" className="bg-black text-white">Unfrozen (Ambient)</option>
            <option value="Frozen" className="bg-black text-white">Frozen (-18°C)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
          >
            <option value="ALL" className="bg-black text-white">All Test Statuses</option>
            <option value="Planned" className="bg-black text-white">Planned</option>
            <option value="Testing" className="bg-black text-white">Testing</option>
            <option value="Completed" className="bg-black text-white">Completed</option>
            <option value="Invalid" className="bg-black text-white">Invalid</option>
          </select>
        </div>
      </div>

      {/* Samples Table */}
      {filteredSamples.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={samples.length === 0 ? 'No cake samples registered' : 'No samples matching filters'}
          description={
            samples.length === 0
              ? 'Register samples for testing with category, storage conditions, and replicate numbers.'
              : 'Modify your filter criteria or clear active search terms.'
          }
          actionLabel={samples.length === 0 ? 'Register Sample' : 'Clear Filters'}
          onAction={() => {
            if (samples.length === 0) {
              handleOpenCreate();
            } else {
              setSearch('');
              setExpFilter('ALL');
              setCategoryFilter('ALL');
              setStorageFilter('ALL');
              setStatusFilter('ALL');
            }
          }}
        />
      ) : (
        <div className="bg-black border border-neutral-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-neutral-300 bg-neutral-950 border-b border-neutral-800 font-bold">
                <tr>
                  <th className="py-3 px-4">Sample ID</th>
                  <th className="py-3 px-4">Experiment</th>
                  <th className="py-3 px-4">Classification Combination</th>
                  <th className="py-3 px-4">Replicate</th>
                  <th className="py-3 px-4">Test Date/Time</th>
                  <th className="py-3 px-4">Mass</th>
                  <th className="py-3 px-4">Status & Transition</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredSamples.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {s.id}
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-300">
                      <Link
                        href={`/experiments/${s.experimentId}`}
                        className="hover:text-white underline underline-offset-2"
                      >
                        {s.experimentId}
                      </Link>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{s.category}</div>
                      <div className="text-[11px] text-neutral-300 mt-0.5">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                            s.storageCondition === 'Frozen' ? 'bg-white' : 'bg-neutral-400'
                          }`}
                        />
                        {s.storageCondition}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-white font-medium">{s.replicateNumber}</td>

                    <td className="py-3 px-4 text-neutral-300 font-mono">
                      {formatDate(s.testDateTime)}
                    </td>

                    <td className="py-3 px-4 text-neutral-200">
                      {s.massGrams ? `${s.massGrams} g` : '—'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} />
                        {/* Quick status cycle button */}
                        <select
                          value={s.status}
                          onChange={(e) =>
                            handleQuickStatusChange(s.id, e.target.value as SampleTestStatus)
                          }
                          className="text-[11px] py-0.5 px-1.5 rounded bg-black border border-neutral-700 text-white focus:outline-none focus:border-white"
                        >
                          <option value="Planned" className="bg-black text-white">Planned</option>
                          <option value="Testing" className="bg-black text-white">Testing</option>
                          <option value="Completed" className="bg-black text-white">Completed</option>
                          <option value="Invalid" className="bg-black text-white">Invalid</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/assess?sampleId=${s.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black hover:bg-neutral-900 text-white border border-neutral-700 transition-colors text-xs"
                          title="Open Sensory Assessment"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Assess</span>
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                          title="Edit Sample"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                          title="Delete Sample"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sample Form Modal */}
      <SampleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={refreshData}
        initialData={editingSample}
        defaultExperimentId={expFilter !== 'ALL' ? expFilter : undefined}
        experiments={experiments}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Sample Record"
        description="Are you sure you want to delete this sample record? Any associated sensor readings will remain."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
}

export default function SamplesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading samples...</div>}>
      <SamplesContent />
    </Suspense>
  );
}
