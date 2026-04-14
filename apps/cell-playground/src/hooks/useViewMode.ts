import { useState } from 'react';

type ViewMode = 'split' | 'full';
type FullContent = 'preview' | 'code';

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [fullContent, setFullContent] = useState<FullContent>('preview');

  function setFull() {
    setViewMode('full');
    setFullContent('preview');
  }
  function setSplit() {
    setViewMode('split');
  }
  function toggleFullContent() {
    setFullContent((f) => (f === 'preview' ? 'code' : 'preview'));
  }

  return { viewMode, fullContent, setFull, setSplit, toggleFullContent };
}
