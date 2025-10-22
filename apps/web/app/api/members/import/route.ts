import { NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Le fichier CSV est vide ou invalide' },
        { status: 400 }
      );
    }

    // Parse CSV header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredColumns = ['nom', 'email', 'role', 'groupe'];
    
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Colonnes manquantes: ${missingColumns.join(', ')}` },
        { status: 400 }
      );
    }

    // Get column indices
    const nameIndex = header.indexOf('nom');
    const emailIndex = header.indexOf('email');
    const roleIndex = header.indexOf('role');
    const groupIndex = header.indexOf('groupe');

    // Fetch valid roles and groups
    const roles = await prisma.role.findMany();
    const groups = await prisma.groupType.findMany();

    const roleMap = new Map(roles.map(r => [r.name, r.id]));
    const groupMap = new Map(groups.map(g => [g.name, g.id]));

    // Parse and validate members
    const membersToImport: Array<{
      name: string;
      email: string;
      roleId: string;
      groupId: string;
    }> = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',').map(v => v.trim());

      const name = values[nameIndex];
      const email = values[emailIndex];
      const roleName = values[roleIndex];
      const groupName = values[groupIndex];

      // Validate
      if (!name || !email || !roleName || !groupName) {
        errors.push(`Ligne ${i + 1}: Données manquantes`);
        continue;
      }

      // Validate email format
      if (!email.includes('@')) {
        errors.push(`Ligne ${i + 1}: Email invalide (${email})`);
        continue;
      }

      // Validate role exists
      const roleId = roleMap.get(roleName);
      if (!roleId) {
        errors.push(`Ligne ${i + 1}: Rôle inconnu (${roleName})`);
        continue;
      }

      // Validate group exists
      const groupId = groupMap.get(groupName);
      if (!groupId) {
        errors.push(`Ligne ${i + 1}: Groupe inconnu (${groupName})`);
        continue;
      }

      membersToImport.push({
        name,
        email,
        roleId,
        groupId,
      });
    }

    if (membersToImport.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun membre valide à importer',
          details: errors 
        },
        { status: 400 }
      );
    }

    // Import members in transaction
    const emails = membersToImport.map(m => m.email);
    
    const imported = await prisma.$transaction(async (tx) => {
      // Delete existing members with same emails (upsert behavior)
      await tx.member.deleteMany({
        where: { email: { in: emails } },
      });

      // Create new members
      await tx.member.createMany({
        data: membersToImport,
      });

      return membersToImport.length;
    });

    return NextResponse.json({
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
