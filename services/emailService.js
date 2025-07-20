const sgMail = require("@sendgrid/mail");

// Configura la API Key desde variables de entorno (recomendado)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función para enviar email de confirmación de reserva
const confirmationEmail = async ({ to, date, time, total }) => {
  const subject = "Confirmación de reserva - Lavajato";
  const text = `¡Hola! Tu reserva ha sido confirmada. Por favor, ten en cuenta que tenemos un margen de 30 minutos de consideración, luego de ese plazo perderías tu turno. Fecha: ${date}, hora: ${time}, total: ${total}`;
  const html = `
    <h1><strong>¡Reserva confirmada!</strong></h1>
    <h2><strong>¡Gracias por preferirnos!</strong></h2>
    <h3><strong>Atención: Consideramos un margen de 30 minutos de tolerancia. Luego de ese plazo perderías tu turno. Lo hacemos para poder brindar un mejor servicio.</strong></h3>
    <p><strong>Fecha:</strong> ${date}</p>
    <p><strong>Hora:</strong> ${time}</p>
    <p><strong>Total:</strong> UY$${total} <strong>A pagar en el local en efectivo, débito o crédito. </strong></p>
    <p><strong>Dirección: José Ma. Montero 2798 Esq. Cnel. Mora</strong></p>
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

// Función para enviar email de cancelación de reserva
const cancellationEmail = async ({ to, date, time, total }) => {
  const subject = "Cancelación de reserva - Lavajato";
  const text = `Tu reserva ha sido cancelada exitosamente. Fecha: ${date}, hora: ${time}, total: ${total}. Si tienes alguna consulta, no dudes en contactarnos.`;
  const html = `
    <h1><strong>Reserva cancelada</strong></h1>
    <h2><strong>Tu reserva ha sido cancelada exitosamente</strong></h2>
    <h3><strong>Detalles de la reserva cancelada:</strong></h3>
    <p><strong>Fecha:</strong> ${date}</p>
    <p><strong>Hora:</strong> ${time}</p>
    <p><strong>Total:</strong> UY$${total}</p>
    <p>Si tienes alguna consulta o deseas realizar una nueva reserva, no dudes en contactarnos.</p>
   
  `;

  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email de cancelación enviado correctamente a", to);
  } catch (error) {
    console.error(
      "Error enviando email de cancelación:",
      error.response ? error.response.body : error
    );
    throw new Error("No se pudo enviar el email de cancelación.");
  }
};

// Función para enviar email de modificación de reserva
const modificationEmail = async ({
  to,
  oldDate,
  oldTime,
  newDate,
  newTime,
  total,
}) => {
  const subject = "Modificación de reserva - Lavajato";
  const text = `Tu reserva ha sido modificada exitosamente. Fecha anterior: ${oldDate} ${oldTime}, Nueva fecha: ${newDate} ${newTime}, total: ${total}.`;
  const html = `
    <h1><strong>Reserva modificada</strong></h1>
    <h2><strong>Tu reserva ha sido modificada exitosamente</strong></h2>
    <h3><strong>Detalles de la modificación:</strong></h3>
    <p><strong>Fecha anterior:</strong> ${oldDate} - ${oldTime}</p>
    <p><strong>Nueva fecha:</strong> ${newDate} - ${newTime}</p>
    <p><strong>Total:</strong> UY$${total} <strong>A pagar en el local en efectivo, débito o crédito. </strong></p>
    <p><strong>Dirección: José Ma. Montero 2798 Esq. Cnel. Mora</strong></p>
    <h3><strong>Atención: Consideramos un margen de 30 minutos de tolerancia. Luego de ese plazo perderías tu turno. Lo hacemos para poder brindar un mejor servicio.</strong></h3>
    <h2>¡Gracias!</h2>
  `;

  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email de modificación enviado correctamente a", to);
  } catch (error) {
    console.error(
      "Error enviando email de modificación:",
      error.response ? error.response.body : error
    );
    throw new Error("No se pudo enviar el email de modificación.");
  }
};

module.exports = {
  confirmationEmail,
  cancellationEmail,
  modificationEmail,
};
