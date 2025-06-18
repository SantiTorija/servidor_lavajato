const sgMail = require("@sendgrid/mail");

// Configura la API Key desde variables de entorno (recomendado)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función para enviar email básico
const confirmationEmail = async ({ to, subject, html, date, time, total }) => {
  const text = `hola! tu reserva a sido confirmada. Por favor ten en cuenta que tenemos un margen de 30 minutos de considración, liego de ese plazo perderia su turno. Fecha: ${date}, hora: ${time}, total: ${total}`;

  const msg = {
    to, // destinatario
    from: process.env.FROM_EMAIL, // remitente verificado en SendGrid
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Correo enviado correctamente a", to);
  } catch (error) {
    console.error(
      "Error enviando email:",
      error.response ? error.response.body : error
    );
    throw new Error("No se pudo enviar el correo.");
  }
};

module.exports = {
  confirmationEmail,
};
