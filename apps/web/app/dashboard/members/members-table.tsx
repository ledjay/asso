"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Search, Download } from "lucide-react";
import { EditMemberDialog } from "./edit-member-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";

interface Member {
  id: string;
  name: string;
  email: string;
  roles: Array<{
    role: {
      id: string;
      displayName: string;
    };
  }>;
  groups: Array<{
    group: {
      id: string;
      name: string;
    };
  }>;
  createdAt: Date;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
}

interface Group {
  id: string;
  name: string;
  category: string;
  parentId: string | null;
}

interface MembersTableProps {
  members: Member[];
  roles: Role[];
  groups: Group[];
}

export function MembersTable({ members, roles, groups }: MembersTableProps) {
  const t = useTranslations("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [includeChildGroups, setIncludeChildGroups] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const itemsPerPage = 20;

  // Filter and search members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter (has any of these roles)
      const matchesRole =
        selectedRole === "all" || member.roles.some(r => r.role.id === selectedRole);

      // Group filter (has any of these groups, optionally including descendants)
      const matchesGroup = selectedGroup === "all" || (() => {
        if (includeChildGroups) {
          // Get all descendant group IDs (will be calculated client-side for now)
          const selectedGroupObj = groups.find(g => g.id === selectedGroup);
          if (!selectedGroupObj) return false;
          
          // Find all groups that have this group as parent (direct children)
          const childGroupIds = groups
            .filter(g => g.parentId === selectedGroup)
            .map(g => g.id);
          
          // Check if member belongs to selected group or any of its children
          return member.groups.some(mg => 
            mg.group.id === selectedGroup || childGroupIds.includes(mg.group.id)
          );
        }
        
        // Without includeChildGroups, just check direct membership
        return member.groups.some(g => g.group.id === selectedGroup);
      })();

      return matchesSearch && matchesRole && matchesGroup;
    });
  }, [members, searchQuery, selectedRole, selectedGroup, includeChildGroups, groups]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, selectedGroup]);

  const handleEdit = (member: Member) => {
    setEditingMember(member);
  };

  const handleDelete = (member: Member) => {
    setDeletingMember(member);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/members/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `membres-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting members:", error);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow">
      <div className="p-6">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('memberList')}
              </h2>
              <p className="text-sm text-gray-600">
                {filteredMembers.length} membre
                {filteredMembers.length > 1 ? "s" : ""}
                {filteredMembers.length !== members.length &&
                  ` sur ${members.length} au total`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={members.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("exportMembers")}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role filter */}
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder={t("filterByRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allRoles")}</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Group filter with hierarchy */}
            <div className="space-y-2">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filterByGroup")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allGroups")}</SelectItem>
                  {groups.map((group) => {
                    // Calculate indentation based on whether it has a parent
                    const isChild = group.parentId !== null;
                    return (
                      <SelectItem key={group.id} value={group.id}>
                        <span style={{ paddingLeft: isChild ? '1.5rem' : '0' }}>
                          {isChild && '└ '}{group.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Include child groups checkbox */}
              {selectedGroup !== "all" && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeChildGroups}
                    onChange={(e) => setIncludeChildGroups(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{t("includeChildGroups")}</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("group")}</TableHead>
              <TableHead>{t("dateAdded")}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  {t('noMembersFound')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles.slice(0, 3).map((memberRole, idx) => (
                        <Badge key={idx} variant="secondary">
                          {memberRole.role.displayName}
                        </Badge>
                      ))}
                      {member.roles.length > 3 && (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                          +{member.roles.length - 3}
                        </Badge>
                      )}
                      {member.roles.length === 0 && (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.groups.slice(0, 3).map((memberGroup, idx) => (
                        <Badge key={idx} variant="outline">
                          {memberGroup.group.name}
                        </Badge>
                      ))}
                      {member.groups.length > 3 && (
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          +{member.groups.length - 3}
                        </Badge>
                      )}
                      {member.groups.length === 0 && (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-gray-600">
              {t('pageOf', { current: currentPage, total: totalPages })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditMemberDialog
        member={editingMember}
        roles={roles}
        groups={groups}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
      />

      {/* Delete Dialog */}
      <DeleteMemberDialog
        member={deletingMember}
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
      />
    </div>
  );
}
