'use client';

import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-4 mb-5">
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            variant === 'danger'
              ? 'bg-rose-950 text-white border border-rose-600'
              : 'bg-neutral-900 text-white border border-neutral-700'
          }`}
        >
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white">{title}</h4>
          <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
