import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-xs"
          onClick={onCancel}
        />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-10 border border-stone-100">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-2xl flex-shrink-0 ${
                isDestructive ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'
              }`}
            >
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{message}</p>
            </div>

            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
