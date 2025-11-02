const { Client, Order } = require("../models");
const { Op } = require("sequelize");

const clientExists = async (email) => {
  const client = await Client.findOne({ where: { email: email.trim() } });

  if (!client) return false;

  // Buscar todas las órdenes asociadas al cliente
  const allOrders = await Order.findAll({
    where: {
      ClientId: client.id,
    },
  });

  // Filtrar órdenes con fecha futura o igual a hoy (cart.date >= today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignorar la hora
  const futureOrdersFiltered = allOrders.filter((order) => {
    const orderDate = order.cart?.date;
    if (!orderDate) return false;
    const orderDateObj = new Date(orderDate);
    orderDateObj.setHours(0, 0, 0, 0);
    return orderDateObj >= today;
  });

  return {
    ...client.toJSON(),
    futureOrders: futureOrdersFiltered.length > 0,
    orders: futureOrdersFiltered,
  };
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

const createClient = async (clientData) => {
  try {
    // Validar campos requeridos
    if (!clientData.firstname || !clientData.lastname || !clientData.email) {
      throw new Error("Los campos nombre, apellido y email son requeridos");
    }

    // Verificar si el email ya existe
    const existingClient = await Client.findOne({
      where: { email: clientData.email.trim() },
    });

    if (existingClient) {
      throw new Error("Ya existe un cliente con este email");
    }

    // Preparar datos del carro
    const carData = {
      marca: clientData.marca || "",
      modelo: clientData.modelo || "",
      carType: clientData.carType || "",
      carTypeId: clientData.carTypeId || null,
    };

    // Crear el cliente
    const newClient = await Client.create({
      firstname: clientData.firstname.trim(),
      lastname: clientData.lastname.trim(),
      email: clientData.email.trim(),
      phone: clientData.phone || "",
      car: carData,
    });

    return newClient;
  } catch (error) {
    throw new Error(`Error al crear cliente: ${error.message}`);
  }
};

module.exports = {
  clientExists,
  createClient,
  updateClient,
};
