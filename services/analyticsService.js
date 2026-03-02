const { Client, Order, Service } = require("../models");
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

/**
 * Formatea fecha a YYYY-MM-DD
 */
const toDateStr = (d) => d.toISOString().split("T")[0];

/**
 * Extrae YYYY-MM-DD de cart.date (puede ser string o Date)
 */
const parseCartDate = (cart) => {
  const raw = cart?.date ?? cart?.[0]?.date;
  if (!raw) return null;
  if (typeof raw === "string") return raw.split("T")[0];
  if (raw instanceof Date) return toDateStr(raw);
  return null;
};

/**
 * Extrae total numérico del cart
 */
const parseCartTotal = (cart) => {
  const raw = cart?.total ?? cart?.[0]?.total;
  return parseFloat(raw) || 0;
};

/**
 * Obtiene KPIs del dashboard
 */
const getDashboardKPIs = async () => {
  const now = new Date();
  const todayStr = toDateStr(now);

  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = toDateStr(weekEnd);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = toDateStr(monthStart);

  const orders = await Order.findAll({
    attributes: ["id", "orderStatus", "cart", "createdAt", "updatedAt"],
    raw: true,
  });

  let reservasHoy = 0;
  let reservasSemana = 0;
  let ingresosMes = 0;
  let clientesNuevosMes = 0;
  let clientesVetados = 0;
  const ordenesPorEstado = { completada: 0, cancelada: 0, activa: 0, "faltó_sin_aviso": 0 };

  for (const order of orders) {
    const cart = order.cart || {};
    const cartDate = parseCartDate(cart) || (typeof cart.date === "string" ? cart.date.split("T")[0] : null);
    const total = parseCartTotal(cart);

    ordenesPorEstado[order.orderStatus] = (ordenesPorEstado[order.orderStatus] || 0) + 1;

    if (order.orderStatus === "activa" && cartDate) {
      if (cartDate === todayStr) reservasHoy++;
      if (cartDate >= todayStr && cartDate <= weekEndStr) reservasSemana++;
    }

    if (order.orderStatus === "completada") {
      const orderMonth = new Date(order.updatedAt || order.createdAt);
      if (orderMonth >= monthStart) {
        ingresosMes += total;
      }
    }
  }

  const clientsThisMonth = await Client.count({
    where: {
      createdAt: { [Op.gte]: monthStart },
    },
  });
  clientesNuevosMes = clientsThisMonth;

  clientesVetados = await Client.count({
    where: { clientStatus: "vetado" },
  });

  const completadas = ordenesPorEstado.completada || 0;
  const faltaron = ordenesPorEstado["faltó_sin_aviso"] || 0;
  const totalNoCanceladas = completadas + faltaron;
  const tasaNoShow = totalNoCanceladas > 0 ? Math.round((faltaron / totalNoCanceladas) * 100) : 0;

  return {
    reservasHoy,
    reservasSemana,
    ingresosMes: Math.round(ingresosMes * 100) / 100,
    clientesNuevosMes,
    clientesVetados,
    tasaNoShow,
    ordenesPorEstado,
  };
};

/**
 * Ingresos por mes (últimos 6 meses)
 * Toda orden completada cuenta como ingreso.
 * Agrupa por mes en que se marcó completada (updatedAt) o se creó (createdAt).
 */
const getRevenueByMonth = async () => {
  const now = new Date();
  const result = [];
  const orders = await Order.findAll({
    where: { orderStatus: "completada" },
    attributes: ["cart", "updatedAt", "createdAt"],
    raw: true,
  });

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const label = date.toLocaleString("default", { month: "short", year: "2-digit" });

    let total = 0;
    for (const o of orders) {
      const orderDate = new Date(o.updatedAt || o.createdAt);
      if (orderDate >= monthStart && orderDate <= monthEnd) {
        total += parseCartTotal(o.cart);
      }
    }

    result.push({ label, value: Math.round(total * 100) / 100 });
  }

  return result;
};

/**
 * Órdenes por estado (para donut)
 */
const getOrdersByStatus = async () => {
  const counts = await Order.findAll({
    attributes: ["orderStatus"],
    raw: true,
  });

  const grouped = {};
  for (const o of counts) {
    const s = o.orderStatus || "activa";
    grouped[s] = (grouped[s] || 0) + 1;
  }

  const labels = { completada: "Completadas", cancelada: "Canceladas", activa: "Activas", "faltó_sin_aviso": "Faltó" };
  return Object.entries(grouped).map(([status, count]) => ({
    name: labels[status] || status,
    value: count,
  }));
};

/**
 * Servicios más vendidos
 */
const getTopServices = async () => {
  const orders = await Order.findAll({
    where: { orderStatus: "completada" },
    include: [{ model: Service, attributes: ["name"], required: false }],
    attributes: ["ServiceId"],
  });

  const counts = {};
  for (const o of orders) {
    const name = o.Service?.name || o.dataValues?.Service?.name || "Sin servicio";
    counts[name] = (counts[name] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
};

/**
 * Horarios más populares (slots)
 */
const getPopularSlots = async () => {
  const orders = await Order.findAll({
    where: { orderStatus: { [Op.in]: ["completada", "activa"] } },
    attributes: ["cart"],
    raw: true,
  });

  const counts = {};
  for (const o of orders) {
    const slot = o.cart?.slot || o.cart?.[0]?.slot || "N/A";
    counts[slot] = (counts[slot] || 0) + 1;
  }

  const slotOrder = ["08:30", "10:30", "14:00", "16:00"];
  return slotOrder
    .filter((s) => counts[s])
    .map((s) => ({ name: s, value: counts[s] || 0 }))
    .concat(Object.entries(counts).filter(([s]) => !slotOrder.includes(s)).map(([name, value]) => ({ name, value })));
};

module.exports = {
  getClientQuantityByMonth,
  getDashboardKPIs,
  getRevenueByMonth,
  getOrdersByStatus,
  getTopServices,
  getPopularSlots,
};
