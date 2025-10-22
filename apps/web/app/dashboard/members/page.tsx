import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { getTranslations } from 'next-intl/server';
import { MembersTable } from './members-table';
import { ImportMembersButton } from './import-members-button';

export default async function MembersPage() {
  const t = await getTranslations('members');
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check if template selected
  const rolesCount = await prisma.role.count();
  if (rolesCount === 0) {
    redirect('/template-selection');
  }

  // Fetch members with their roles and groups
  const members = await prisma.member.findMany({
    include: {
      role: true,
      group: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch roles and groups for filters
  const roles = await prisma.role.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  const groups = await prisma.groupType.findMany({
    orderBy: { name: 'asc' },
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
              <span className="ml-4 text-sm text-gray-500">/ {t('title')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t('manageDescription')}
            </p>
          </div>
          <ImportMembersButton />
        </div>

        {members.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto max-w-md">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {t('noMembers')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('emptyState')}
              </p>
              <div className="mt-6">
                <ImportMembersButton />
              </div>
            </div>
          </div>
        ) : (
          <MembersTable members={members} roles={roles} groups={groups} />
        )}
      </main>
    </div>
  );
}
