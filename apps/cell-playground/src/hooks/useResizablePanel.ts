import { useState, useRef, useCallback } from 'react';

/**
 * Returns a resizable panel width controlled by a drag handle.
 * The `startDrag` function should be passed to the `onMouseDown` of the divider element.
 */
export function useResizablePanel(initialWidth: number, min = 200, max = 700) {
  const [width, setWidth] = useState(initialWidth);
  const widthRef = useRef(initialWidth);

  // Keep ref in sync so startDrag always sees the latest width without re-creating
  widthRef.current = width;

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const startX = e.clientX;
      const startWidth = widthRef.current;

      const onMove = (ev: MouseEvent) => {
        setWidth(Math.max(min, Math.min(max, startWidth + (ev.clientX - startX))));
      };

      const onUp = () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [min, max],
  );

  return { width, startDrag };
}
