import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { encrypt, decrypt } from '@repo/database/encryption';
import { z } from 'zod';

// Validation schema for SMTP configuration
const smtpConfigSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535'),
  user: z.string().min(1, 'SMTP user is required'),
  password: z.string().min(1, 'SMTP password is required'),
  fromEmail: z.string().email('Invalid from email address'),
  fromName: z.string().min(1, 'From name is required'),
});

/**
 * GET /api/settings/smtp
 * Retrieve SMTP configuration for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get SMTP configuration
    const smtpConfig = await prisma.sMTPConfiguration.findUnique({
      where: { userId: user.id },
    });

    if (!smtpConfig) {
      return NextResponse.json(
        { configured: false },
        { status: 200 }
      );
    }

    // Return configuration without password
    return NextResponse.json({
      configured: true,
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      fromEmail: smtpConfig.fromEmail,
      fromName: smtpConfig.fromName,
    });
  } catch (error) {
    console.error('Error fetching SMTP configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMTP configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/smtp
 * Save or update SMTP configuration for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = smtpConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid SMTP configuration', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { host, port, user, password, fromEmail, fromName } = validation.data;

    // Get user
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Encrypt password
    const encryptedPassword = encrypt(password);

    // Upsert SMTP configuration
    const smtpConfig = await prisma.sMTPConfiguration.upsert({
      where: { userId: dbUser.id },
      update: {
        host,
        port,
        user,
        password: encryptedPassword,
        fromEmail,
        fromName,
      },
      create: {
        userId: dbUser.id,
        host,
        port,
        user,
        password: encryptedPassword,
        fromEmail,
        fromName,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration saved successfully',
      id: smtpConfig.id,
    });
  } catch (error) {
    console.error('Error saving SMTP configuration:', error);
    
    // Check if it's an encryption error
    if (error instanceof Error && error.message.includes('ENCRYPTION_KEY')) {
      return NextResponse.json(
        { error: 'Server encryption not configured. Contact administrator.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save SMTP configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/smtp
 * Delete SMTP configuration for the current user
 */
export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete SMTP configuration
    await prisma.sMTPConfiguration.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting SMTP configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete SMTP configuration' },
      { status: 500 }
    );
  }
}
