require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Servir la página estática frontend
app.use(express.static(__dirname));

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes cambiarlo a 'host' y puerto si tienes un SMTP personalizado
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/leads', async (req, res) => {
    const { name, email, company } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
    }

    try {
        const mailOptions = {
            from: `"NEU Logistik Web" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
            subject: '🚨 Nuevo Prospecto de Auditoría - NEU Logistik',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #020a17; color: #ffffff;">
                    <h2 style="color: #47d6ff;">Nuevo Lead Capturado</h2>
                    <p style="color: #b9c7e4;">Un nuevo prospecto ha solicitado una sesión inicial enfocada en vulnerabilidades desde la Landing Page:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #47d6ff;"><strong>Nombre:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #47d6ff;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #47d6ff;"><strong>Correo:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #47d6ff;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #47d6ff;"><strong>Empresa:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #47d6ff;">${company || 'No especificada'}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 30px; font-size: 10px; color: #47d6ff;">Este mensaje fue generado automáticamente. Favor de no responder a este correo del sistema.</p>
                </div>
            `
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        console.log(`[EXITO] Nuevo prospecto enviado por correo (${email})`);
        
        res.status(200).json({ success: true, message: 'Registro exitoso' });
    } catch (error) {
        console.error('Error disparando el correo internamente:', error);
        res.status(500).json({ error: 'Error del servidor en el envío' });
    }
});

app.listen(PORT, () => {
    console.log(`[NEU Logistik] Servidor de despachos y Node.js corriendo con éxito en http://localhost:${PORT}`);
});
