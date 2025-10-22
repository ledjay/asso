/**
 * Email-related types
 */

export interface EmailCampaign {
  id: string;
  subject: string;
  bodyTemplate: string;
  attachmentUrl: string | null;
  recipientCount: number;
  sentAt: Date;
  userId: string;
}

export interface EmailComposerData {
  subject: string;
  body: string;
  attachmentUrl?: string;
  roleId?: string;
  groupId?: string;
}

export interface EmailSendResult {
  success: boolean;
  recipientCount: number;
  campaignId: string;
}
