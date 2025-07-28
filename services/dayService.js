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
    // Asegurar formato consistente "08:30"
    const formattedSlot = formatSlotTime(slot);
    console.log(
      "findOrCreate: buscando día",
      date,
      "slot original:",
      slot,
      "formateado:",
      formattedSlot
    );

    let day = await Day.findOne({
      where: { date },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    console.log("findOrCreate: resultado búsqueda", day);
    if (!day) {
      try {
        day = await Day.create(
          { date, slots_available: [formattedSlot] },
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
    if (day.slots_available.includes(formattedSlot)) {
      console.log("findOrCreate: slot ya reservado");
      await t.rollback();
      return { error: "el slot ya fue reservado" };
    }
    day.slots_available.push(formattedSlot);
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
    const count = dayAfter.slots_available.filter(
      (s) => s === formattedSlot
    ).length;
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
    // Asegurar formato consistente "08:30"
    const formattedSlot = formatSlotTime(slot);
    console.log(
      "findAndUpdate: removiendo slot",
      "slot original:",
      slot,
      "formateado:",
      formattedSlot
    );

    // 1. Buscar o crear el día
    const existingDay = await Day.findOne({
      where: { date: date },
    });

    if (existingDay) {
      // Actualizar usando Sequelize correctamente
      existingDay.slots_available = existingDay.slots_available.filter(
        (slots) => slots !== formattedSlot
      );

      existingDay.changed("slots_available", true); // Marca explícitamente el campo como modificado
      await existingDay.save();
      console.log("findAndUpdate: slot removido exitosamente");
    }
    return existingDay;
  } catch (error) {
    console.error("findAndUpdate: error", error);
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
  console.log(`🕐 parseHourTo24 recibió: "${str}"`);

  // Si ya está en formato 24h (sin AM/PM), devolver directamente sin segundos
  if (!str.includes(" ")) {
    console.log(`🕐 Formato 24h detectado, devolviendo sin segundos`);
    return str;
  }

  // Soporta "8:00 a.m.", "1:00 p.m.", etc.
  const [time, period] = str.split(" ");
  let [hour, minute] = time.split(":").map(Number);

  let p = period?.toLowerCase();
  if (p === "p.m." && hour !== 12) hour += 12;
  if (p === "a.m." && hour === 12) hour = 0;
  if (!minute) minute = 0;

  const result = `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;

  console.log(`🕐 parseHourTo24 resultado: "${result}"`);
  return result;
}

// Función auxiliar para asegurar formato consistente "08:30"
function formatSlotTime(slot) {
  if (!slot) return slot;

  // Si tiene segundos "08:30:00", quitarlos
  if (/^\d{2}:\d{2}:\d{2}$/.test(slot)) {
    return slot.substring(0, 5);
  }

  // Si ya tiene el formato correcto "08:30", devolverlo
  if (/^\d{2}:\d{2}$/.test(slot)) {
    return slot;
  }

  // Si tiene formato "8:30", convertirlo a "08:30"
  if (/^\d{1}:\d{2}$/.test(slot)) {
    const [hour, minute] = slot.split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  }

  return slot;
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
      const startTime = formatSlotTime(parseHourTo24(slot));
      // Calcular end sumando DURATION_HOURS
      let [h, m] = startTime.split(":").map(Number);
      h += DURATION_HOURS;
      if (h >= 24) h -= 24;
      const endTime = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;

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
    console.log(`🔧 addSlotToDay recibió: date=${date}, slot="${slot}"`);

    // Asegurar formato consistente "08:30"
    const formattedSlot = formatSlotTime(slot);
    console.log(`🔧 Slot formateado: "${formattedSlot}"`);

    // Buscar si existe un día con la fecha especificada
    let day = await Day.findOne({
      where: { date: date },
    });

    if (!day) {
      // Si no existe, crear el día con el slot
      day = await Day.create({
        date: date,
        slots_available: [formattedSlot],
      });
      console.log(`✅ Día creado para ${date} con slot ${formattedSlot}`);
    } else {
      // Si existe, agregar el slot al array existente
      if (!day.slots_available.includes(formattedSlot)) {
        day.slots_available.push(formattedSlot);
        day.changed("slots_available", true);
        await day.save();
        console.log(`✅ Slot ${formattedSlot} agregado al día ${date}`);
      } else {
        console.log(
          `⚠️ El slot ${formattedSlot} ya existe para el día ${date}`
        );
      }
    }

    return day;
  } catch (error) {
    console.error("❌ Error en addSlotToDay:", error);
    throw error;
  }
}

async function removeSlotFromDay(date, slot) {
  try {
    console.log(`🔧 removeSlotFromDay recibió: date=${date}, slot="${slot}"`);

    // Asegurar formato consistente "08:30"
    const formattedSlot = formatSlotTime(slot);
    console.log(`🔧 Slot formateado: "${formattedSlot}"`);

    const day = await Day.findOne({ where: { date } });
    if (!day) return null;

    day.slots_available = day.slots_available.filter(
      (s) => s !== formattedSlot
    );
    day.changed("slots_available", true);
    await day.save();
    console.log(`✅ Slot ${formattedSlot} removido del día ${date}`);
    return day;
  } catch (error) {
    console.error("❌ Error en removeSlotFromDay:", error);
    throw error;
  }
}

/**
 * Obtener disponibilidad de días por rango de fechas
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} endDate - Fecha de fin en formato YYYY-MM-DD
 * @returns {Promise<Array>} - Array de días con su disponibilidad
 */
async function getAvailabilityByRange(startDate, endDate) {
  try {
    // Validar formato de fechas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Formato de fecha inválido. Use 'YYYY-MM-DD'");
    }

    // Fetch days within the specified range
    const days = await Day.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["date", "slots_available"],
    });

    return days;
  } catch (error) {
    console.error("Error en getAvailabilityByRange:", error);
    throw error;
  }
}

/**
 * Obtener eventos procesados para un rango de fechas (optimizado para frontend)
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} endDate - Fecha de fin en formato YYYY-MM-DD
 * @returns {Promise<Array>} - Array de eventos listos para FullCalendar
 */
async function getProcessedEventsForRange(startDate, endDate) {
  try {
    console.log("🚀 Iniciando getProcessedEventsForRange");
    console.log("📅 Rango solicitado:", startDate, "a", endDate);

    // Validar formato de fechas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Formato de fecha inválido. Use 'YYYY-MM-DD'");
    }

    // Definir slots disponibles (formato 24h sin ceros iniciales)
    const availableSlots = [
      { start: "8:30", end: "10:30" },
      { start: "10:30", end: "12:30" },
      { start: "14:00", end: "16:00" },
      { start: "16:00", end: "18:00" },
    ];

    console.log("🔍 Buscando días en la tabla Day...");
    // Obtener días con disponibilidad (solo los que existen en la tabla Day)
    const days = await Day.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["date", "slots_available"],
    });

    console.log("📋 Días encontrados en Day:", days.length);
    days.forEach((day) => {
      console.log(
        `  - ${day.date}: slots ocupados = [${day.slots_available.join(", ")}]`
      );
    });

    console.log("🛒 Buscando órdenes en el rango...");
    // Obtener órdenes para el rango de fechas
    const orders = await Order.findAll({
      where: {
        "cart.date": {
          [Op.between]: [startDate, endDate],
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

    console.log("📦 Órdenes encontradas:", orders.length);
    orders.forEach((order) => {
      console.log(
        `  - ${order.cart?.date} ${order.cart?.slot}: ${order.Client?.firstname} ${order.Client?.lastname}`
      );
    });

    const events = [];
    const DURATION_HOURS = 2;

    // Generar array de fechas entre startDate y endDate
    const datesInRange = [];
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().split("T")[0];
      datesInRange.push(dateString);
    }

    console.log("📅 Fechas a procesar:", datesInRange);

    // Procesar cada fecha
    datesInRange.forEach((date) => {
      console.log(`\n📅 Procesando fecha: ${date}`);

      // Buscar si existe un registro en Day para esta fecha
      const dayRecord = days.find((d) => d.date.split("T")[0] === date);

      if (!dayRecord) {
        console.log(
          `  ✅ Día ${date} NO existe en Day → TODOS los slots están LIBRES`
        );

        // Día no existe en Day → TODOS los slots están libres
        availableSlots.forEach((slot, idx) => {
          const slotTime = slot.start;

          // Calcular tiempos de inicio y fin usando parseHourTo24 para consistencia
          const startTime = formatSlotTime(parseHourTo24(slotTime));
          let [h, m] = startTime.split(":").map(Number);
          console.log(
            `      ⏰ Cálculo de tiempo para ${slotTime}: h=${h}, m=${m}`
          );
          h += DURATION_HOURS;
          if (h >= 24) h -= 24;
          const endTime = `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}`;
          console.log(
            `      ⏰ Tiempos calculados: start=${startTime}, end=${endTime}`
          );

          // Verificar formato de fecha para FullCalendar
          const eventStart = `${date}T${startTime}`;
          const eventEnd = `${date}T${endTime}`;
          console.log(
            `      📅 Fechas del evento: start="${eventStart}", end="${eventEnd}"`
          );

          // Crear evento libre
          const event = {
            id: `free-slot-${date}-${idx}`,
            title: "Disponible",
            start: `${date}T${startTime}`, // Formato ISO para FullCalendar
            end: `${date}T${endTime}`, // Formato ISO para FullCalendar
            freeSlot: true,
            backgroundColor: "#28a745",
            borderColor: "#1e7e34",
          };

          events.push(event);
          console.log(`    🟢 Slot ${slotTime}: DISPONIBLE`);
        });
      } else {
        console.log(`  ⚠️ Día ${date} SÍ existe en Day`);
        console.log(
          `  📋 Slots ocupados: [${dayRecord.slots_available.join(", ")}]`
        );

        // Día existe en Day → Los slots en slots_available están ocupados
        const slotsOcupados = dayRecord.slots_available || [];
        console.log(`  🔍 Slots ocupados en DB: [${slotsOcupados.join(", ")}]`);

        // Procesar cada slot
        availableSlots.forEach((slot, idx) => {
          const slotTime = slot.start;
          console.log(`  🔍 Procesando slot: "${slotTime}"`);

          // Comparar slots normalizando ambos a formato "08:30"
          const normalizedSlotTime = formatSlotTime(slotTime);
          const isOccupied = slotsOcupados.some(
            (occupiedSlot) =>
              formatSlotTime(occupiedSlot) === normalizedSlotTime
          );

          console.log(
            `    🔍 Slot ${slotTime}: ${isOccupied ? "OCUPADO" : "LIBRE"}`
          );
          console.log(
            `    📋 Comparando con slots ocupados: [${slotsOcupados.join(
              ", "
            )}]`
          );
          console.log(`    🔍 Comparación directa: slotTime="${slotTime}"`);
          console.log(`    🔍 Slots ocupados: [${slotsOcupados.join(", ")}]`);
          console.log(`    🔍 Resultado: ${isOccupied ? "OCUPADO" : "LIBRE"}`);

          if (isOccupied) {
            // Buscar orden para este slot específico
            console.log(`      🔍 Buscando orden para slot: ${slotTime}`);
            console.log(
              `      🔍 Total de órdenes a revisar: ${orders.length}`
            );

            const order = orders.find((order) => {
              const orderDate = order.cart?.date;
              const orderSlot = formatSlotTime(order.cart?.slot); // Normalizar a "08:30"
              const normalizedSlotTime = formatSlotTime(slotTime); // Normalizar a "08:30"

              console.log(
                `      🔍 Comparando: orderDate="${orderDate}" vs date="${date}"`
              );
              console.log(
                `      🔍 Comparando: orderSlot="${orderSlot}" vs normalizedSlotTime="${normalizedSlotTime}"`
              );

              const match =
                orderDate === date && orderSlot === normalizedSlotTime;
              if (match) {
                console.log(
                  `      🔍 Orden encontrada para ${date} ${slotTime}: ${order.Client?.firstname} ${order.Client?.lastname}`
                );
              }
              return match;
            });

            // Calcular tiempos de inicio y fin (slotTime ya está en formato 24h)
            const startTime = formatSlotTime(slotTime); // Asegurar formato "08:30"
            let [h, m] = startTime.split(":").map(Number);
            console.log(
              `      ⏰ Cálculo de tiempo para ${slotTime}: h=${h}, m=${m}`
            );
            h += DURATION_HOURS;
            if (h >= 24) h -= 24;
            const endTime = `${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")}`;
            console.log(
              `      ⏰ Tiempos calculados: start=${startTime}, end=${endTime}`
            );

            // Verificar formato de fecha para FullCalendar
            const eventStart = `${date}T${startTime}`;
            const eventEnd = `${date}T${endTime}`;
            console.log(
              `      📅 Fechas del evento: start="${eventStart}", end="${eventEnd}"`
            );

            // Crear evento base
            const event = {
              id: `${date}-${idx}`,
              title: `Turno ${slotTime}`,
              start: `${date}T${startTime}`, // Formato ISO para FullCalendar
              end: `${date}T${endTime}`, // Formato ISO para FullCalendar
            };

            if (order) {
              console.log(
                `      👤 Orden encontrada: ${order.Client?.firstname} ${order.Client?.lastname}`
              );
              console.log(`      📝 Slot de orden: ${order.cart?.slot}`);

              // Evento con orden de cliente
              const cliente = {
                nombre: order.Client.firstname,
                apellido: order.Client.lastname,
                phone: order.Client.phone,
              };
              const vehiculo = {
                marca: order.Client.car.marca,
                modelo: order.Client.car.modelo,
              };

              event.title = `${cliente.nombre} ${cliente.apellido}`;
              event.cliente = cliente;
              event.vehiculo = vehiculo;
              event.servicio = order.Service.name;
              event.tipoAuto = order.CarType.name;
              event.total = order.cart.total;
              event.orderId = order.id;
            } else {
              console.log(`      🔴 Sin orden → Reservado por Admin`);
              console.log(
                `      📊 Creando evento de admin para slot ${slotTime}`
              );

              // Slot reservado por admin
              event.admin_created = true;
              event.title = "Reservado por Admin";
              event.backgroundColor = "#dc3545";
              event.borderColor = "#c82333";
            }

            console.log(
              `      ✅ Evento agregado: ${event.title} (${event.start})`
            );
            events.push(event);
          } else {
            console.log(`      🟢 Slot libre`);

            // Slot libre
            const startTime = formatSlotTime(slotTime); // Asegurar formato "08:30"
            let [h, m] = startTime.split(":").map(Number);
            console.log(
              `      ⏰ Cálculo de tiempo para ${slotTime}: h=${h}, m=${m}`
            );
            h += DURATION_HOURS;
            if (h >= 24) h -= 24;
            const endTime = `${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")}`;
            console.log(
              `      ⏰ Tiempos calculados: start=${startTime}, end=${endTime}`
            );

            const event = {
              id: `free-slot-${date}-${idx}`,
              title: "Disponible",
              start: `${date}T${startTime}`,
              end: `${date}T${endTime}`,
              freeSlot: true,
              backgroundColor: "#28a745",
              borderColor: "#1e7e34",
            };

            events.push(event);
          }
        });
      }
    });

    console.log(`\n✅ Total de eventos generados: ${events.length}`);

    // Resumen de tipos de eventos
    const eventosCliente = events.filter((e) => e.orderId);
    const eventosAdmin = events.filter((e) => e.admin_created);
    const eventosLibres = events.filter((e) => e.freeSlot);

    console.log(`📊 Resumen de eventos:`);
    console.log(`   - Eventos de cliente: ${eventosCliente.length}`);
    console.log(`   - Eventos de admin: ${eventosAdmin.length}`);
    console.log(`   - Eventos libres: ${eventosLibres.length}`);

    // Mostrar algunos ejemplos de eventos
    if (eventosAdmin.length > 0) {
      console.log(
        `   🔴 Ejemplos de eventos admin:`,
        eventosAdmin.slice(0, 2).map((e) => `${e.title} (${e.start})`)
      );
    }
    if (eventosCliente.length > 0) {
      console.log(
        `   👤 Ejemplos de eventos cliente:`,
        eventosCliente.slice(0, 2).map((e) => `${e.title} (${e.start})`)
      );
    }
    if (eventosLibres.length > 0) {
      console.log(
        `   🟢 Ejemplos de eventos libres:`,
        eventosLibres.slice(0, 2).map((e) => `${e.title} (${e.start})`)
      );
    }

    console.log("🎯 getProcessedEventsForRange completado");

    return events;
  } catch (error) {
    console.error("❌ Error en getProcessedEventsForRange:", error);
    throw error;
  }
}

module.exports = {
  findOrCreate,
  findAndUpdate,
  getCalendarEvents,
  addSlotToDay,
  removeSlotFromDay,
  getAvailabilityByRange,
  getProcessedEventsForRange,
};
