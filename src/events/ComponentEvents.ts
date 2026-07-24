// ==========================================
// Mobile Studio - Universal Component Events v2.0
// ==========================================
// This is the SINGLE source of truth for all component events.
// Every component inherits this interface automatically.
// DO NOT define events per component.

/**
 * All supported event types for any component.
 * This is the universal event definition used by:
 * - Editor Visual (No-Code)
 * - JavaScript SDK
 * - Runtime Universal
 * - Intermediate Representation (IR)
 * - All Exporters
 */
export type ComponentEventType =
  // Mouse Events
  | 'onClick'
  | 'onDoubleClick'
  | 'onRightClick'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'onMouseMove'
  | 'onWheel'
  // Touch Events
  | 'onTap'
  | 'onDoubleTap'
  | 'onLongPress'
  | 'onSwipe'
  | 'onSwipeLeft'
  | 'onSwipeRight'
  | 'onSwipeUp'
  | 'onSwipeDown'
  // Keyboard Events
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onKeyPress'
  // Focus Events
  | 'onFocus'
  | 'onBlur'
  // Input Events
  | 'onChange'
  | 'onInput'
  | 'onSubmit'
  // Drag Events
  | 'onDragStart'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDrop'
  // Lifecycle Events
  | 'onCreate'
  | 'onMount'
  | 'onShow'
  | 'onHide'
  | 'onDestroy'
  // Visibility Events
  | 'onVisible'
  | 'onInvisible'
  // Timer Events
  | 'onTimer'
  | 'onInterval'
  // Animation Events
  | 'onAnimationStart'
  | 'onAnimationEnd'
  // Custom Events
  | 'onCustom'
  // Legacy compatibility
  | 'onLoad'
  | 'onHover'
  | 'onPressIn'
  | 'onPressOut'
  | 'onValueChange'
  | 'onSelectionChange'
  | 'onToggle'
  | 'onSlide'
  | 'onTabChange'
  | 'onExpand'
  | 'onCollapse'
  | 'onClose'
  | 'onOpen'
  | 'onScroll'
  | 'onRefresh'
  | 'onError';

/**
 * Event categories for UI organization
 */
export const EVENT_CATEGORIES: Record<string, ComponentEventType[]> = {
  Mouse: ['onClick', 'onDoubleClick', 'onRightClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onWheel'],
  Touch: ['onTap', 'onDoubleTap', 'onLongPress', 'onSwipe', 'onSwipeLeft', 'onSwipeRight', 'onSwipeUp', 'onSwipeDown'],
  Keyboard: ['onKeyDown', 'onKeyUp', 'onKeyPress'],
  Focus: ['onFocus', 'onBlur'],
  Input: ['onChange', 'onInput', 'onSubmit'],
  Drag: ['onDragStart', 'onDrag', 'onDragEnd', 'onDrop'],
  Lifecycle: ['onCreate', 'onMount', 'onShow', 'onHide', 'onDestroy'],
  Visibility: ['onVisible', 'onInvisible'],
  Timer: ['onTimer', 'onInterval'],
  Animation: ['onAnimationStart', 'onAnimationEnd'],
  Custom: ['onCustom'],
  Legacy: ['onLoad', 'onHover', 'onPressIn', 'onPressOut', 'onValueChange', 'onSelectionChange',
           'onToggle', 'onSlide', 'onTabChange', 'onExpand', 'onCollapse', 'onClose', 'onOpen',
           'onScroll', 'onRefresh', 'onError'],
};

/**
 * All event types in a flat list for iteration
 */
export const ALL_COMPONENT_EVENTS: ComponentEventType[] = [
  // Mouse
  'onClick', 'onDoubleClick', 'onRightClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onWheel',
  // Touch
  'onTap', 'onDoubleTap', 'onLongPress', 'onSwipe', 'onSwipeLeft', 'onSwipeRight', 'onSwipeUp', 'onSwipeDown',
  // Keyboard
  'onKeyDown', 'onKeyUp', 'onKeyPress',
  // Focus
  'onFocus', 'onBlur',
  // Input
  'onChange', 'onInput', 'onSubmit',
  // Drag
  'onDragStart', 'onDrag', 'onDragEnd', 'onDrop',
  // Lifecycle
  'onCreate', 'onMount', 'onShow', 'onHide', 'onDestroy',
  // Visibility
  'onVisible', 'onInvisible',
  // Timer
  'onTimer', 'onInterval',
  // Animation
  'onAnimationStart', 'onAnimationEnd',
  // Custom
  'onCustom',
  // Legacy
  'onLoad', 'onHover', 'onPressIn', 'onPressOut', 'onValueChange', 'onSelectionChange',
  'onToggle', 'onSlide', 'onTabChange', 'onExpand', 'onCollapse', 'onClose', 'onOpen',
  'onScroll', 'onRefresh', 'onError',
];

/**
 * Human-readable labels for each event type
 */
export const EVENT_LABELS: Record<ComponentEventType, string> = {
  // Mouse
  onClick: 'Ao Clicar',
  onDoubleClick: 'Ao Clicar Duas Vezes',
  onRightClick: 'Ao Clicar Direito',
  onMouseEnter: 'Mouse Entrou',
  onMouseLeave: 'Mouse Saiu',
  onMouseMove: 'Mouse Moveu',
  onWheel: 'Roda do Mouse',
  // Touch
  onTap: 'Ao Tocar',
  onDoubleTap: 'Ao Tocar Duas Vezes',
  onLongPress: 'Ao Pressionar Longo',
  onSwipe: 'Ao Deslizar',
  onSwipeLeft: 'Deslizar Esquerda',
  onSwipeRight: 'Deslizar Direita',
  onSwipeUp: 'Deslizar Cima',
  onSwipeDown: 'Deslizar Baixo',
  // Keyboard
  onKeyDown: 'Tecla Pressionada',
  onKeyUp: 'Tecla Solta',
  onKeyPress: 'Tecla Pressionada (contínuo)',
  // Focus
  onFocus: 'Ao Focar',
  onBlur: 'Ao Desfocar',
  // Input
  onChange: 'Ao Alterar',
  onInput: 'Ao Digitar',
  onSubmit: 'Ao Enviar',
  // Drag
  onDragStart: 'Início Arrasto',
  onDrag: 'Arrastando',
  onDragEnd: 'Fim Arrasto',
  onDrop: 'Ao Soltar',
  // Lifecycle
  onCreate: 'Ao Criar',
  onMount: 'Ao Montar',
  onShow: 'Ao Mostrar',
  onHide: 'Ao Ocultar',
  onDestroy: 'Ao Destruir',
  // Visibility
  onVisible: 'Ao Ficar Visível',
  onInvisible: 'Ao Ficar Invisível',
  // Timer
  onTimer: 'Temporizador',
  onInterval: 'Intervalo',
  // Animation
  onAnimationStart: 'Início Animação',
  onAnimationEnd: 'Fim Animação',
  // Custom
  onCustom: 'Evento Personalizado',
  // Legacy
  onLoad: 'Ao Carregar',
  onHover: 'Ao Passar Mouse',
  onPressIn: 'Ao Pressionar',
  onPressOut: 'Ao Soltar',
  onValueChange: 'Ao Mudar Valor',
  onSelectionChange: 'Ao Selecionar',
  onToggle: 'Ao Alternar',
  onSlide: 'Ao Arrastar',
  onTabChange: 'Ao Mudar Aba',
  onExpand: 'Ao Expandir',
  onCollapse: 'Ao Recolher',
  onClose: 'Ao Fechar',
  onOpen: 'Ao Abrir',
  onScroll: 'Ao Rolar',
  onRefresh: 'Ao Atualizar',
  onError: 'Ao Erro',
};

/**
 * Type of action that can be executed on an event
 */
export type EventActionType =
  | 'no_code_flow'
  | 'javascript'
  | 'both'
  | 'navigation'
  | 'toast'
  | 'custom'
  | 'api_request'
  | 'database'
  | 'auth'
  | 'animation'
  | 'notification';

/**
 * Event variable context available during execution
 */
export interface EventContext {
  event: any;
  target: any;
  currentTarget: any;
  mouseX?: number;
  mouseY?: number;
  touchX?: number;
  touchY?: number;
  key?: string;
  value?: any;
  checked?: boolean;
  timestamp: number;
  componentId: string;
  screenId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Condition for conditional event execution
 */
export interface EventCondition {
  id: string;
  variable: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith' | 'empty' | 'notEmpty';
  value: any;
  thenActions: EventAction[];
  elseActions?: EventAction[];
}

/**
 * An action configuration for an event handler
 */
export interface EventAction {
  id: string;
  type: EventActionType;
  /** For 'no_code_flow' - the flow ID to execute */
  flowId?: string;
  /** For 'javascript' - raw JavaScript code */
  javaScript?: string;
  /** For 'navigation' - target screen */
  targetScreenId?: string;
  /** For 'toast' - message to show */
  toastMessage?: string;
  /** For 'both' - chain flow then JS */
  chainFlowId?: string;
  chainJavaScript?: string;
  /** For 'api_request' */
  apiUrl?: string;
  apiMethod?: string;
  apiBody?: string;
  /** For 'database' */
  dbOperation?: 'create' | 'read' | 'update' | 'delete' | 'query';
  dbCollection?: string;
  dbRecord?: string;
  /** For 'auth' */
  authOperation?: 'login' | 'logout' | 'register';
  /** For 'animation' */
  animationType?: string;
  animationTarget?: string;
  /** For 'notification' */
  notificationTitle?: string;
  notificationMessage?: string;
  /** Is this action disabled */
  disabled: boolean;
  /** Custom label for the action */
  label?: string;
  /** Comment for documentation */
  comment?: string;
  /** Priority for ordering */
  priority?: number;
  /** Timestamp of creation */
  createdAt: number;
}

/**
 * Configuration for a single event on a component
 * Each event can have multiple actions that execute in sequence
 */
export interface ComponentEventConfig {
  /** Whether this event is enabled */
  enabled: boolean;
  /** List of actions to execute when this event fires */
  actions: EventAction[];
  /** Optional conditions for conditional execution */
  conditions?: EventCondition[];
  /** If true, stop execution on first error */
  haltOnError: boolean;
  /** If true, execute actions in parallel */
  parallel: boolean;
  /** Execution mode: 'sequential' | 'parallel' | 'race' */
  executionMode: 'sequential' | 'parallel' | 'race';
  /** Optional debounce in ms */
  debounceMs?: number;
  /** Optional throttle in ms */
  throttleMs?: number;
  /** Priority for event ordering */
  priority?: number;
  /** Event variables available during execution */
  variables?: Record<string, any>;
  /** Event metadata */
  metadata?: {
    description?: string;
    createdAt?: number;
    updatedAt?: number;
  };
}

/**
 * Universal component events map.
 * Every component instance has this structure for its events.
 */
export interface ComponentEvents {
  // Mouse
  onClick?: ComponentEventConfig;
  onDoubleClick?: ComponentEventConfig;
  onRightClick?: ComponentEventConfig;
  onMouseEnter?: ComponentEventConfig;
  onMouseLeave?: ComponentEventConfig;
  onMouseMove?: ComponentEventConfig;
  onWheel?: ComponentEventConfig;
  // Touch
  onTap?: ComponentEventConfig;
  onDoubleTap?: ComponentEventConfig;
  onLongPress?: ComponentEventConfig;
  onSwipe?: ComponentEventConfig;
  onSwipeLeft?: ComponentEventConfig;
  onSwipeRight?: ComponentEventConfig;
  onSwipeUp?: ComponentEventConfig;
  onSwipeDown?: ComponentEventConfig;
  // Keyboard
  onKeyDown?: ComponentEventConfig;
  onKeyUp?: ComponentEventConfig;
  onKeyPress?: ComponentEventConfig;
  // Focus
  onFocus?: ComponentEventConfig;
  onBlur?: ComponentEventConfig;
  // Input
  onChange?: ComponentEventConfig;
  onInput?: ComponentEventConfig;
  onSubmit?: ComponentEventConfig;
  // Drag
  onDragStart?: ComponentEventConfig;
  onDrag?: ComponentEventConfig;
  onDragEnd?: ComponentEventConfig;
  onDrop?: ComponentEventConfig;
  // Lifecycle
  onCreate?: ComponentEventConfig;
  onMount?: ComponentEventConfig;
  onShow?: ComponentEventConfig;
  onHide?: ComponentEventConfig;
  onDestroy?: ComponentEventConfig;
  // Visibility
  onVisible?: ComponentEventConfig;
  onInvisible?: ComponentEventConfig;
  // Timer
  onTimer?: ComponentEventConfig;
  onInterval?: ComponentEventConfig;
  // Animation
  onAnimationStart?: ComponentEventConfig;
  onAnimationEnd?: ComponentEventConfig;
  // Custom
  onCustom?: ComponentEventConfig;
  // Legacy
  onLoad?: ComponentEventConfig;
  onHover?: ComponentEventConfig;
  onPressIn?: ComponentEventConfig;
  onPressOut?: ComponentEventConfig;
  onValueChange?: ComponentEventConfig;
  onSelectionChange?: ComponentEventConfig;
  onToggle?: ComponentEventConfig;
  onSlide?: ComponentEventConfig;
  onTabChange?: ComponentEventConfig;
  onExpand?: ComponentEventConfig;
  onCollapse?: ComponentEventConfig;
  onClose?: ComponentEventConfig;
  onOpen?: ComponentEventConfig;
  onScroll?: ComponentEventConfig;
  onRefresh?: ComponentEventConfig;
  onError?: ComponentEventConfig;
}

/**
 * Create a default/empty ComponentEventConfig
 */
export function createDefaultEventConfig(): ComponentEventConfig {
  return {
    enabled: false,
    actions: [],
    conditions: [],
    haltOnError: false,
    parallel: false,
    executionMode: 'sequential',
    priority: 0,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Create a default event action
 */
export function createEventAction(
  type: EventActionType = 'no_code_flow',
  overrides: Partial<EventAction> = {}
): EventAction {
  return {
    id: `evt_action_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    type,
    disabled: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create an event condition
 */
export function createEventCondition(
  variable: string = '',
  operator: EventCondition['operator'] = '==',
  value: any = ''
): EventCondition {
  return {
    id: `evt_cond_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    variable,
    operator,
    value,
    thenActions: [],
    elseActions: [],
  };
}

/**
 * Create an EventContext with default values
 */
export function createEventContext(
  componentId: string,
  overrides: Partial<EventContext> = {}
): EventContext {
  return {
    event: null,
    target: null,
    currentTarget: null,
    timestamp: Date.now(),
    componentId,
    ...overrides,
  };
}

/**
 * Check if a component type supports a specific event type
 * null = all components support this event
 */
const EVENT_COMPONENT_FILTER: Partial<Record<ComponentEventType, string[]>> = {
  onChange: ['input', 'password', 'checkbox', 'radio', 'switch', 'slider', 'progressbar',
              'tabs', 'carousel', 'calendar', 'grid', 'list'],
  onInput: ['input', 'password', 'textarea'],
  onFocus: ['input', 'password', 'textarea', 'checkbox', 'radio', 'switch', 'slider'],
  onBlur: ['input', 'password', 'textarea', 'checkbox', 'radio', 'switch', 'slider'],
  onSubmit: ['input', 'password', 'textarea'],
  onValueChange: ['slider', 'progressbar', 'switch', 'checkbox', 'radio'],
  onSelectionChange: ['grid', 'list', 'tabs', 'carousel'],
  onToggle: ['switch', 'checkbox', 'radio'],
  onSlide: ['slider'],
  onKeyDown: ['input', 'password', 'textarea'],
  onKeyUp: ['input', 'password', 'textarea'],
  onKeyPress: ['input', 'password', 'textarea'],
  onScroll: ['container', 'card', 'row', 'column', 'grid', 'scroll', 'list'],
  onExpand: ['container', 'card', 'row', 'column'],
  onCollapse: ['container', 'card', 'row', 'column'],
  onClose: ['modal', 'dialog', 'drawer', 'snackbar'],
  onOpen: ['modal', 'dialog', 'drawer', 'snackbar'],
  onTabChange: ['tabs', 'carousel'],
  onRefresh: ['scroll', 'list', 'grid'],
  onSwipe: ['card', 'container', 'image', 'carousel'],
  onSwipeLeft: ['card', 'container', 'image', 'carousel'],
  onSwipeRight: ['card', 'container', 'image', 'carousel'],
  onSwipeUp: ['card', 'container', 'image', 'carousel'],
  onSwipeDown: ['card', 'container', 'image', 'carousel'],
  onDragStart: ['card', 'container', 'image', 'row', 'column'],
  onDrag: ['card', 'container', 'image', 'row', 'column'],
  onDragEnd: ['card', 'container', 'image', 'row', 'column'],
  onDrop: ['container', 'card', 'row', 'column', 'grid'],
  onLoad: ['image', 'video', 'audio', 'webview', 'map', 'lottie'],
  onError: ['image', 'video', 'audio', 'webview', 'map'],
  onTimer: ['text', 'button', 'container', 'card', 'image', 'icon'],
  onInterval: ['text', 'button', 'container', 'card', 'image', 'icon'],
  onAnimationStart: ['text', 'button', 'image', 'icon', 'container', 'card'],
  onAnimationEnd: ['text', 'button', 'image', 'icon', 'container', 'card'],
};

export function componentSupportsEvent(
  componentType: string,
  eventType: ComponentEventType
): boolean {
  const filter = EVENT_COMPONENT_FILTER[eventType];
  if (!filter) return true; // null = all components
  return filter.includes(componentType);
}

/**
 * Get all supported events for a component type
 */
export function getEventsForComponent(componentType: string): ComponentEventType[] {
  return ALL_COMPONENT_EVENTS.filter((evt) => componentSupportsEvent(componentType, evt));
}

/**
 * Get event context variables available for an event
 */
export function getEventContextVariables(): string[] {
  return [
    'event', 'target', 'currentTarget',
    'mouseX', 'mouseY', 'touchX', 'touchY',
    'key', 'value', 'checked',
    'timestamp', 'componentId', 'screenId', 'userId',
  ];
}