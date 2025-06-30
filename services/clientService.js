const { Client, CarType } = require("../models");

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
      carTypeId: clientData.carTypeId,
    },
  });
  return client;
};

const clientExists = async (email) => {
  const client = await Client.findOne({ where: { email: email.trim() } });

  if (!client) return false;
  return client;
};

const updateClient = async (clientId, updateData) => {
  try {
    // Buscar el cliente por ID
    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    // Preparar los datos de actualización
    const updateFields = {};

    // Actualizar campos básicos si están presentes
    if (updateData.firstname) updateFields.firstname = updateData.firstname;
    if (updateData.lastname) updateFields.lastname = updateData.lastname;
    if (updateData.email) updateFields.email = updateData.email;
    if (updateData.phone) updateFields.phone = updateData.phone;

    // Actualizar información del carro si está presente
    if (
      updateData.marca ||
      updateData.modelo ||
      updateData.carType ||
      updateData.carTypeId
    ) {
      const currentCar = client.car || {};
      updateFields.car = {
        marca: updateData.marca || currentCar.marca,
        modelo: updateData.modelo || currentCar.modelo,
        carType: updateData.carType || currentCar.carType,
        carTypeId: updateData.carTypeId || currentCar.carTypeId,
      };
    }

    // Actualizar el cliente
    await client.update(updateFields);

    // Retornar el cliente actualizado
    return client;
  } catch (error) {
    throw new Error(`Error al actualizar cliente: ${error.message}`);
  }
};

module.exports = { createClient, clientExists, updateClient };
