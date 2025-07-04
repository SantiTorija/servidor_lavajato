const sgMail = require("@sendgrid/mail");

// Configura la API Key desde variables de entorno (recomendado)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función para enviar email básico
const confirmationEmail = async ({ to, date, time, total }) => {
  const subject = "Confirmación de Reserva";
  const html = `<h1>¡Tu reserva ya esta lista!</h1>
    <p>Datos de la reserva:</p>
    <br/> 
    <div>Dia: ${date}</div>
    <br/> 
    <div>Hora: ${time}</div> 
    <br/> 
  
    <div>Total: ${total}</div>
  <br/> 
    <strong>Por favor ten en cuenta que tenemos un margen de 30 minutos de consideración, luego de ese plazo perderías tu turno.</strong>`;
  <h2>Gracias por elegirnos!</h2>;
  const text = `hola! tu reserva ha sido confirmada. Por favor ten en cuenta que tenemos un margen de 30 minutos de consideración, luego de ese plazo perdería su turno. Fecha: ${date}, hora: ${time}, total: ${total}`;

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
