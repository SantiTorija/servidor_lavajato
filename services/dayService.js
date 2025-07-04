const { sequelize, Day } = require("../models");
const { Op } = require("sequelize");

const findOrCreate = async (date, slot) => {
  const t = await sequelize.transaction();
  try {
    let day = await Day.findOne({
      where: { date },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!day) {
      try {
        day = await Day.create(
          { date, slots_available: [slot] },
          { transaction: t }
        );
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          day = await Day.findOne({
            where: { date },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
        } else {
          throw err;
        }
      }
    }
    if (day) {
      if (day.slots_available.includes(slot)) {
        await t.rollback();
        throw new Error("el slot ya fue reservado");
      }
      day.slots_available.push(slot);
      day.changed("slots_available", true);
      await day.save({ transaction: t });
    }
    await t.commit();
    return day;
  } catch (error) {
    await t.rollback();
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

  days.forEach((day) => {
    (day.slots_available || []).forEach((slot, idx) => {
      const startTime = parseHourTo24(slot);
      // Calcular end sumando DURATION_HOURS
      let [h, m] = startTime.split(":").map(Number);
      h += DURATION_HOURS;
      if (h >= 24) h -= 24;
      const endTime = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:00`;

      events.push({
        id: `${day.id}-${idx}`,
        title: `Turno ${slot}`,
        start: `${day.date}T${startTime}`,
        end: `${day.date}T${endTime}`,
      });
    });
  });
  return events;
}

module.exports = { findOrCreate, findAndUpdate, getCalendarEvents };
