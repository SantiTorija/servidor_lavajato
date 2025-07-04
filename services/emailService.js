const sgMail = require("@sendgrid/mail");

// Configura la API Key desde variables de entorno (recomendado)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función para enviar email de confirmación de reserva
const confirmationEmail = async ({ to, date, time, total }) => {
  const subject = "Confirmación de reserva - Lavajato";
  const text = `¡Hola! Tu reserva ha sido confirmada. Por favor, ten en cuenta que tenemos un margen de 30 minutos de consideración, luego de ese plazo perderías tu turno. Fecha: ${date}, hora: ${time}, total: ${total}`;
  const html = `
    <h1><strong>¡Reserva confirmada!</strong></h1>
    <strong>Hola, tu reserva ha sido confirmada.</strong>
    <p>Atención: Por favor, ten en cuenta que tenemos un margen de 30 minutos de consideración. Luego de ese plazo perderías tu turno.</p>
    <p><strong>Fecha:</strong> ${date}</p>
    <p><strong>Hora:</strong> ${time}</p>
    <p><strong>Total:</strong> UY$${total} <strong>A pagar en el local</strong></p>
    <h2>¡Muchas gracias por la confianza!</h2>
  `;

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
