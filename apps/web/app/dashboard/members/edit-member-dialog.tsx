'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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

interface EditMemberDialogProps {
  member: Member | null;
  roles: Role[];
  groups: Group[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({
  member,
  roles,
  groups,
  open,
  onOpenChange,
}: EditMemberDialogProps) {
  const t = useTranslations('members');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    groupId: '',
  });

  // Update form data when member changes or dialog opens
  useEffect(() => {
    if (member && open) {
      setFormData({
        name: member.name,
        email: member.email,
        // For now, use first role/group (T081 will add multi-select)
        roleId: member.roles[0]?.role.id || '',
        groupId: member.groups[0]?.group.id || '',
      });
    }
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) return;

    setLoading(true);

    try {
      // Convert single role/group to arrays for API (T081 will add multi-select UI)
      const payload = {
        name: formData.name,
        email: formData.email,
        roleIds: formData.roleId ? [formData.roleId] : [],
        groupIds: formData.groupId ? [formData.groupId] : [],
      };

      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member');
      }

      toast.success(t('memberUpdated'));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error(error instanceof Error ? error.message : t('updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editMember')}</DialogTitle>
          <DialogDescription>
            {t('editMemberDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('role')}</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">{t('group')}</Label>
              <Select
                value={formData.groupId}
                onValueChange={(value) => setFormData({ ...formData, groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
