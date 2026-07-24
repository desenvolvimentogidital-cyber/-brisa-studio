export type DeviceType = 'iphone' | 'android' | 'tablet' | 'desktop' | 'custom';

export interface DevicePreset {
  id: DeviceType;
  name: string;
  width: number;
  height: number;
  type: string;
  notchType: 'dynamic-island' | 'notch' | 'punch-hole' | 'none';
  borderRadius: number;
}

export type LayoutDirection = 'none' | 'horizontal' | 'vertical' | 'grid' | 'wrap';
export type LayoutDistribution = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
export type LayoutAlignment = 'start' | 'center' | 'end' | 'stretch';

export type HorizontalConstraint = 'left' | 'right' | 'center' | 'stretch' | 'scale';
export type VerticalConstraint = 'top' | 'bottom' | 'center' | 'stretch' | 'scale';

export interface ComponentConstraints {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
  maintainAspectRatio?: boolean;
  fillParent?: boolean;
}

export type ComponentCategory =
  | 'basic'
  | 'layout'
  | 'input'
  | 'navigation'
  | 'media'
  | 'advanced';

export type ComponentType =
  // Basic
  | 'text'
  | 'button'
  | 'image'
  | 'icon'
  | 'badge'
  | 'chip'
  | 'avatar'
  | 'divider'
  // Input
  | 'input'
  | 'password'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'progressbar'
  // Layout
  | 'container'
  | 'card'
  | 'row'
  | 'column'
  | 'grid'
  | 'scroll'
  // Navigation & Bars
  | 'floating_button'
  | 'bottom_nav'
  | 'top_app_bar'
  | 'drawer'
  | 'tabs'
  // Advanced & Interactive
  | 'modal'
  | 'dialog'
  | 'snackbar'
  | 'tooltip'
  | 'video'
  | 'audio'
  | 'map'
  | 'webview'
  | 'calendar'
  | 'carousel'
  | 'lottie';

export interface BorderProperties {
  style: 'none' | 'solid' | 'dashed' | 'dotted';
  color: string;
  width: number;
  radiusTopLeft: number;
  radiusTopRight: number;
  radiusBottomRight: number;
  radiusBottomLeft: number;
  isRadiusLinked: boolean;
}

export interface ShadowProperties {
  enabled: boolean;
  color: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  inset: boolean;
}

export interface GradientProperties {
  enabled: boolean;
  type: 'linear' | 'radial';
  angle: number;
  startColor: string;
  endColor: string;
}

export interface InteractionProperties {
  onClickAction: 'none' | 'navigate' | 'open_modal' | 'show_toast' | 'go_back' | 'open_url' | 'event' | 'javascript';
  targetScreenId?: string;
  targetModalId?: string;
  toastMessage?: string;
  url?: string;
  transitionEffect?: 'slide_left' | 'slide_right' | 'fade' | 'push' | 'modal';
  /** Reference to event system action */
  eventActionId?: string;
  /** JavaScript code for the interaction (non-blocking) */
  javaScript?: string;
}

export interface CanvasComponent {
  id: string;
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  
  // Position & Box Geometry
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  groupId?: string;
  parentId?: string;

  // Padding & Margin
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  
  // Content & Typography
  content?: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  lineHeight: number;
  
  // Styling
  backgroundColor: string;
  gradient: GradientProperties;
  border: BorderProperties;
  shadow: ShadowProperties;
  backdropBlur: number;

  // Specific attributes for inputs/media/controls
  placeholder?: string;
  iconName?: string;
  iconPosition?: 'left' | 'right' | 'only';
  imageSrc?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  checked?: boolean;
  value?: number;
  minValue?: number;
  maxValue?: number;
  items?: string[]; // For bottom nav, tabs, list, carousel
  
  // Interaction
  interaction: InteractionProperties;

  // Master Component & Instance fields
  masterComponentId?: string;
  isMasterRoot?: boolean;
  overrides?: Record<string, Partial<CanvasComponent>>;

  // Children for container/row/column/group
  childrenIds?: string[];
  children?: CanvasComponent[];

  // Convenience & Runtime JS API fields
  label?: string;
  disabled?: boolean;
  borderRadius?: number;
  animation?: string;
  onClickAction?: string;

  // Auto Layout Properties
  autoLayout?: boolean;
  layoutDirection?: LayoutDirection;
  layoutDistribution?: LayoutDistribution;
  layoutAlignment?: LayoutAlignment;
  itemGap?: number;
  gridColumns?: number;
  gridRowGap?: number;
  minGap?: number;
  maxGap?: number;

  // Responsive Constraints
  constraints?: ComponentConstraints;

  // Universal Events System
  events?: Record<string, any>;
}

export interface MasterComponent {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  width: number;
  height: number;
  rootComponent: CanvasComponent;
  childrenComponents: CanvasComponent[];
  isFavorite?: boolean;
}

export interface Screen {
  id: string;
  name: string;
  backgroundColor: string;
  components: CanvasComponent[];
  isInitialScreen?: boolean;
}

export interface AssetFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  folder?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  version: string;
  device: DevicePreset;
  screens: Screen[];
  activeScreenId: string;
  assets: AssetFile[];
  masterComponents?: MasterComponent[];
  masterCategories?: string[];
  updatedAt: string;
}

export type ExportFramework =
  | 'flutter'
  | 'flutterflow'
  | 'react_native'
  | 'jetpack_compose'
  | 'swiftui'
  | 'html_tailwind'
  | 'json'
  | 'xml';

export type AppMode = 'editor' | 'prototype';
export type DevMode = 'visual' | 'hybrid' | 'code' | 'nocode' | 'database' | 'security' | 'notifications' | 'packaging';
export type StudioTheme = 'dark' | 'light';

export type ConsoleLogType = 'log' | 'warn' | 'error' | 'info';

export interface ConsoleLogItem {
  id: string;
  type: ConsoleLogType;
  message: string;
  timestamp: string;
  source?: string;
}

export interface EventLogItem {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  projectSnapshot: Project;
}

export interface GitState {
  isInitialized: boolean;
  currentBranch: string;
  branches: string[];
  commits: GitCommit[];
}
