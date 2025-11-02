const { Resend } = require("resend");

// Inicializa Resend con la API Key desde variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// Función para formatear fecha de ISO a formato legible
const formatDate = (isoDate) => {
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Parsear manualmente el formato "YYYY-MM-DD" para evitar problemas de zona horaria
  // Split y convertir a números para obtener día, mes y año directamente
  const [year, month, day] = isoDate.split("-").map(Number);
  const monthName = months[month - 1]; // Los meses en el array están en índice 0-11, pero el formato viene como 1-12

  return `${day} de ${monthName}`;
};

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

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL, // remitente verificado en Resend
      to: [to], // destinatario (array)
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error enviando email:", error);
      throw new Error("No se pudo enviar el correo.");
    }

    console.log("Correo enviado correctamente a", to, "ID:", data.id);
  } catch (error) {
    console.error("Error enviando email:", error);
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

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error enviando email de cancelación:", error);
      throw new Error("No se pudo enviar el email de cancelación.");
    }

    console.log(
      "Email de cancelación enviado correctamente a",
      to,
      "ID:",
      data.id
    );
  } catch (error) {
    console.error("Error enviando email de cancelación:", error);
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

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error enviando email de modificación:", error);
      throw new Error("No se pudo enviar el email de modificación.");
    }

    console.log(
      "Email de modificación enviado correctamente a",
      to,
      "ID:",
      data.id
    );
  } catch (error) {
    console.error("Error enviando email de modificación:", error);
    throw new Error("No se pudo enviar el email de modificación.");
  }
};

// Función para enviar reporte de notificaciones de reservas
const notificationReport = async ({
  results,
  successCount,
  errorCount,
  date,
}) => {
  const subject = `Reporte de notificaciones de reservas - ${date}`;

  // Filtrar emails exitosos y con errores
  const successEmails = results
    .filter((r) => r.status === "success")
    .map((r) => r.email);
  const errorEmails = results
    .filter((r) => r.status === "error")
    .map((r) => r.email);

  // Construir lista de emails exitosos
  const successList =
    successEmails.length > 0
      ? successEmails.map((email) => `<li>${email}</li>`).join("")
      : "";

  // Construir lista de emails con errores
  const errorList =
    errorEmails.length > 0
      ? errorEmails.map((email) => `<li>${email}</li>`).join("")
      : "";

  const text =
    `Reporte de notificaciones de reservas para la fecha ${date}\n\n` +
    `Se envió con éxito recuerdo de reserva a los siguientes emails:\n${
      successEmails.length > 0
        ? successEmails.map((email) => `- ${email}`).join("\n")
        : "Ninguno"
    }\n\n` +
    (errorEmails.length > 0
      ? `Hubo errores en los siguientes emails:\n${errorEmails
          .map((email) => `- ${email}`)
          .join("\n")}`
      : "No hubo errores");

  const html = `
    <h1><strong>Reporte de notificaciones de reservas</strong></h1>
    <p><strong>Fecha de reservas:</strong> ${date}</p>
    <h2><strong>Emails enviados con éxito</strong></h2>
    ${
      successEmails.length > 0
        ? `<ul>${successList}</ul>`
        : "<p>No hubo emails exitosos.</p>"
    }
    <h2><strong>Errores</strong></h2>
    ${
      errorEmails.length > 0
        ? `<ul>${errorList}</ul>`
        : "<p><strong>No hubo errores</strong></p>"
    }
    <p><strong>Total procesados:</strong> ${results.length}</p>
    <p><strong>Exitosos:</strong> ${successCount}</p>
    <p><strong>Errores:</strong> ${errorCount}</p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [process.env.NOTIFICATION_REPORT_EMAIL],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error enviando reporte de notificaciones:", error);
      throw new Error("No se pudo enviar el reporte de notificaciones.");
    }

    console.log(
      "Reporte de notificaciones enviado correctamente a",
      process.env.NOTIFICATION_REPORT_EMAIL,
      "ID:",
      data.id
    );
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error("Error enviando reporte de notificaciones:", error);
    // No relanzamos el error para no afectar la respuesta del endpoint
    return { success: false, error: error.message };
  }
};

// Función para enviar email de notificación de reserva
const reserveNotification = async ({ to, date, time, nombre }) => {
  const subject = "Recordatorio de reserva - Lavajato";
  const formattedDate = formatDate(date);
  console.log(formattedDate, "fecha en email");
  console.log(date, "fecha en reserva");
  const text = `Hola ${nombre}\n\nRecuerda que mañana ${formattedDate} a las ${time} tienes reservado para lavar tu auto en Lavajato.\n\nAgradecemos llegar en hora dado que tenemos los tiempos limitados y puede afectar la atención a otros clientes\n\n¡Te esperamos!`;
  const html = `
    <h1><strong>Recordatorio de reserva</strong></h1>
    <p><strong>Hola ${nombre}</strong></p>
    <p>Recuerda que mañana <strong>${formattedDate}</strong> a las <strong>${time}</strong> tienes reservado para lavar tu auto en Lavajato.</p>
    <p><strong>Recuerda que consideramos un margen de 30 minutos de tolerancia. Luego de ese plazo perderías tu turno. Lo hacemos para poder brindar un mejor servicio.</strong>  </p>
    <h2>¡Te esperamos!</h2>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error enviando email de notificación:", error);
      throw new Error("No se pudo enviar el email de notificación.");
    }

    console.log(
      "Email de notificación enviado correctamente a",
      to,
      "ID:",
      data.id
    );
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error("Error enviando email de notificación:", error);
    throw new Error("No se pudo enviar el email de notificación.");
  }
};

module.exports = {
  confirmationEmail,
  cancellationEmail,
  modificationEmail,
  reserveNotification,
  notificationReport,
};
