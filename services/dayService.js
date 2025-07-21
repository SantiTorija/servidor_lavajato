const {
  sequelize,
  Day,
  Order,
  Client,
  Service,
  CarType,
} = require("../models");
const { Op } = require("sequelize");

const findOrCreate = async (date, slot) => {
  const t = await sequelize.transaction();
  try {
    console.log("findOrCreate: buscando día", date, slot);
    let day = await Day.findOne({
      where: { date },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    console.log("findOrCreate: resultado búsqueda", day);
    if (!day) {
      try {
        day = await Day.create(
          { date, slots_available: [slot] },
          { transaction: t }
        );
        console.log("findOrCreate: día creado", day);
        await t.commit();
        return day;
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          day = await Day.findOne({
            where: { date },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          console.log("findOrCreate: día encontrado tras error unique", day);
          // Aquí sigue el flujo normal para chequeo de slot
        } else {
          throw err;
        }
      }
    }
    // Solo si el día ya existía:
    console.log("ANTES DEL PUSH:", day.slots_available);
    if (day.slots_available.includes(slot)) {
      console.log("findOrCreate: slot ya reservado");
      await t.rollback();
      return { error: "el slot ya fue reservado" };
    }
    day.slots_available.push(slot);
    console.log("DESPUÉS DEL PUSH:", day.slots_available);
    day.changed("slots_available", true);
    await day.save({ transaction: t });

    // Releer el registro después de guardar
    const dayAfter = await Day.findOne({
      where: { date },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    console.log("DESPUÉS DEL SAVE Y REREAD:", dayAfter.slots_available);
    const count = dayAfter.slots_available.filter((s) => s === slot).length;
    console.log("COUNT DEL SLOT:", count);
    if (count > 1) {
      console.log("findOrCreate: condición de carrera detectada, rollback");
      await t.rollback();
      return { error: "el slot ya fue reservado" };
    }
    console.log("findOrCreate: slot agregado y día guardado");
    await t.commit();
    return day;
  } catch (error) {
    await t.rollback();
    console.log("findOrCreate: error", error);
    throw error;
  }
};

const findAndUpdate = async (date, slot) => {
  try {
    // 1. Buscar o crear el día
    const existingDay = await Day.findOne({
      where: { date: date },
    });

    if (existingDay) {
      // Actualizar usando Sequelize correctamente
      existingDay.slots_available = existingDay.slots_available.filter(
        (slots) => slots !== slot
      );

      existingDay.changed("slots_available", true); // Marca explícitamente el campo como modificado
      await existingDay.save();
    }
    return existingDay;
  } catch (error) {
    return error;
  }
};

/* const findAndDestroySlot = async (date, slot) => {
  try {
    const existingDay = await Day.findOne({ where: { date: date } });
    if (existingDay) {
      existingDay.slots_available = existingDay.slots_available.filter(
        (s) => s !== slot
      );
      existingDay.changed("slots_available", true);
      await existingDay.save();
    }
    return existingDay;
  } catch (error) {
    return error;
  }
}; */

function parseHourTo24(str) {
  // Soporta "8:00 a.m.", "1:00 p.m.", etc.
  const [time, period] = str.split(" ");
  let [hour, minute] = time.split(":").map(Number);

  let p = period?.toLowerCase();
  if (p === "p.m." && hour !== 12) hour += 12;
  if (p === "a.m." && hour === 12) hour = 0;
  if (!minute) minute = 0;

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:00`;
}

async function getCalendarEvents({ start, end, day, month, week }) {
  const where = {};
  if (start && end) {
    where.date = { [Op.between]: [start, end] };
  } else if (day) {
    where.date = day;
  } else if (month) {
    where.date = { [Op.like]: `${month}-%` };
  } else if (week) {
    const [weekStart, weekEnd] = week.split(",");
    where.date = { [Op.between]: [weekStart, weekEnd] };
  }
  const days = await Day.findAll({ where });
  const events = [];
  const DURATION_HOURS = 2;

  // Crear un array de promesas para buscar órdenes correspondientes
  const orderPromises = days.map(async (day) => {
    const dayOrders = [];
    for (const slot of day.slots_available || []) {
      try {
        const order = await Order.findOne({
          where: {
            cart: {
              slot: slot,
              date: day.date,
            },
          },
          include: [
            {
              model: Client,
              attributes: ["firstname", "lastname", "phone", "car"],
            },
            {
              model: Service,
              attributes: ["name"],
            },
            {
              model: CarType,
              attributes: ["name"],
            },
          ],
        });
        dayOrders.push({ slot, order });
      } catch (error) {
        console.error(
          `Error buscando orden para ${day.date} - ${slot}:`,
          error
        );
        dayOrders.push({ slot, order: null });
      }
    }
    return { day, dayOrders };
  });

  // Ejecutar todas las búsquedas de órdenes
  const daysWithOrders = await Promise.all(orderPromises);

  daysWithOrders.forEach(({ day, dayOrders }) => {
    dayOrders.forEach(({ slot, order }, idx) => {
      const startTime = parseHourTo24(slot);
      // Calcular end sumando DURATION_HOURS
      let [h, m] = startTime.split(":").map(Number);
      h += DURATION_HOURS;
      if (h >= 24) h -= 24;
      const endTime = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:00`;

      // Crear el evento base
      const event = {
        id: `${day.id}-${idx}`,
        title: `Turno ${slot}`,
        start: `${day.date}T${startTime}`,
        end: `${day.date}T${endTime}`,
      };

      // Si hay una orden correspondiente, agregar información del cliente y vehículo
      if (order) {
        const cliente = {
          nombre: order.Client.firstname,
          apellido: order.Client.lastname,
          phone: order.Client.phone,
        };
        const vehiculo = {
          marca: order.Client.car.marca,
          modelo: order.Client.car.modelo,
        };
        const servicio = order.Service.name;
        const tipoAuto = order.CarType.name;
        const total = order.cart.total;

        event.title = `${cliente.nombre} ${cliente.apellido}`;
        event.cliente = cliente;
        event.vehiculo = vehiculo;
        event.servicio = servicio;
        event.tipoAuto = tipoAuto;
        event.total = total;
        event.orderId = order.id;
      } else {
        // Si no hay orden asociada, es un slot reservado por admin
        event.admin_created = true;
        event.title = "Reservado por Admin";
      }

      events.push(event);
    });
  });

  return events;
}

async function addSlotToDay(date, slot) {
  try {
    // Buscar si existe un día con la fecha especificada
    let day = await Day.findOne({
      where: { date: date },
    });

    if (!day) {
      // Si no existe, crear el día con el slot
      day = await Day.create({
        date: date,
        slots_available: [slot],
      });
      console.log(`Día creado para ${date} con slot ${slot}`);
    } else {
      // Si existe, agregar el slot al array existente
      if (!day.slots_available.includes(slot)) {
        day.slots_available.push(slot);
        day.changed("slots_available", true);
        await day.save();
        console.log(`Slot ${slot} agregado al día ${date}`);
      } else {
        console.log(`El slot ${slot} ya existe para el día ${date}`);
      }
    }

    return day;
  } catch (error) {
    console.error("Error en addSlotToDay:", error);
    throw error;
  }
}

async function removeSlotFromDay(date, slot) {
  try {
    const day = await Day.findOne({ where: { date } });
    if (!day) return null;
    day.slots_available = day.slots_available.filter((s) => s !== slot);
    day.changed("slots_available", true);
    await day.save();
    return day;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  findOrCreate,
  findAndUpdate,
  getCalendarEvents,
  addSlotToDay,
  removeSlotFromDay,
};
