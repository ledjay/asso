import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { getTranslations } from 'next-intl/server';
import { TemplateSelectionForm } from "./template-selection-form";

export default async function TemplateSelectionPage() {
  const t = await getTranslations('templates');
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // TODO: Check if user has already selected a template
  // If yes, redirect to dashboard

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('welcome')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('welcomeDescription')}
          </p>
        </div>

        <TemplateSelectionForm />
      </div>
    </div>
  );
}
