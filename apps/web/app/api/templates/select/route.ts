import { NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';

// Template definitions matching seed.ts
const templates = {
  parents: {
    roles: [
      { name: 'delegue_titulaire', displayName: 'Délégué titulaire', sortOrder: 1 },
      { name: 'delegue_suppleant', displayName: 'Délégué suppléant', sortOrder: 2 },
      { name: 'membre', displayName: 'Membre', sortOrder: 3 },
    ],
    groups: [
      { name: '6e1', category: 'classe' },
      { name: '5e2', category: 'classe' },
      { name: 'CM2', category: 'classe' },
      { name: 'CE1', category: 'classe' },
    ],
  },
  sports: {
    roles: [
      { name: 'entraineur', displayName: 'Entraîneur', sortOrder: 1 },
      { name: 'joueur', displayName: 'Joueur', sortOrder: 2 },
      { name: 'parent', displayName: 'Parent', sortOrder: 3 },
    ],
    groups: [
      { name: 'poussins', category: 'equipe' },
      { name: 'cadets', category: 'equipe' },
      { name: 'u12', category: 'equipe' },
      { name: 'lundi_18h', category: 'equipe' },
    ],
  },
  cultural: {
    roles: [
      { name: 'president', displayName: 'Président', sortOrder: 1 },
      { name: 'membre_actif', displayName: 'Membre actif', sortOrder: 2 },
      { name: 'membre', displayName: 'Membre', sortOrder: 3 },
    ],
    groups: [
      { name: 'debutant', category: 'section' },
      { name: 'intermediaire', category: 'section' },
      { name: 'expert', category: 'section' },
    ],
  },
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { template } = body;

    if (!template || !['parents', 'sports', 'cultural'].includes(template)) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
    }

    const selectedTemplate = templates[template as keyof typeof templates];

    // Check if roles/groups already exist
    const existingRoles = await prisma.role.count();
    const existingGroups = await prisma.groupType.count();

    if (existingRoles > 0 || existingGroups > 0) {
      return NextResponse.json(
        { error: 'Template already selected' },
        { status: 400 }
      );
    }

    // Create roles and groups in a transaction
    await prisma.$transaction(async (tx: typeof prisma) => {
      // Create roles
      for (const role of selectedTemplate.roles) {
        await tx.role.create({ data: role });
      }

      // Create groups
      for (const group of selectedTemplate.groups) {
        await tx.groupType.create({ data: group });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Template selected successfully',
      template,
    });
  } catch (error) {
    console.error('Template selection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
