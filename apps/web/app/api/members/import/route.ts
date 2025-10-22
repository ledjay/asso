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
      roleIds: string[];
      groupIds: string[];
    }> = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',').map(v => v.trim());

      const name = values[nameIndex];
      const email = values[emailIndex];
      const roleNames = values[roleIndex];
      const groupNames = values[groupIndex];

      // Validate
      if (!name || !email || !roleNames || !groupNames) {
        errors.push(`Ligne ${i + 1}: Données manquantes`);
        continue;
      }

      // Validate email format
      if (!email.includes('@')) {
        errors.push(`Ligne ${i + 1}: Email invalide (${email})`);
        continue;
      }

      // Parse comma-separated roles (backward compatible with single role)
      const roleNameList = roleNames.split(';').map(r => r.trim()).filter(r => r);
      const roleIds: string[] = [];
      
      for (const roleName of roleNameList) {
        const roleId = roleMap.get(roleName);
        if (!roleId) {
          errors.push(`Ligne ${i + 1}: Rôle inconnu (${roleName})`);
          continue;
        }
        roleIds.push(roleId);
      }

      if (roleIds.length === 0) {
        errors.push(`Ligne ${i + 1}: Aucun rôle valide`);
        continue;
      }

      // Parse comma-separated groups (backward compatible with single group)
      const groupNameList = groupNames.split(';').map(g => g.trim()).filter(g => g);
      const groupIds: string[] = [];
      
      for (const groupName of groupNameList) {
        const groupId = groupMap.get(groupName);
        if (!groupId) {
          errors.push(`Ligne ${i + 1}: Groupe inconnu (${groupName})`);
          continue;
        }
        groupIds.push(groupId);
      }

      if (groupIds.length === 0) {
        errors.push(`Ligne ${i + 1}: Aucun groupe valide`);
        continue;
      }

      membersToImport.push({
        name,
        email,
        roleIds,
        groupIds,
      });
    }

    if (membersToImport.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun membre valide à importer',
          details: errors,
          availableRoles: roles.map(r => r.name),
          availableGroups: groups.map(g => g.name),
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

      // Create new members with junction table records
      for (const memberData of membersToImport) {
        const member = await tx.member.create({
          data: {
            name: memberData.name,
            email: memberData.email,
          },
        });

        // Create role associations
        for (const roleId of memberData.roleIds) {
          await tx.memberRole.create({
            data: {
              memberId: member.id,
              roleId,
            },
          });
        }

        // Create group associations
        for (const groupId of memberData.groupIds) {
          await tx.memberGroup.create({
            data: {
              memberId: member.id,
              groupId,
            },
          });
        }
      }

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
