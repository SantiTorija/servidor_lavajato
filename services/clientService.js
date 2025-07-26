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

const getNewClientsByMonth = async () => {
  const now = new Date();
  const months = [];
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-indexed
      label: date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
    });
  }

  // Buscar clientes creados en los últimos 5 meses
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  const clients = await Client.findAll({
    where: {
      createdAt: {
        [Op.gte]: fromDate,
      },
    },
    attributes: ["id", "createdAt"],
    raw: true,
  });

  // Contar por mes
  const result = {};
  months.forEach(({ year, month, label }) => {
    result[label] = 0;
  });
  clients.forEach((client) => {
    const date = new Date(client.createdAt);
    const label = date.toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });
    if (result[label] !== undefined) {
      result[label]++;
    }
  });
  return result;
};

module.exports = {
  clientExists,
  updateClient,
  getNewClientsByMonth,
};
