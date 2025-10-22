"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  category: string;
  parentId: string | null;
}

interface EditGroupDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Group[];
}

export function EditGroupDialog({
  group,
  open,
  onOpenChange,
  groups,
}: EditGroupDialogProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    parentId: "",
  });

  useEffect(() => {
    if (group && open) {
      setFormData({
        name: group.name,
        category: group.category,
        parentId: group.parentId || "",
      });
    }
  }, [group, open]);

  // Filter out the group itself and its descendants to prevent circular references
  const potentialParents = groups.filter((g) => {
    if (!group) return false;

    // Can't be its own parent
    if (g.id === group.id) return false;

    // Can't be a child of this group (would create circular reference)
    if (g.parentId === group.id) return false;

    // Only show root groups (level 0) and their children (level 1)
    if (g.parentId === null) return true;

    const parent = groups.find((p) => p.id === g.parentId);
    if (parent && parent.parentId === null) return true;

    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!group) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          parentId: formData.parentId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update group");
      }

      toast.success(t("groupUpdated"));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error(error instanceof Error ? error.message : t("updateError"));
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("editGroup")}</DialogTitle>
          <DialogDescription>{t("editGroupDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("category")}</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">{t("parent")}</Label>
              <Select
                value={formData.parentId || undefined}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectParent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noParent")}</SelectItem>
                  {potentialParents.map((g) => {
                    const isChild = g.parentId !== null;
                    return (
                      <SelectItem key={g.id} value={g.id}>
                        <span style={{ paddingLeft: isChild ? "1.5rem" : "0" }}>
                          {isChild && "└ "}
                          {g.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {t("circularReferenceHint")}
              </p>
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? t("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
