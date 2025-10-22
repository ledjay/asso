import { NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { decrypt } from '@repo/database/encryption';
import nodemailer from 'nodemailer';

// Template tag replacement function
function replaceTags(text: string, member: any): string {
  return text
    .replace(/{Nom}/g, member.name)
    .replace(/{Role}/g, member.role.displayName)
    .replace(/{Groupe}/g, member.group.name);
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, body: emailBody, roleId, groupId } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get SMTP config from database
    const smtpConfigDb = await prisma.sMTPConfiguration.findUnique({
      where: { userId: user.id },
    });

    if (!smtpConfigDb) {
      return NextResponse.json(
        { error: 'Configuration SMTP manquante. Veuillez configurer vos paramètres SMTP dans Paramètres.' },
        { status: 400 }
      );
    }

    // Decrypt password
    const decryptedPassword = decrypt(smtpConfigDb.password);

    const smtpConfig = {
      host: smtpConfigDb.host,
      port: smtpConfigDb.port,
      user: smtpConfigDb.user,
      password: decryptedPassword,
      from: `${smtpConfigDb.fromName} <${smtpConfigDb.fromEmail}>`,
    };

    // Build filter
    const where: any = {};
    if (roleId) where.roleId = roleId;
    if (groupId) where.groupId = groupId;

    // Fetch recipients
    const members = await prisma.member.findMany({
      where,
      include: {
        role: true,
        group: true,
      },
    });

    if (members.length === 0) {
      return NextResponse.json(
        { error: 'Aucun destinataire trouvé avec ces filtres' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    // Send emails
    let sentCount = 0;
    const errors: string[] = [];

    for (const member of members) {
      try {
        const personalizedSubject = replaceTags(subject, member);
        const personalizedBody = replaceTags(emailBody, member);

        await transporter.sendMail({
          from: smtpConfig.from,
          to: member.email,
          subject: personalizedSubject,
          text: personalizedBody,
          html: personalizedBody.replace(/\n/g, '<br>'),
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${member.email}:`, error);
        errors.push(`${member.name} (${member.email})`);
      }
    }

    // Check if this is the first email campaign
    const previousCampaignsCount = await prisma.emailCampaign.count({
      where: { userId: user.id },
    });
    const isFirstEmail = previousCampaignsCount === 0;

    // Save campaign to database
    await prisma.emailCampaign.create({
      data: {
        subject,
        bodyTemplate: emailBody,
        recipientCount: sentCount,
        sentAt: new Date(),
        userId: user.id,
      },
    });

    if (errors.length > 0) {
      return NextResponse.json({
        success: true,
        sent: sentCount,
        failed: errors.length,
        errors,
        isFirstEmail,
        message: `${sentCount} email(s) envoyé(s), ${errors.length} échec(s)`,
      });
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      isFirstEmail,
      message: `${sentCount} email(s) envoyé(s) avec succès`,
    });
  } catch (error) {
    console.error('Email send error:', error);
    
    let errorMessage = 'Erreur lors de l\'envoi des emails';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Identifiants SMTP invalides';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Impossible de se connecter au serveur SMTP';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
