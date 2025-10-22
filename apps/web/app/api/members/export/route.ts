import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';

/**
 * GET /api/members/export
 * Export all members as CSV
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all members with their roles and groups (many-to-many)
    const members = await prisma.member.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        groups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Generate CSV content with semicolon-separated roles/groups
    const headers = ['nom', 'email', 'role', 'groupe'];
    const rows = members.map((member) => {
      // Join multiple roles with semicolon
      const roleNames = member.roles.map(mr => mr.role.name).join(';');
      // Join multiple groups with semicolon
      const groupNames = member.groups.map(mg => mg.group.name).join(';');
      
      return [
        member.name,
        member.email,
        roleNames || '-', // Use dash if no roles
        groupNames || '-', // Use dash if no groups
      ];
    });

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => 
        row.map((cell) => {
          // Escape cells containing commas or quotes
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      ),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="membres-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting members:', error);
    return NextResponse.json(
      { error: 'Failed to export members' },
      { status: 500 }
    );
  }
}
