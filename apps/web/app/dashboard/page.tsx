import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { getTranslations } from 'next-intl/server';
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user has selected a template (roles exist in database)
  const rolesCount = await prisma.role.count();
  if (rolesCount === 0) {
    redirect("/template-selection");
  }

  // Get actual counts for dashboard
  const membersCount = await prisma.member.count();
  const emailsCount = await prisma.emailCampaign.count();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                AssociationHub
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session.user?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('welcome', { name: session.user?.name || '' })}
          </h2>
          <p className="mt-2 text-gray-600">
            {t('connectedMessage')}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/dashboard/members"
              className="rounded-lg border border-gray-200 p-6 transition-all hover:border-blue-300 hover:shadow-md block"
            >
              <h3 className="font-semibold text-gray-900">{t('members')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('membersDescription')}
              </p>
              <p className="mt-4 text-3xl font-bold text-blue-600">
                {membersCount}
              </p>
            </a>

            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">{t('emailsSent')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('emailsHistory')}
              </p>
              <p className="mt-4 text-3xl font-bold text-green-600">
                {emailsCount}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">{t('roles')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('rolesDescription')}
              </p>
              <p className="mt-4 text-3xl font-bold text-purple-600">
                {rolesCount}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('quickActions')}
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="/dashboard/members"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('manageMembers')}
              </a>
              <a
                href="/dashboard/emails/compose"
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('composeEmail')}
              </a>
              <a
                href="/dashboard/settings"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('smtpSettings')}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
