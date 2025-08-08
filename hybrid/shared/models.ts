export type Action = {
  id: string;
  name: string;
  label: string;
  icon?: string;
  color?: string;
  shortcut?: string;
};

export type Page = {
  id: string;
  type: "search" | "detail" | "form" | "tabbed";
  title?: string;
  actions?: Action[];
};
