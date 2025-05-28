const { Client } = require("../models");

const createClient = async (clientData) => {
  // Aquí podrías validar datos, encriptar contraseñas, etc.

  const client = await Client.create({
    firstname: clientData.firstname,
    lastname: clientData.lastname,
    email: clientData.email,
    phone: clientData.phone,
    car: {
      marca: clientData.marca,
      modelo: clientData.modelo,
      carType: clientData.carType,
    },
  });
  return client;
};

const clientExists = async (email) => {
  const client = await Client.findAll({ where: { email: email.trim() } });

  return client.length > 0 ? client : false;
};

module.exports = { createClient, clientExists };
