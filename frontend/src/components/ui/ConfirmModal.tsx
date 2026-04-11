import React from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-pop-in glass-panel">
        <div className={`modal-icon ${type}`}>
          <AlertCircle size={32} />
        </div>
        <div className="modal-text">
          <h2>{title}</h2>
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button 
            variant={type === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm}
            className="confirm-btn"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
