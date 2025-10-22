'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateGroupDialog } from './create-group-dialog';
import { EditGroupDialog } from './edit-group-dialog';
import { DeleteGroupDialog } from './delete-group-dialog';

interface Group {
  id: string;
  name: string;
  category: string;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  children: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    members: number;
  };
}

interface GroupsTableProps {
  groups: Group[];
}

export function GroupsTable({ groups }: GroupsTableProps) {
  const t = useTranslations('groups');
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  // Organize groups into hierarchy
  const rootGroups = groups.filter((g) => g.parentId === null);
  const childGroups = groups.filter((g) => g.parentId !== null);

  // Build hierarchical structure
  const hierarchicalGroups: Array<{ group: Group; level: number }> = [];
  
  rootGroups.forEach((root) => {
    hierarchicalGroups.push({ group: root, level: 0 });
    
    // Add children
    const children = childGroups.filter((c) => c.parentId === root.id);
    children.forEach((child) => {
      hierarchicalGroups.push({ group: child, level: 1 });
    });
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('groupList')}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {t('manageDescription')}
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addGroup')}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead>{t('parent')}</TableHead>
              <TableHead>{t('children')}</TableHead>
              <TableHead>{t('members')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hierarchicalGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  {t('noGroups')}
                </TableCell>
              </TableRow>
            ) : (
              hierarchicalGroups.map(({ group, level }) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div
                      className="flex items-center"
                      style={{ paddingLeft: `${level * 2}rem` }}
                    >
                      {level > 0 && (
                        <span className="mr-2 text-gray-400">└</span>
                      )}
                      <span className="font-medium">{group.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{group.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {group.parent ? (
                      <span className="text-sm text-gray-600">
                        {group.parent.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {group.children.length > 0 ? (
                      <Badge variant="secondary">
                        {group.children.length}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{group._count.members}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGroup(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingGroup(group)}
                        disabled={group._count.members > 0 || group.children.length > 0}
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
      </div>

      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        groups={groups}
      />

      <EditGroupDialog
        group={editingGroup}
        open={!!editingGroup}
        onOpenChange={(open: boolean) => !open && setEditingGroup(null)}
        groups={groups}
      />

      <DeleteGroupDialog
        group={deletingGroup}
        open={!!deletingGroup}
        onOpenChange={(open: boolean) => !open && setDeletingGroup(null)}
      />
    </div>
  );
}
