import React from 'react';
import { CanvasComponent } from '../../types';
import { useEditor } from '../../context/EditorContext';
import { Lock, RotateCw } from 'lucide-react';

interface SelectionBoxProps {
  component: CanvasComponent;
  zoom: number;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ component, zoom }) => {
  const { updateComponentProperties, selectedComponentIds, commitHistory } = useEditor();

  const isMulti = selectedComponentIds.length > 1;

  // Rotation Handle
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const handleEl = e.currentTarget as HTMLElement;
    // Get parent wrapper box
    const parentBox = (handleEl.closest('.cursor-move') as HTMLElement) || handleEl.parentElement;
    if (!parentBox) return;

    const rect = parentBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - centerX;
      const deltaY = moveEvent.clientY - centerY;

      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      angle = Math.round(angle) % 360;

      if (moveEvent.shiftKey) {
        angle = Math.round(angle / 15) * 15;
      }

      updateComponentProperties(component.id, { rotation: angle }, true);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      commitHistory();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Resize Handles: NW, N, NE, E, SE, S, SW, W
  const handleResize = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = component.width;
    const startH = component.height;
    const startPosX = component.x;
    const startPosY = component.y;
    const rotation = component.rotation || 0;

    const startCenterX = startPosX + startW / 2;
    const startCenterY = startPosY + startH / 2;

    const rad = (rotation * Math.PI) / 180;
    const cosRot = Math.cos(-rad);
    const sinRot = Math.sin(-rad);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const unscaledDeltaX = (moveEvent.clientX - startX) / zoom;
      const unscaledDeltaY = (moveEvent.clientY - startY) / zoom;

      // Delta in local component coordinate space
      const localDeltaX = unscaledDeltaX * cosRot - unscaledDeltaY * sinRot;
      const localDeltaY = unscaledDeltaX * sinRot + unscaledDeltaY * cosRot;

      let newW = startW;
      let newH = startH;

      if (handle.includes('e')) newW = Math.max(10, startW + localDeltaX);
      if (handle.includes('w')) newW = Math.max(10, startW - localDeltaX);
      if (handle.includes('s')) newH = Math.max(10, startH + localDeltaY);
      if (handle.includes('n')) newH = Math.max(10, startH - localDeltaY);

      let shiftLocalX = 0;
      let shiftLocalY = 0;

      if (handle.includes('e')) shiftLocalX = (newW - startW) / 2;
      if (handle.includes('w')) shiftLocalX = (startW - newW) / 2;
      if (handle.includes('s')) shiftLocalY = (newH - startH) / 2;
      if (handle.includes('n')) shiftLocalY = (startH - newH) / 2;

      // Shift back to canvas coordinate space
      const shiftCanvasX = shiftLocalX * Math.cos(rad) - shiftLocalY * Math.sin(rad);
      const shiftCanvasY = shiftLocalX * Math.sin(rad) + shiftLocalY * Math.cos(rad);

      const newCenterX = startCenterX + shiftCanvasX;
      const newCenterY = startCenterY + shiftCanvasY;

      const newX = Math.round(newCenterX - newW / 2);
      const newY = Math.round(newCenterY - newH / 2);

      updateComponentProperties(
        component.id,
        {
          width: Math.round(newW),
          height: Math.round(newH),
          x: newX,
          y: newY,
        },
        true
      );
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      commitHistory();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="absolute -inset-[1px] pointer-events-none z-50 border-2 border-blue-500 rounded-xs select-none">
      {/* Top Label Dimension Badge */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1.5 pointer-events-auto">
        <span>{component.name}</span>
        <span className="text-blue-200">
          ({component.width} × {component.height})
        </span>
        {component.locked && <Lock className="w-3 h-3 text-amber-300" />}
      </div>

      {/* Rotation Stem & Handle */}
      {!component.locked && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          <div
            onMouseDown={handleRotate}
            title="Arraste para rotacionar (Shift para alinhar a 15°)"
            className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition duration-75 flex items-center justify-center"
          >
            <RotateCw className="w-2.5 h-2.5 text-blue-600" />
          </div>
          <div className="w-0.5 h-2 bg-blue-500" />
        </div>
      )}

      {/* Resize Handles */}
      {!component.locked && (
        <>
          {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => {
            let positionClass = '';
            let cursorClass = '';

            switch (h) {
              case 'nw':
                positionClass = '-top-1.5 -left-1.5';
                cursorClass = 'cursor-nwse-resize';
                break;
              case 'n':
                positionClass = '-top-1.5 left-1/2 -translate-x-1/2';
                cursorClass = 'cursor-ns-resize';
                break;
              case 'ne':
                positionClass = '-top-1.5 -right-1.5';
                cursorClass = 'cursor-nesw-resize';
                break;
              case 'e':
                positionClass = 'top-1/2 -translate-y-1/2 -right-1.5';
                cursorClass = 'cursor-ew-resize';
                break;
              case 'se':
                positionClass = '-bottom-1.5 -right-1.5';
                cursorClass = 'cursor-nwse-resize';
                break;
              case 's':
                positionClass = '-bottom-1.5 left-1/2 -translate-x-1/2';
                cursorClass = 'cursor-ns-resize';
                break;
              case 'sw':
                positionClass = '-bottom-1.5 -left-1.5';
                cursorClass = 'cursor-nesw-resize';
                break;
              case 'w':
                positionClass = 'top-1/2 -translate-y-1/2 -left-1.5';
                cursorClass = 'cursor-ew-resize';
                break;
            }

            return (
              <div
                key={h}
                onMouseDown={(e) => handleResize(h, e)}
                className={`absolute w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-md pointer-events-auto ${positionClass} ${cursorClass} hover:scale-125 transition duration-75`}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

