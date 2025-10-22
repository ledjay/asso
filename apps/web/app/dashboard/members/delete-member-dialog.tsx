'use client';

import { useState } from 'react';
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
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface DeleteMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMemberDialog({
  member,
  open,
  onOpenChange,
}: DeleteMemberDialogProps) {
  const t = useTranslations('members');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!member) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete member');
      }

      toast.success(t('memberDeleted'));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error(error instanceof Error ? error.message : t('deleteError'));
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteMember')}</DialogTitle>
          <DialogDescription>
            {t('deleteConfirmation')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-medium text-gray-900">{member.name}</p>
            <p className="text-sm text-gray-600">{member.email}</p>
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? t('deleting') : tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
