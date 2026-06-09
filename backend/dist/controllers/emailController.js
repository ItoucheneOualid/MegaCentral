"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configuration du transporteur email
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});
// MODE TEST : Simuler l'envoi d'email
const TEST_MODE = process.env.EMAIL_TEST_MODE === 'true';
const sendEmail = async (req, res) => {
    try {
        console.log('🔧 Début de l\'envoi d\'email...');
        console.log('🧪 MODE TEST ACTIVÉ:', TEST_MODE);
        console.log('📧 Variables SMTP:', {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || '587',
            user: process.env.SMTP_USER || 'NON DÉFINI',
            pass: process.env.SMTP_PASS ? '***' : 'NON DÉFINI',
            test_mode: process.env.EMAIL_TEST_MODE
        });
        const { to, subject, message, cc, bcc, attachment } = req.body;
        console.log('📨 Données reçues:', { to, subject, message: message?.substring(0, 50) + '...', hasAttachment: !!attachment });
        console.log('📎 Attachment brut:', attachment);
        // Validation des champs requis
        if (!to || !subject || !message) {
            console.log('❌ Validation échouée - champs manquants');
            return res.status(400).json({
                success: false,
                message: 'Champs requis manquants: email, sujet ou message'
            });
        }
        // Préparer la pièce jointe PDF correctement
        let formattedAttachment = undefined;
        if (attachment) {
            console.log('🔧 Formatage de la pièce jointe...');
            console.log('📎 Type attachment:', typeof attachment);
            console.log('📎 Taille reçue:', attachment.length, 'caractères');
            console.log('📎 Début reçu:', attachment.substring(0, 100) + '...');
            console.log('📎 Fin reçu:', attachment.substring(attachment.length - 50));
            // Si l'attachment est une string base64 (format jsPDF)
            if (typeof attachment === 'string') {
                let cleanBase64 = attachment;
                console.log('📎 Base64 brut:', cleanBase64.substring(0, 150) + '...');
                // Gérer le format avec filename
                if (attachment.includes('filename=generated.pdf;base64,')) {
                    cleanBase64 = attachment.split('filename=generated.pdf;base64,')[1];
                }
                else if (attachment.startsWith('data:application/pdf;base64,')) {
                    cleanBase64 = attachment.replace('data:application/pdf;base64,', '');
                }
                else if (attachment.includes('base64,')) {
                    cleanBase64 = attachment.split('base64,')[1];
                }
                console.log('📎 Base64 nettoyé taille:', cleanBase64.length);
                console.log('📎 Base64 nettoyé début:', cleanBase64.substring(0, 50) + '...');
                console.log('📎 Base64 nettoyé fin:', cleanBase64.substring(cleanBase64.length - 50));
                // Vérifier que le base64 commence par JVBER (signature PDF)
                if (!cleanBase64.startsWith('JVBER')) {
                    console.error('❌ ERREUR: Le base64 ne commence pas par JVBER !');
                    console.error('❌ Début actuel:', cleanBase64.substring(0, 20));
                }
                // Vérifier le padding du base64 (doit être multiple de 4)
                const paddingNeeded = (4 - (cleanBase64.length % 4)) % 4;
                if (paddingNeeded > 0) {
                    console.log('🔧 Ajout de padding:', paddingNeeded, 'caractères');
                    cleanBase64 += '='.repeat(paddingNeeded);
                    console.log('📎 Base64 avec padding taille:', cleanBase64.length);
                }
                // Créer le Buffer avec validation
                let pdfBuffer;
                try {
                    pdfBuffer = Buffer.from(cleanBase64, 'base64');
                    console.log('✅ Buffer créé avec succès, taille:', pdfBuffer.length);
                    // Vérifier que le Buffer commence par la signature PDF (%PDF-)
                    const pdfSignature = pdfBuffer.toString('utf8', 0, 5);
                    console.log('📄 Signature PDF:', pdfSignature);
                    if (pdfSignature !== '%PDF-') {
                        console.error('❌ ERREUR: Le Buffer ne commence pas par %PDF- !');
                        console.error('❌ Début Buffer:', pdfBuffer.toString('utf8', 0, 20));
                    }
                }
                catch (bufferError) {
                    console.error('❌ ERREUR lors de la création du Buffer:', bufferError);
                    throw new Error('Impossible de créer le Buffer PDF');
                }
                formattedAttachment = {
                    filename: `Facture.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                };
            }
            // Si l'attachment est un objet avec content (nouveau format)
            else if (attachment && attachment.content) {
                console.log('📎 Format objet détecté');
                console.log('📎 Content type:', typeof attachment.content);
                console.log('📎 Content length:', Buffer.isBuffer(attachment.content) ? attachment.content.length : 'N/A');
                let pdfBuffer;
                if (Buffer.isBuffer(attachment.content)) {
                    pdfBuffer = attachment.content;
                    console.log('✅ Buffer direct utilisé, taille:', pdfBuffer.length);
                }
                else {
                    pdfBuffer = Buffer.from(attachment.content);
                    console.log('✅ Buffer créé depuis content, taille:', pdfBuffer.length);
                }
                // Vérifier la signature PDF
                const pdfSignature = pdfBuffer.toString('utf8', 0, 5);
                console.log('📄 Signature PDF:', pdfSignature);
                formattedAttachment = {
                    filename: attachment.filename || 'Facture.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                };
            }
            // Si l'attachment est un buffer direct
            else if (Buffer.isBuffer(attachment)) {
                formattedAttachment = {
                    filename: `Facture.pdf`,
                    content: attachment,
                    contentType: 'application/pdf'
                };
            }
            console.log('✅ Pièce jointe formatée:', formattedAttachment ? {
                filename: formattedAttachment.filename,
                size: formattedAttachment.content.length,
                type: formattedAttachment.contentType
            } : 'Aucune');
        }
        // Configuration de l'email
        const mailOptions = {
            from: process.env.SMTP_USER || '"MEGA-CENTRAL" <noreply@megacentral.com>',
            to: to,
            subject: subject,
            text: message,
            cc: cc || undefined,
            bcc: bcc || undefined,
            attachments: formattedAttachment ? [formattedAttachment] : undefined,
        };
        console.log('📤 Tentative d\'envoi...');
        // MODE TEST : Simuler l'envoi sans vraiment envoyer
        if (TEST_MODE) {
            console.log('🧪 MODE TEST - Simulation d\'envoi d\'email');
            console.log('📧 Email simulé envoyé à:', to);
            console.log('📄 Sujet:', subject);
            console.log('📎 Pièce jointe:', attachment ? 'OUI' : 'NON');
            return res.status(200).json({
                success: true,
                message: `Email simulé envoyé avec succès à ${to} (MODE TEST)`,
                test_mode: true
            });
        }
        // Envoi réel de l'email
        await transporter.sendMail(mailOptions);
        console.log('✅ Email envoyé avec succès à:', to);
        res.status(200).json({
            success: true,
            message: `Email envoyé avec succès à ${to}`
        });
    }
    catch (error) {
        console.error('❌ Erreur détaillée lors de l\'envoi de l\'email:', error);
        console.error('❌ Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'email',
            error: error.message,
            details: error.code || 'UNKNOWN_ERROR'
        });
    }
};
exports.sendEmail = sendEmail;
const sendPasswordResetEmail = async (to, resetLink, prenom) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER || '"MEGA-CENTRAL" <noreply@megacentral.com>',
        to,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
      <h2>Réinitialisation du mot de passe</h2>
      <p>Bonjour ${prenom || ''},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous :</p>
      <p>
        <a href="${resetLink}">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
