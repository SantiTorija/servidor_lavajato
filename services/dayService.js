const { Day } = require("../models");
const { Op } = require("sequelize");

const findOrCreate = async (date, slot) => {
  try {
    console.log(date, slot);

    const existingDay = await Day.findOne({
      where: { date: date },
    });
    console.log(existingDay);
    if (!existingDay) {
      // Actualizar usando Sequelize correctamente
      await Day.create({
        date: date,
        slots_available: [slot],
      });
    }

    if (existingDay) {
      // Actualizar usando Sequelize correctamente
      existingDay.slots_available.push(slot);
      existingDay.changed("slots_available", true); // Marca explícitamente el campo como modificado
      await existingDay.save();
    }
    return existingDay;
  } catch (error) {
    return error;
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
  // Soporta "8 AM", "10 PM", "13", "15", etc.
  const [hourStr, period] = str.split(" ");
  let h = parseInt(hourStr, 10);

  if (!period) {
    // Si no hay AM/PM, asume 24hs
    return h.toString().padStart(2, "0") + ":00:00";
  }

  // Si la hora es mayor a 12, ignora el periodo y asume 24hs
  if (h > 12) {
    return h.toString().padStart(2, "0") + ":00:00";
  }

  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h.toString().padStart(2, "0") + ":00:00";
}

async function getCalendarEvents({ start, end, day, month, week }) {
  const where = {};
  if (start && end) {
    where.date = { [Op.between]: [start, end] };
  } else if (day) {
    where.date = day;
  } else if (month) {
    // month: YYYY-MM
    where.date = { [Op.like]: `${month}-%` };
  } else if (week) {
    // week: YYYY-MM-DD,YYYY-MM-DD
    const [weekStart, weekEnd] = week.split(",");
    where.date = { [Op.between]: [weekStart, weekEnd] };
  }
  const days = await Day.findAll({ where });
  const events = [];
  days.forEach((day) => {
    (day.slots_available || []).forEach((slot, idx) => {
      // slot: "8 AM - 10 AM"
      const [from, , to] = slot.split(" ");
      const startTime = parseHourTo24(from + " " + slot.split(" ")[1]);
      const endTime = parseHourTo24(to + " " + slot.split(" ")[3]);
      events.push({
        id: `${day.id}-${idx}`,
        title: `${slot}`,
        start: `${day.date}T${startTime}`,
        end: `${day.date}T${endTime}`,
      });
    });
  });
  return events;
}

module.exports = { findOrCreate, findAndUpdate, getCalendarEvents };
