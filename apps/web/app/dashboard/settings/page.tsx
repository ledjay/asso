import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { getTranslations } from 'next-intl/server';
import { SmtpSettingsForm } from './smtp-settings-form';

export default async function SettingsPage() {
  const t = await getTranslations('settings');
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <a href="/dashboard" className="text-xl font-bold text-gray-900">
                AssociationHub
              </a>
              <span className="ml-4 text-sm text-gray-500">/ {t('title')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('description')}
          </p>
        </div>

        <SmtpSettingsForm />
      </main>
    </div>
  );
}
