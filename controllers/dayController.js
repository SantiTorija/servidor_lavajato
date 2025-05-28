const { Day } = require("../models");
const { Op } = require("sequelize");

const dayController = {
  // Obtener todos los slots
  async index(req, res) {
    const where = {};

    try {
      const slots = await Slot.findAll();
      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los slots." });
    }
  },
  async availability(req, res) {
    const { year, month } = req.params;

    try {
      // Calculate the start and end dates for the requested month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Fetch days within the specified range
      const days = await Day.findAll({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        attributes: ["date", "slots_available"],
      });

      res.json(days);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  },
  async dayAvailability(req, res) {
    const { date } = req.params;

    try {
      // Calculate the start and end dates for the requested month

      // Fetch days within the specified range
      const day = await Day.findAll({
        where: {
          date: date,
        },
        attributes: ["date", "slots_available"],
      });

      // Format the response: { "YYYY-MM-DD": true/false }
      console.log(day);

      res.json(day);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  },

  // Obtener un slot por ID
  async show(req, res) {
    try {
      const slot = await Slot.findByPk(req.params.id);
      if (!slot) {
        return res.status(404).json({ error: "Slot no encontrado." });
      }
      res.json(slot);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el slot." });
    }
  },

  // Crear un nuevo slot
  async store(req, res) {
    try {
      const { date, slot } = req.body;
      // Validar que el slot no exista ya para la fecha y horario dados
      const existingDay = await Day.findOne({
        where: { date: date },
      });
      if (existingDay.slots_available.includes(slot)) {
        return res.status(400).json({ error: "El slot ya existe." });
      }
      const newSlot = await Day.create({ date, slot });
      res.status(201).json(newSlot);
    } catch (error) {
      res.status(500).json({ error: "Error al crear el slot." });
    }
  },

  // Actualizar un slot por ID
  async update(req, res) {
    try {
      const { date, time_slot, is_booked } = req.body;
      const slot = await Slot.findByPk(req.params.id);

      if (!slot) {
        return res.status(404).json({ error: "Slot no encontrado." });
      }

      await slot.update({ date, time_slot, is_booked });
      res.json(slot);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el slot." });
    }
  },

  // Eliminar un slot por ID
  async destroy(req, res) {
    try {
      const slot = await Slot.findByPk(req.params.id);

      if (!slot) {
        return res.status(404).json({ error: "Slot no encontrado." });
      }

      await slot.destroy();
      res.json({ message: "Slot eliminado correctamente." });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar el slot." });
    }
  },
};

module.exports = dayController;
