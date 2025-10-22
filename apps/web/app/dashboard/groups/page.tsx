import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { GroupsTable } from './groups-table';

export default async function GroupsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // Fetch all groups with parent relationships
  const groups = await prisma.groupType.findMany({
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          members: true, // Count members in each group
        },
      },
    },
    orderBy: [
      { parentId: 'asc' }, // Parents first
      { name: 'asc' },
    ],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Groupes</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Retour au tableau de bord
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GroupsTable groups={groups} />
      </main>
    </div>
  );
}
