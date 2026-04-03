import { useState, useCallback } from 'react';

export type DetailEditState = 'idle' | 'editing' | 'saving' | 'saved' | 'error';

export interface DetailPageMode {
  editState: DetailEditState;
  isEditing: boolean;
  isSaving: boolean;
  enterEdit: () => void;
  cancelEdit: () => void;
  beginSave: () => void;
  completeSave: () => void;
  failSave: (err?: string) => void;
  saveError: string | null;
}

export function useDetailPageMode(): DetailPageMode {
  const [editState, setEditState] = useState<DetailEditState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const enterEdit = useCallback(() => {
    setSaveError(null);
    setEditState('editing');
  }, []);

  const cancelEdit = useCallback(() => {
    setSaveError(null);
    setEditState('idle');
  }, []);

  const beginSave = useCallback(() => setEditState('saving'), []);

  const completeSave = useCallback(() => {
    setSaveError(null);
    setEditState('saved');
    // Brief "saved" flash, then return to idle
    setTimeout(() => setEditState('idle'), 1200);
  }, []);

  const failSave = useCallback((err?: string) => {
    setSaveError(err ?? 'Save failed. Please try again.');
    setEditState('error');
  }, []);

  return {
    editState,
    isEditing: editState === 'editing',
    isSaving: editState === 'saving',
    enterEdit,
    cancelEdit,
    beginSave,
    completeSave,
    failSave,
    saveError,
  };
}
