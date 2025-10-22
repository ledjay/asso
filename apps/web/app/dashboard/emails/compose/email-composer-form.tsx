"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

interface EmailComposerFormProps {
  roles: Role[];
  groups: Group[];
}

export function EmailComposerForm({ roles, groups }: EmailComposerFormProps) {
  const router = useRouter();
  const t = useTranslations("emails");
  const tCommon = useTranslations("common");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [isSending, setIsSending] = useState(false);

  const insertTag = (tag: string) => {
    const textarea = document.getElementById(
      "email-body"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = body;
    const before = text.substring(0, start);
    const after = text.substring(end);

    setBody(before + tag + after);

    // Set cursor position after inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error(t("subjectRequired"));
      return;
    }

    if (!body.trim()) {
      toast.error(t("bodyRequired"));
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          roleId: selectedRole === "all" ? null : selectedRole,
          groupId: selectedGroup === "all" ? null : selectedGroup,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      toast.success(t("sendSuccess", { count: data.sent }));

      // Trigger confetti animation for celebration! 🎉
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Check if this is the first email sent (show extra celebration)
      const isFirstEmail = data.isFirstEmail || false;
      if (isFirstEmail) {
        // Extra confetti burst for first email!
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 120,
            origin: { y: 0.5 },
            colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
          });
        }, 300);
      }

      // Redirect to dashboard after a short delay to enjoy the confetti
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Send error:", error);
      toast.error(error instanceof Error ? error.message : t("sendError"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main composer */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("message")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">{t("subject")}</Label>
              <Input
                id="subject"
                placeholder={t("subjectPlaceholder")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">{t("body")}</Label>
              <Textarea
                id="email-body"
                placeholder={t("bodyPlaceholder")}
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <p className="text-xs text-gray-500">{t("useTemplateTags")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recipients")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t("filterByRole")}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t("allRoles")} />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">{t("filterByGroup")}</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder={t("allGroups")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allGroups")}</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isSending}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? t("sending") : t("send")}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("templateTags")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600 mb-4">{t("clickToInsert")}</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => insertTag("{Nom}")}
              >
                <Badge variant="secondary" className="mr-2">
                  {"{Nom}"}
                </Badge>
                {t("memberName")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => insertTag("{Role}")}
              >
                <Badge variant="secondary" className="mr-2">
                  {"{Role}"}
                </Badge>
                {t("memberRole")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => insertTag("{Groupe}")}
              >
                <Badge variant="secondary" className="mr-2">
                  {"{Groupe}"}
                </Badge>
                {t("memberGroup")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("example")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-900 mb-2">
                Bonjour {"{Nom}"},
              </p>
              <p className="text-gray-700 mb-2">
                En tant que {"{Role}"} de {"{Groupe}"}, nous vous informons...
              </p>
              <p className="text-gray-700">Cordialement,</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t("tagsWillBeReplaced")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
