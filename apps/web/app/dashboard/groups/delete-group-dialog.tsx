"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface Group {
  id: string;
  name: string;
  _count: {
    members: number;
  };
  children: Array<{
    id: string;
    name: string;
  }>;
}

interface DeleteGroupDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGroupDialog({
  group,
  open,
  onOpenChange,
}: DeleteGroupDialogProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!group) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete group");
      }

      toast.success(t("groupDeleted"));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error instanceof Error ? error.message : t("deleteError"));
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  const hasMembers = group._count.members > 0;
  const hasChildren = group.children.length > 0;
  const canDelete = !hasMembers && !hasChildren;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("deleteGroup")}</DialogTitle>
          <DialogDescription>
            {canDelete ? t("deleteConfirmation") : t("cannotDeleteGroup")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!canDelete && (
            <div className="rounded-lg bg-yellow-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {t("cannotDelete")}
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {hasMembers && (
                      <p>
                        • {t("hasMembers", { count: group._count.members })}
                      </p>
                    )}
                    {hasChildren && (
                      <p>
                        • {t("hasChildren", { count: group.children.length })}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-yellow-700">
                    {t("deleteHint")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {canDelete && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                {t("deleteWarning", { name: group.name })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {tCommon("cancel")}
          </Button>
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? t("deleting") : tCommon("delete")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
