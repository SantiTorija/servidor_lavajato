const { Client } = require("../models");
const { Op } = require("sequelize");

/**
 * Obtiene la cantidad total de clientes por mes (progresión acumulada)
 * Retorna un objeto con la cantidad de clientes creados hasta cada mes
 * @returns {Promise<object>} Objeto con etiquetas de mes como keys y cantidad como valores
 */
const getClientQuantityByMonth = async () => {
  const now = new Date();
  const months = [];

  // Generar array de los últimos 5 meses
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-indexed
      label: date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      date: new Date(date.getFullYear(), date.getMonth(), 1), // Primer día del mes
    });
  }

  // Obtener fecha del primer mes del rango
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 4, 1);

  // Buscar todos los clientes creados desde el primer mes del rango hasta ahora
  const clients = await Client.findAll({
    where: {
      createdAt: {
        [Op.lte]: now, // Hasta ahora
      },
    },
    attributes: ["id", "createdAt"],
    raw: true,
    order: [["createdAt", "ASC"]],
  });

  // Contar cantidad acumulada de clientes por mes
  // La cantidad en cada mes es el total acumulado hasta ese mes
  const result = {};
  let cumulativeCount = 0;

  months.forEach(({ year, month, label }) => {
    // Contar clientes creados hasta este mes (inclusive)
    // month es 1-indexed (1-12), convertir a 0-indexed para Date
    // Para obtener el último día del mes: new Date(year, monthIndex + 1, 0)
    // donde monthIndex es 0-indexed (0-11)
    const monthIndex = month - 1; // Convertir a 0-indexed
    // Último día del mes: new Date(year, monthIndex + 1, 0) = último día del mes monthIndex
    const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    // Contar clientes creados hasta este mes (inclusive)
    const clientsUntilMonth = clients.filter((client) => {
      const clientDate = new Date(client.createdAt);
      return clientDate <= monthEnd;
    });

    cumulativeCount = clientsUntilMonth.length;
    result[label] = cumulativeCount;
  });

  return result;
};

module.exports = {
  getClientQuantityByMonth,
};
