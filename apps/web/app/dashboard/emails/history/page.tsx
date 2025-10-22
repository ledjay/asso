import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { getTranslations } from 'next-intl/server';

export default async function EmailHistoryPage() {
  const t = await getTranslations('emails');
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
  });

  if (!user) {
    redirect('/login');
  }

  // Fetch email campaigns
  const campaigns = await prisma.emailCampaign.findMany({
    where: { userId: user.id },
    orderBy: { sentAt: 'desc' },
    take: 50, // Limit to last 50 campaigns
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <a href="/dashboard" className="text-xl font-bold text-gray-900">
                AssociationHub
              </a>
              <span className="ml-4 text-sm text-gray-500">/ {t('history')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('history')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Historique de vos communications envoyées
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Aucun email envoyé
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Commencez par composer votre premier email
            </p>
            <div className="mt-6">
              <a
                href="/dashboard/emails/compose"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {t('compose')}
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-white shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('sentAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('subject')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('recipientCount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Aperçu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {new Date(campaign.sentAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {campaign.subject}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {campaign.recipientCount} destinataire{campaign.recipientCount > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">
                          {campaign.bodyTemplate}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
