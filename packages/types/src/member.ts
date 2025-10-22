/**
 * Member-related types
 */

export interface Member {
  id: string;
  name: string;
  email: string;
  roleId: string;
  groupId: string;
  createdAt: Date;
  role?: Role;
  group?: GroupType;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  sortOrder: number;
}

export interface GroupType {
  id: string;
  name: string;
  category: string;
}

export interface MemberInput {
  name: string;
  email: string;
  roleId: string;
  groupId: string;
}

export interface MemberFilters {
  roleId?: string;
  groupId?: string;
  search?: string;
}
