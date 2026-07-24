import React, { useState } from 'react';
import { ComponentsPanel } from './ComponentsPanel';
import { LayersPanel } from './LayersPanel';
import { AssetsPanel } from './AssetsPanel';
import { ScreensPanel } from './ScreensPanel';
import { TemplatesPanel } from './TemplatesPanel';
import {
  Boxes,
  Layers,
  Image,
  Smartphone,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type TabId = 'components' | 'layers' | 'assets' | 'screens' | 'templates';

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('components');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'components' as TabId, label: 'Componentes', icon: Boxes },
    { id: 'layers' as TabId, label: 'Camadas', icon: Layers },
    { id: 'assets' as TabId, label: 'Mídias', icon: Image },
    { id: 'screens' as TabId, label: 'Telas', icon: Smartphone },
    { id: 'templates' as TabId, label: 'Templates', icon: LayoutTemplate },
  ];

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] bg-slate-950 border-r border-slate-800 flex transition-all duration-300 relative z-20 shrink-0 ${
        isCollapsed ? 'w-12' : 'w-72'
      }`}
    >
      {/* Icon Navigation Column */}
      <div className="w-12 bg-slate-900 border-r border-slate-800/80 flex flex-col items-center py-3 gap-2 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isCollapsed;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsCollapsed(false);
              }}
              title={tab.label}
              className={`p-2.5 rounded-xl transition group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />

              {/* Tooltip on collapse */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                  {tab.label}
                </div>
              )}
            </button>
          );
        })}

        {/* Toggle Collapse Button at bottom */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir painel' : 'Recolher painel'}
          className="mt-auto p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Panel Content Area */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60">
          {/* Panel Header */}
          <div className="h-10 px-3 border-b border-slate-800 flex items-center justify-between font-semibold text-xs text-white uppercase tracking-wider shrink-0">
            <span>{tabs.find((t) => t.id === activeTab)?.label}</span>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'components' && <ComponentsPanel />}
            {activeTab === 'layers' && <LayersPanel />}
            {activeTab === 'assets' && <AssetsPanel />}
            {activeTab === 'screens' && <ScreensPanel />}
            {activeTab === 'templates' && <TemplatesPanel />}
          </div>
        </div>
      )}
    </aside>
  );
};
