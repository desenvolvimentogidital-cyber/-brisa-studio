import React, { useState, useEffect } from 'react';
import { DevicePreset, Screen, CanvasComponent } from '../../types';
import { ComponentRenderer } from './ComponentRenderer';
import { SelectionBox } from './SelectionBox';
import { useEditor } from '../../context/EditorContext';
import { calculateSmartGuides, GuideLine } from '../../utils/smartGuides';
import { getAbsolutePosition, isAncestorOf } from '../../utils/hierarchy';
import { Wifi, Battery, Signal } from 'lucide-react';

interface ComponentWrapperProps {
  comp: CanvasComponent;
  allComponents: CanvasComponent[];
  selectedComponentIds: string[];
  isolatedComponentId: string | null;
  zoom: number;
  onMouseDown: (e: React.MouseEvent, id: string, locked: boolean) => void;
  onDoubleClick: (e: React.MouseEvent, id: string) => void;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
  comp,
  allComponents,
  selectedComponentIds,
  isolatedComponentId,
  zoom,
  onMouseDown,
  onDoubleClick,
}) => {
  if (comp.hidden) return null;

  const isSelected = selectedComponentIds.includes(comp.id);
  const directChildren = allComponents.filter((c) => c.parentId === comp.id);

  // Isolation mode filtering check
  let isDimmed = false;
  if (isolatedComponentId) {
    const compMap = new Map<string, CanvasComponent>();
    allComponents.forEach((c) => compMap.set(c.id, c));

    const isIsolatedRoot = comp.id === isolatedComponentId;
    const isChildOfIsolated = isAncestorOf(isolatedComponentId, comp.id, compMap);
    const isParentOfIsolated = isAncestorOf(comp.id, isolatedComponentId, compMap);

    if (!isIsolatedRoot && !isChildOfIsolated && !isParentOfIsolated) {
      isDimmed = true;
    }
  }

  return (
    <div
      key={comp.id}
      onMouseDown={(e) => onMouseDown(e, comp.id, comp.locked)}
      onDoubleClick={(e) => onDoubleClick(e, comp.id)}
      className={`absolute cursor-move group/comp transition-opacity duration-200 ${
        isDimmed ? 'opacity-20 pointer-events-none' : ''
      }`}
      style={{
        left: `${comp.x}px`,
        top: `${comp.y}px`,
        width: `${comp.width}px`,
        height: `${comp.height}px`,
        zIndex: comp.zIndex,
        transform: comp.rotation ? `rotate(${comp.rotation}deg)` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <ComponentRenderer component={comp} />

      {/* Render children inside container */}
      {directChildren.map((child) => (
        <ComponentWrapper
          key={child.id}
          comp={child}
          allComponents={allComponents}
          selectedComponentIds={selectedComponentIds}
          isolatedComponentId={isolatedComponentId}
          zoom={zoom}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
        />
      ))}

      {/* Bounding selection handles */}
      {isSelected && !isDimmed && <SelectionBox component={comp} zoom={zoom} />}
    </div>
  );
};

interface MobileDeviceFrameProps {
  screen: Screen;
  device: DevicePreset;
  zoom: number;
  onDropComponent?: (type: string, x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  screen,
  device,
  zoom,
  onContextMenu,
}) => {
  const {
    selectedComponentIds,
    selectComponent,
    deselectAll,
    updateComponentProperties,
    commitHistory,
    showGuides,
    snapToGrid,
    isolatedComponentId,
    enterIsolationMode,
  } = useEditor();

  const [currentTime, setCurrentTime] = useState('09:41');
  const [activeGuides, setActiveGuides] = useState<GuideLine[]>([]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      deselectAll();
    }
  };

  // Dragging existing component or multi-selected components on canvas
  const handleComponentMouseDown = (e: React.MouseEvent, compId: string, compLocked: boolean) => {
    e.stopPropagation();

    let currentSelectedIds = selectedComponentIds;
    if (!selectedComponentIds.includes(compId)) {
      const isMultiSelect = e.shiftKey || e.metaKey;
      selectComponent(compId, isMultiSelect);
      if (isMultiSelect) {
        currentSelectedIds = [...selectedComponentIds, compId];
      } else {
        currentSelectedIds = [compId];
      }
    }

    if (compLocked) return;

    // Capture start positions for all active selected components
    const startPositions = screen.components
      .filter((c) => currentSelectedIds.includes(c.id) && !c.locked)
      .map((c) => ({
        id: c.id,
        startX: c.x,
        startY: c.y,
      }));

    if (startPositions.length === 0) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / zoom;
      const deltaY = (moveEvent.clientY - startMouseY) / zoom;

      if (startPositions.length === 1) {
        const pos = startPositions[0];
        const targetComp = screen.components.find((c) => c.id === pos.id);
        if (targetComp) {
          const compMap = new Map<string, CanvasComponent>();
          screen.components.forEach((c) => compMap.set(c.id, c));

          let parentAbsX = 0;
          let parentAbsY = 0;
          if (targetComp.parentId) {
            const pAbs = getAbsolutePosition(targetComp.parentId, compMap);
            parentAbsX = pAbs.x;
            parentAbsY = pAbs.y;
          }

          const currentAbsX = parentAbsX + pos.startX + deltaX;
          const currentAbsY = parentAbsY + pos.startY + deltaY;

          const { snappedX, snappedY, guides } = calculateSmartGuides(
            {
              id: targetComp.id,
              x: currentAbsX,
              y: currentAbsY,
              width: targetComp.width,
              height: targetComp.height,
            },
            screen.components,
            device,
            snapToGrid || showGuides
          );

          setActiveGuides(showGuides ? guides : []);

          updateComponentProperties(
            pos.id,
            {
              x: snappedX - parentAbsX,
              y: snappedY - parentAbsY,
            },
            true
          );
          return;
        }
      }

      setActiveGuides([]);
      startPositions.forEach((pos) => {
        updateComponentProperties(
          pos.id,
          {
            x: Math.round(pos.startX + deltaX),
            y: Math.round(pos.startY + deltaY),
          },
          true
        );
      });
    };

    const onMouseUp = () => {
      setActiveGuides([]);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      commitHistory();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      onContextMenu={onContextMenu}
      className="relative bg-slate-950 shadow-2xl transition-all duration-300 border-[10px] border-slate-800 shadow-blue-500/10 shrink-0 select-none"
      style={{
        width: `${device.width}px`,
        height: `${device.height}px`,
        borderRadius: `${device.borderRadius}px`,
      }}
    >
      {/* Dynamic Island / Notch */}
      {device.notchType === 'dynamic-island' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-950/60 border border-blue-900/80" />
        </div>
      )}

      {device.notchType === 'notch' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-xl z-40" />
      )}

      {device.notchType === 'punch-hole' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-40 border border-slate-900" />
      )}

      {/* Top Mobile Status Bar (Clock, Wifi, Battery) */}
      <div className="absolute top-0 left-0 right-0 h-11 z-30 px-6 flex items-center justify-between text-xs font-semibold text-slate-800 pointer-events-none">
        <span className="font-mono text-[11px] font-bold">{currentTime}</span>
        <div className="flex items-center gap-1.5 opacity-80">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 fill-current" />
        </div>
      </div>

      {/* Inner Screen Canvas Viewport */}
      <div
        onClick={handleCanvasClick}
        className="w-full h-full relative overflow-hidden pt-11 pb-6"
        style={{
          backgroundColor: screen.backgroundColor || '#FFFFFF',
          borderRadius: `${device.borderRadius - 8}px`,
        }}
      >
        {/* Render Components */}
        {screen.components
          .filter((comp) => !comp.parentId || !screen.components.some((p) => p.id === comp.parentId))
          .map((comp) => (
            <ComponentWrapper
              key={comp.id}
              comp={comp}
              allComponents={screen.components}
              selectedComponentIds={selectedComponentIds}
              isolatedComponentId={isolatedComponentId}
              zoom={zoom}
              onMouseDown={handleComponentMouseDown}
              onDoubleClick={(_, id) => enterIsolationMode(id)}
            />
          ))}

        {/* Smart Guides Overlay Lines */}
        {activeGuides.map((guide) => {
          if (guide.type === 'vertical') {
            return (
              <div
                key={guide.id}
                className="absolute bg-red-500 z-50 pointer-events-none"
                style={{
                  left: `${guide.position}px`,
                  top: `${guide.start}px`,
                  height: `${Math.max(1, guide.end - guide.start)}px`,
                  width: '1px',
                }}
              >
                {guide.label && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[9px] font-mono font-bold px-1 py-0.5 rounded shadow-md whitespace-nowrap z-50">
                    {guide.label}
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div
                key={guide.id}
                className="absolute bg-red-500 z-50 pointer-events-none"
                style={{
                  top: `${guide.position}px`,
                  left: `${guide.start}px`,
                  width: `${Math.max(1, guide.end - guide.start)}px`,
                  height: '1px',
                }}
              >
                {guide.label && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[9px] font-mono font-bold px-1 py-0.5 rounded shadow-md whitespace-nowrap z-50">
                    {guide.label}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>

      {/* Bottom Home Bar Indicator (iOS / Android) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400 rounded-full z-40 pointer-events-none opacity-60" />
    </div>
  );
};
