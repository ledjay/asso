/**
 * Email types for AssociationHub
 */

export interface EmailParams {
  to: string[];
  subject: string;
  body: string;
  attachment?: {
    filename: string;
    url: string;
  };
}

export interface TemplateData {
  Nom: string;
  Role: string;
  Group: string;
}
