import React, { useRef, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { MobileDeviceFrame } from './MobileDeviceFrame';
import { ContextMenu } from './ContextMenu';
import { IsolationBreadcrumbsBar } from './IsolationBreadcrumbsBar';
import { UpdateMasterSyncModal } from '../modals/UpdateMasterSyncModal';
import { ComponentType } from '../../types';
import { COMPONENT_CATALOG } from '../../constants/componentTemplates';

export const CanvasContainer: React.FC = () => {
  const {
    activeScreen,
    device,
    zoom,
    setZoom,
    panX,
    panY,
    setPan,
    showGrid,
    addComponentToCanvas,
    instantiateMasterComponent,
    deselectAll,
    pendingSyncMaster,
    updateMasterComponent,
    setPendingSyncMaster,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Wheel zoom with Ctrl/Meta or Pan with mouse wheel
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoom(zoom * factor);
      } else {
        setPan(panX - e.deltaX, panY - e.deltaY);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, panX, panY, setZoom, setPan]);

  // Pan canvas dragging with middle click or space key / Alt key
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey) {
      // Middle click or Alt key
      e.preventDefault();
      setIsPanning(true);
      const startX = e.clientX - panX;
      const startY = e.clientY - panY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        setPan(moveEvent.clientX - startX, moveEvent.clientY - startY);
      };

      const onMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else if (e.target === containerRef.current) {
      deselectAll();
      setContextMenuPos(null);
    }
  };

  // Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Drag-and-drop new components or Master Components from sidebar onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataJson = e.dataTransfer.getData('application/json');
      if (dataJson) {
        const parsed = JSON.parse(dataJson);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const deviceCenterX = rect.left + rect.width / 2 + panX;
          const deviceCenterY = rect.top + rect.height / 2 + panY;

          const mouseXInDevice = (e.clientX - deviceCenterX) / zoom;
          const mouseYInDevice = (e.clientY - deviceCenterY) / zoom;

          const deviceX = mouseXInDevice + device.width / 2;
          const deviceY = mouseYInDevice + device.height / 2 - 44;

          if (parsed.isMaster && parsed.masterId) {
            // Instantiate master component at dropped position
            instantiateMasterComponent(
              parsed.masterId,
              Math.max(0, Math.round(deviceX - 100)),
              Math.max(0, Math.round(deviceY - 100))
            );
            return;
          }

          if (parsed.type) {
            const catalogItem = COMPONENT_CATALOG.find((c) => c.type === parsed.type);
            const itemW = catalogItem ? catalogItem.defaultWidth : 200;
            const itemH = catalogItem ? catalogItem.defaultHeight : 50;

            const dropX = Math.round(deviceX - itemW / 2);
            const dropY = Math.round(deviceY - itemH / 2);

            addComponentToCanvas(
              parsed.type as ComponentType,
              Math.max(0, dropX),
              Math.max(0, dropY)
            );
          }
        }
      }
    } catch (err) {
      console.error('Error handling drag drop on canvas:', err);
    }
  };

  return (
    <main
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex-1 h-[calc(100vh-3.5rem)] bg-slate-950 relative overflow-hidden flex items-center justify-center select-none ${
        isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Isolation Mode Breadcrumbs Overlay Bar */}
      <IsolationBreadcrumbsBar />

      {/* Background Grid Lines Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${panX}px ${panY}px`,
          }}
        />
      )}

      {/* Centered Device Canvas Frame */}
      <div
        className="transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <MobileDeviceFrame
          screen={activeScreen}
          device={device}
          zoom={zoom}
          onContextMenu={handleContextMenu}
        />
      </div>

      {/* Context Menu Modal Overlay */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
        />
      )}

      {/* Intelligent Update Sync Modal */}
      {pendingSyncMaster && (
        <UpdateMasterSyncModal
          master={pendingSyncMaster}
          onConfirmSync={(mode) => {
            updateMasterComponent(
              pendingSyncMaster.id,
              pendingSyncMaster.rootComponent,
              pendingSyncMaster.childrenComponents,
              mode
            );
            setPendingSyncMaster(null);
          }}
          onCancel={() => setPendingSyncMaster(null)}
        />
      )}
    </main>
  );
};
