import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const getLogoHtml = () => `
    <div style="margin-bottom: 20px;">
        <img src="${process.env.APP_URL}/logo.webp" alt="Logo Supermercado" style="max-width: 150px; height: auto;" />
    </div>
`;

export const sendPasswordResetEmail = async (email: string, name: string, url: string) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY no está configurado. No se enviará el correo real.");
        return;
    }

    try {
        await resend.emails.send({
            from: "Minegocio OS <onboarding@resend.dev>",
            to: email,
            subject: "Recuperación de Contraseña - Minegocio OS",
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    ${getLogoHtml()}
                    <h2>Hola ${name},</h2>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #0066FF; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Restablecer Contraseña
                    </a>
                    <p style="font-size: 12px; color: #666;">Si no solicitaste esto, puedes ignorar este correo.</p>
                    <p style="font-size: 10px; color: #aaa; margin-top: 20px;">Link válido temporalmente.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error al enviar el correo de recuperación:", error);
    }
};

export const sendVerificationEmail = async (email: string, name: string, url: string) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY no está configurado. No se enviará el correo real de verificación.");
        return;
    }

    try {
        await resend.emails.send({
            from: "Minegocio OS <onboarding@resend.dev>",
            to: email,
            subject: "Verifica tu Correo Electrónico - Minegocio OS",
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    ${getLogoHtml()}
                    <h2>¡Bienvenido, ${name}!</h2>
                    <p>Gracias por registrarte. Por favor, verifica tu dirección de correo electrónico haciendo clic en el botón de abajo.</p>
                    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Verificar mi Correo
                    </a>
                    <p style="font-size: 12px; color: #666;">Si no creaste una cuenta, puedes ignorar de forma segura este correo.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error al enviar el correo de verificación:", error);
    }
};