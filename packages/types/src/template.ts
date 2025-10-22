/**
 * Template-related types
 */

export type TemplateType = "parents" | "sports" | "cultural";

export interface TemplateSelection {
  template: TemplateType;
}

export interface TemplateData {
  roles: Array<{
    name: string;
    displayName: string;
    sortOrder: number;
  }>;
  groups: Array<{
    name: string;
    category: string;
  }>;
}
