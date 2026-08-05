import nodemailer from 'nodemailer';
import { Request, Response } from 'express';

const smtpPort = Number(process.env.SMTP_PORT || '587');
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER || '';
const smtpPassword = process.env.SMTP_PASS || '';
const testMode = process.env.EMAIL_TEST_MODE === 'true';

const smtpFrom =
  process.env.SMTP_FROM ||
  `MEGA-Central <${smtpUser}>`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: smtpPort === 587,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const createPdfAttachment = (attachment: any) => {
  if (!attachment) {
    return undefined;
  }

  let base64Content: string | null = null;
  let filename = 'Facture.pdf';

  if (typeof attachment === 'string') {
    base64Content = attachment;
  } else if (
    typeof attachment === 'object' &&
    typeof attachment.content === 'string'
  ) {
    base64Content = attachment.content;

    if (typeof attachment.filename === 'string') {
      filename = attachment.filename;
    }
  } else if (Buffer.isBuffer(attachment)) {
    return {
      filename,
      content: attachment,
      contentType: 'application/pdf',
    };
  }

  if (!base64Content) {
    throw new Error('Format de pièce jointe invalide');
  }

  const base64Marker = 'base64,';

  if (base64Content.includes(base64Marker)) {
    base64Content = base64Content.split(base64Marker)[1];
  }

  base64Content = base64Content.replace(/\s/g, '');

  const pdfBuffer = Buffer.from(base64Content, 'base64');

  if (
    pdfBuffer.length === 0 ||
    pdfBuffer.toString('utf8', 0, 5) !== '%PDF-'
  ) {
    throw new Error('Le fichier reçu n’est pas un PDF valide');
  }

  const maximumSize = 10 * 1024 * 1024;

  if (pdfBuffer.length > maximumSize) {
    throw new Error('La pièce jointe dépasse la taille autorisée');
  }

  const safeFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);

  return {
    filename: safeFilename || 'Facture.pdf',
    content: pdfBuffer,
    contentType: 'application/pdf',
  };
};

/**
 * Envoi d’un email depuis les fonctionnalités internes.
 */
export const sendEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      to,
      subject,
      message,
      cc,
      bcc,
      attachment,
    } = req.body;

    if (
      typeof to !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string' ||
      !to.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email, sujet et message requis',
      });
    }

    const formattedAttachment =
      createPdfAttachment(attachment);

    if (testMode) {
      console.log(
        `Mode test : email simulé pour ${to.trim()}`
      );

      return res.status(200).json({
        success: true,
        message: 'Email simulé avec succès',
        test_mode: true,
      });
    }

    await transporter.sendMail({
      from: smtpFrom,
      to: to.trim(),
      subject: subject.trim(),
      text: message,
      cc: typeof cc === 'string' && cc.trim()
        ? cc.trim()
        : undefined,
      bcc: typeof bcc === 'string' && bcc.trim()
        ? bcc.trim()
        : undefined,
      attachments: formattedAttachment
        ? [formattedAttachment]
        : undefined,
    });

    return res.status(200).json({
      success: true,
      message: `Email envoyé avec succès à ${to.trim()}`,
    });
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l’envoi de l’email',
    });
  }
};

/**
 * Envoi du lien sécurisé de réinitialisation.
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetLink: string,
  prenom?: string
): Promise<void> => {
  if (!smtpUser || !smtpPassword) {
    throw new Error('Configuration SMTP manquante');
  }

  if (testMode) {
    console.log(
      `Mode test : récupération simulée pour ${to}`
    );
    return;
  }

  const safePrenom = escapeHtml(prenom || '');
  const safeResetLink = escapeHtml(resetLink);

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: 'Réinitialisation de votre mot de passe MegaCentrale',
    text: [
      `Bonjour ${prenom || ''},`,
      '',
      'Vous avez demandé la réinitialisation de votre mot de passe.',
      `Ouvrez ce lien : ${resetLink}`,
      '',
      'Ce lien expire dans une heure et ne peut être utilisé qu’une seule fois.',
      '',
      'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.',
    ].join('\n'),

    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a;">
        <h2 style="color:#1d4ed8;">
          Réinitialisation du mot de passe
        </h2>

        <p>Bonjour ${safePrenom},</p>

        <p>
          Vous avez demandé à réinitialiser votre mot de passe
          MegaCentrale.
        </p>

        <p style="margin:30px 0;">
          <a
            href="${safeResetLink}"
            style="
              display:inline-block;
              padding:14px 22px;
              color:#ffffff;
              background:#2563eb;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Réinitialiser mon mot de passe
          </a>
        </p>

        <p>
          Ce lien expire dans une heure et ne peut être utilisé
          qu’une seule fois.
        </p>

        <p style="color:#64748b;">
          Si vous n’êtes pas à l’origine de cette demande,
          ignorez cet email.
        </p>
      </div>
    `,
  });
};