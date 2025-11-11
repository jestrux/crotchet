// Core data types
export type DataItem = {
  icon?: string | null;
  video?: string | null;
  image?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  url?: string | null;
  share?: string | null;
  actions?: ActionButton[] | (() => ActionButton[]);
  meta?: { [key: string]: any };
  status?:
    | "success"
    | "verified"
    | "approved"
    | "completed"
    | "complete"
    | "done"
    | "true"
    | true
    | 1
    | "1"
    | null
    | "error"
    | "blocked"
    | "0"
    | 0
    | false
    | "false"
    | "in progress"
    | "pending";
  trailing?: string | null;
  progress?: number | null;
  checked?: boolean | null;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onHold?: () => void;
  onRemove?: () => void;
};

export type ActionButton = {
  label?: string;
  icon?: string;
  url?: string | null;
  destructive?: boolean;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  handler?: (payload?: any) => any;
};

export type WidgetPayload = {
  loading?: boolean;
  data?: any;
};

export type WidgetActionContext = {
  data?: any | null;
  loading?: boolean | null;
  refetch: () => void;
  state?: { [key: string]: any };
  setState?: (key: string, value: any) => void;
};

export type Widget = {
  shortcut?: string;
  handler?: (payload: any) => Promise<any>;
  label?: string;
  title?: string | ((payload: WidgetPayload) => string | undefined | null);
  icon?: string;
  actions: ActionButton[] | ((payload: WidgetPayload) => ActionButton[]);
  supportedSizes?: string;
  background?: string;
  color?: string;
  source?: string;
  resolve?: (payload?: any) => Promise<any>;
  listenForUpdates?: string | string[] | ((callback: () => void) => Function);
  filter?: { [key: string]: any } | ((payload: any) => any);
  content?: any;
  actionButton?: ActionButton;
  onSwipe?: (payload: WidgetActionContext & { direction: 1 | -1 }) => any;
  onClick?: any;
  entryAction?: (payload: any) => any;
  entryActions?: (payload: any) => ActionButton[];
};

export type ActionRegistration = {
  shortcut?: string;
  icon?: string;
  color?: string;
  label?: string;
  source?: string;
  context?: "share" | "shortcut" | "search";
  global?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  match?: "url" | "text" | ((payload: any) => boolean | null | undefined);
  actions?: ActionButton[] | (() => ActionButton[]);
  preview?: (() => any) | any;
  handler?: (payload: any) => Promise<any> | void;
  url?: string;
  tags?: string[];
  section?: string;
};

export type Section = {
  type?: "grid" | "list" | "actions" | null;
  title?: string;
  resolve?: (payload?: any) => Promise<any>;
  listenForUpdates?: string | string[] | ((callback: () => void) => Function);
  meta?: { [key: string]: any };
};

export type PageType = "search" | "preview" | "detail" | "form";

export type Page = {
  type?: PageType;
  title?: string;
  layout?: "list" | "grid" | "masonry";
  content?: any;
  preview?: any;
  tabs?: any[];
  nav?: any[];
  actions?: ActionButton[];
  toolbar?: (ActionButton & { flex?: boolean })[];
  onSearch?: (value?: string) => Promise<any>;
  onReady?: (payload: any) => void;
  onClose?: (payload: any) => void;
};

// Global registry types
export type ActionRegistry = {
  [key: string]: ActionRegistration;
};

export type WidgetRegistry = {
  [key: string]: Widget;
};

export type SectionRegistry = {
  [key: string]: Section;
};

export type PageRegistry = {
  [key: string]: Page;
};
