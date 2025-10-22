'use client';

import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Member {
  id: string;
  name: string;
  email: string;
  role: {
    displayName: string;
  };
  group: {
    name: string;
  };
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
}

interface MembersTableProps {
  members: Member[];
  roles: Role[];
  groups: Group[];
}

export function MembersTable({ members, roles, groups }: MembersTableProps) {
  const t = useTranslations('members');
  return (
    <div className="rounded-lg border bg-white shadow">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des membres
            </h2>
            <p className="text-sm text-gray-600">
              {members.length} membre{members.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('group')}</TableHead>
              <TableHead>{t('dateAdded')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{member.role.displayName}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{member.group.name}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
