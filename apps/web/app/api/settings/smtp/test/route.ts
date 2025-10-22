import { NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { host, port, user, password, from } = body;

    if (!host || !port || !user || !password || !from) {
      return NextResponse.json(
        { error: 'Missing SMTP configuration' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: {
        user,
        pass: password,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from,
      to: session.user.email,
      subject: 'Test de configuration SMTP - AssociationHub',
      text: 'Votre configuration SMTP fonctionne correctement!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Configuration SMTP réussie!</h2>
          <p>Votre configuration SMTP fonctionne correctement.</p>
          <p>Vous pouvez maintenant envoyer des emails à vos membres depuis AssociationHub.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Cet email a été envoyé depuis AssociationHub pour tester votre configuration SMTP.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration is valid',
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    
    let errorMessage = 'Erreur lors du test SMTP';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Identifiants invalides. Vérifiez votre nom d\'utilisateur et mot de passe.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Impossible de se connecter au serveur SMTP. Vérifiez l\'hôte et le port.';
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
