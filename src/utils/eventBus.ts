export type StudioEventType =
  | 'ComponentCreated'
  | 'ComponentUpdated'
  | 'ComponentDeleted'
  | 'ComponentMoved'
  | 'ScreenCreated'
  | 'ScreenDeleted'
  | 'ProjectSaved'
  | 'ProjectOpened'
  | 'ExportStarted'
  | 'ExportFinished'
  | 'DatabaseConnected'
  | 'ApiRequestFinished'
  | 'NotificationSent'
  | 'NoCodeBlockExecuted'
  | 'PluginRegistered'
  | 'PluginUnregistered'
  | 'PackagingUpdated'
  | 'BuildStarted'
  | 'BuildCompleted'
  | 'BuildFailed'
  | 'AssetProcessed'
  | 'PermissionUpdated'
  | 'EnvironmentChanged'
  | 'ProductionOptimized'
  | 'ExportGenerated'
  | 'VersionCreated'
  | 'CollaborationOperation'
  | 'CollaborationPresence'
  | 'CollaborationMention'
  | 'GitCommitCreated'
  | 'PipelineCompleted'
  | 'AppPublished';

export interface StudioEventPayload {
  type: StudioEventType;
  timestamp: number;
  data?: any;
}

export type StudioEventListener = (event: StudioEventPayload) => void;

class StudioEventBus {
  private listeners: Map<StudioEventType, Set<StudioEventListener>> = new Map();

  subscribe(type: StudioEventType, listener: StudioEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.unsubscribe(type, listener);
    };
  }

  unsubscribe(type: StudioEventType, listener: StudioEventListener): void {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(listener);
    }
  }

  publish(type: StudioEventType, data?: any): void {
    const payload: StudioEventPayload = {
      type,
      timestamp: Date.now(),
      data,
    };
    const set = this.listeners.get(type);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[EventBus] Error in listener for event ${type}:`, err);
        }
      });
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const studioEventBus = new StudioEventBus();
