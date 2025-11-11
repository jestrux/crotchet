import {
  ActionRegistration,
  Widget,
  Section,
  Page,
  ActionRegistry,
  WidgetRegistry,
  SectionRegistry,
  PageRegistry,
} from '@/types';

// Global registries
const actions: ActionRegistry = {};
const widgets: WidgetRegistry = {};
const sections: SectionRegistry = {};
const pages: PageRegistry = {};

// Event emitter for updates
type EventCallback = (payload?: any) => void;
const eventListeners: { [key: string]: EventCallback[] } = {};

// Registration functions
export function registerAction(name: string, action: ActionRegistration | Function) {
  if (typeof action === 'function') {
    actions[name] = { handler: action as any };
  } else {
    actions[name] = action;
  }
  dispatch('action-registered', { name, action });
}

export function registerWidget(name: string, widget: Widget) {
  widgets[name] = widget;
  dispatch('widget-registered', { name, widget });
}

export function registerSection(name: string, section: Section) {
  sections[name] = section;
  dispatch('section-registered', { name, section });
}

export function registerPage(name: string, page: Page) {
  pages[name] = page;
  dispatch('page-registered', { name, page });
}

// Event system
export function dispatch(event: string, payload?: any) {
  const listeners = eventListeners[event] || [];
  listeners.forEach((callback) => {
    try {
      callback(payload);
    } catch (error) {
      console.error(`Error in event listener for ${event}:`, error);
    }
  });
}

export function listen(event: string, callback: EventCallback): () => void {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);

  // Return unsubscribe function
  return () => {
    const index = eventListeners[event].indexOf(callback);
    if (index > -1) {
      eventListeners[event].splice(index, 1);
    }
  };
}

// Getters
export function getActions(): ActionRegistry {
  return { ...actions };
}

export function getAction(name: string): ActionRegistration | undefined {
  return actions[name];
}

export function getWidgets(): WidgetRegistry {
  return { ...widgets };
}

export function getWidget(name: string): Widget | undefined {
  return widgets[name];
}

export function getSections(): SectionRegistry {
  return { ...sections };
}

export function getSection(name: string): Section | undefined {
  return sections[name];
}

export function getPages(): PageRegistry {
  return { ...pages };
}

export function getPage(name: string): Page | undefined {
  return pages[name];
}

// Search actions
export function searchActions(query: string, context?: string): ActionRegistration[] {
  const lowerQuery = query.toLowerCase();
  return Object.entries(actions)
    .filter(([name, action]) => {
      // Filter by context if specified
      if (context && action.context && action.context !== context) {
        return false;
      }

      // Search by name and label
      const matchName = name.toLowerCase().includes(lowerQuery);
      const matchLabel = action.label?.toLowerCase().includes(lowerQuery);
      const matchTags = action.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));

      return matchName || matchLabel || matchTags;
    })
    .map(([, action]) => action);
}

// Helper to get shortcuts (actions with shortcut context)
export function getShortcuts(): ActionRegistration[] {
  return Object.values(actions).filter((action) => action.context === 'shortcut');
}

// Helper to get search actions
export function getSearchActions(): ActionRegistration[] {
  return Object.values(actions).filter((action) => action.context === 'search');
}
