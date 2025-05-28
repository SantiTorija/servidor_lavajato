const { Day } = require("../models");

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
    console.log(error, "error");
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

module.exports = { findOrCreate, findAndUpdate };
