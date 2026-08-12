import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCcw, AlertTriangle, X } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export interface GlobalResetControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  moduleKey: string;
  resetApiEndpoint: string;
  additionalBody?: Record<string, any>;
  protectedAssetsNotice?: string;
  onSuccess: (data: { resetRunId?: string; recordsCleared?: number; status?: string; [key: string]: any }) => void;
  onError?: (errorMsg: string) => void;
}

export const GlobalResetControlModal: React.FC<GlobalResetControlModalProps> = ({
  isOpen,
  onClose,
  moduleTitle,
  moduleKey,
  resetApiEndpoint,
  additionalBody,
  protectedAssetsNotice,
  onSuccess,
  onError
}) => {
  const [resetStateToggle, setResetStateToggle] = useState<'OFF' | 'ON'>('OFF');
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResetStateToggle('OFF');
      setResetConfirmInput('');
      setIsExecuting(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmationValid =
    resetStateToggle === 'ON' &&
    resetConfirmInput.trim().toUpperCase() === 'CONFIRM RESET';

  const handleExecuteReset = async () => {
    if (!isConfirmationValid || isExecuting) return;

    setIsExecuting(true);
    setErrorMessage(null);

    try {
      const response: any = await fetchApi(resetApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: true,
          resetState: 'ON',
          moduleKey,
          ...additionalBody
        })
      });

      const resData = response?.data || response;

      if (response && response.success !== false && (resData?.status === 'COMPLETED' || resData?.success !== false)) {
        onSuccess(resData);
        onClose();
      } else {
        const errStr = response?.error || resData?.error || 'Database reset operation failed.';
        setErrorMessage(errStr);
        if (onError) onError(errStr);
      }
    } catch (err: any) {
      const errStr = err?.message || 'Database reset execution failed.';
      setErrorMessage(errStr);
      if (onError) onError(errStr);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-rose-200 dark:border-rose-900/50 max-w-lg w-full p-6 space-y-4 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-500">
            <ShieldAlert className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                01 RESET — {moduleTitle} Reset Control
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Development & Staging Maintenance Control (Real Backend Reset)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Protected Assets Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Protected Assets & Scope Guarantee:</span>
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            {protectedAssetsNotice ||
              `This reset executes a REAL database delete of volatile ${moduleTitle} test/staging records. ` +
              `Production models, AI Model Registry canonical identities, database schemas, audit chains, and other workspace data remain completely protected.`}
          </p>
        </div>

        {/* Control Switch */}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Reset Control Switch
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setResetStateToggle('OFF')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  resetStateToggle === 'OFF'
                    ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                RESET OFF
              </button>
              <button
                type="button"
                onClick={() => setResetStateToggle('ON')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  resetStateToggle === 'ON'
                    ? 'bg-rose-600 text-white border-rose-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                RESET ON
              </button>
            </div>
          </div>

          {/* Confirmation Input */}
          {resetStateToggle === 'ON' && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-150 space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Type "CONFIRM RESET" to proceed
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="CONFIRM RESET"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                autoFocus
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-medium">
              RESET FAILED: {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteReset}
            disabled={!isConfirmationValid || isExecuting}
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1.5 ${
              isConfirmationValid && !isExecuting
                ? 'bg-rose-600 hover:bg-rose-700 shadow-md cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Reset...</span>
              </>
            ) : (
              <span>Execute Reset</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
