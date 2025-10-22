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

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Group[];
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  groups,
}: CreateGroupDialogProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    parentId: "",
  });

  // Only show root groups (level 0) and their children (level 1) as parent options
  // This enforces max 3 levels: root -> child -> grandchild
  const potentialParents = groups.filter((g) => {
    // Root groups (level 0) can be parents
    if (g.parentId === null) return true;

    // Children of root groups (level 1) can be parents
    const parent = groups.find((p) => p.id === g.parentId);
    if (parent && parent.parentId === null) return true;

    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast.error(t("fillAllFields"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          parentId: formData.parentId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create group");
      }

      toast.success(t("groupCreated"));
      setFormData({ name: "", category: "", parentId: "" });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error instanceof Error ? error.message : t("createError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addGroup")}</DialogTitle>
          <DialogDescription>{t("addGroupDescription")}</DialogDescription>
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
                placeholder={t("namePlaceholder")}
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
                placeholder={t("categoryPlaceholder")}
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
                  {potentialParents.map((group) => {
                    const isChild = group.parentId !== null;
                    return (
                      <SelectItem key={group.id} value={group.id}>
                        <span style={{ paddingLeft: isChild ? "1.5rem" : "0" }}>
                          {isChild && "└ "}
                          {group.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{t("maxDepthHint")}</p>
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
              {loading ? t("creating") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
