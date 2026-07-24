import React from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import { TopBar } from './components/topbar/TopBar';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { CanvasContainer } from './components/canvas/CanvasContainer';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { CodeWorkspace } from './components/codeEditor/CodeWorkspace';
import { NoCodeLogicBuilder } from './components/nocode/NoCodeLogicBuilder';
import { DatabaseDesigner } from './components/database/DatabaseDesigner';
import { AuthSecurityDesigner } from './components/security/AuthSecurityDesigner';
import { NotificationCenterDesigner } from './components/notifications/NotificationCenterDesigner';
import { CodeExportModal } from './components/modals/CodeExportModal';
import { PrototypeModal } from './components/modals/PrototypeModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { WelcomeModal } from './components/modals/WelcomeModal';
import { FeedbackModal } from './components/modals/FeedbackModal';
import { OfficialReleaseWebsite } from './components/deployment/OfficialReleaseWebsite';
import { DocumentationCenter } from './components/documentation/DocumentationCenter';
import { CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    theme,
    devMode,
    activeToast,
    isWelcomeModalOpen,
    setIsWelcomeModalOpen,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    isWebsitePortalOpen,
    setIsWebsitePortalOpen,
    isDocumentationOpen,
    setIsDocumentationOpen,
    documentationArticleId,
    showToast,
  } = useEditor();

  if (isWebsitePortalOpen) {
    return (
      <OfficialReleaseWebsite
        onBackToStudio={() => setIsWebsitePortalOpen(false)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />
    );
  }

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden font-sans select-none ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Header */}
      <TopBar />

      {/* Main Studio Viewport (Visual Mode, Code Workspace, or No-Code Flow Builder) */}
      <div className="flex-1 flex overflow-hidden relative">
        {devMode === 'visual' ? (
          <>
            <LeftSidebar />
            <CanvasContainer />
            <PropertiesPanel />
          </>
        ) : devMode === 'nocode' ? (
          <NoCodeLogicBuilder />
        ) : devMode === 'database' ? (
          <DatabaseDesigner />
        ) : devMode === 'security' ? (
          <AuthSecurityDesigner />
        ) : devMode === 'notifications' ? (
          <NotificationCenterDesigner />
        ) : (
          <CodeWorkspace />
        )}
      </div>

      {/* Floating Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-slate-700/80 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce border-blue-500/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* Documentation Center */}
      <DocumentationCenter
        isOpen={isDocumentationOpen}
        onClose={() => setIsDocumentationOpen(false)}
        initialArticleId={documentationArticleId}
      />

      {/* Modals & Dialogs */}
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onShowToast={showToast}
      />
      <CodeExportModal />
      <PrototypeModal />
      <CommandPalette />
      <ShortcutsModal />
    </div>
  );
};

export default function App() {
  return (
    <EditorProvider>
      <MainAppContent />
    </EditorProvider>
  );
}
