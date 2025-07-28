const { Day } = require("../models");
const { Op } = require("sequelize");
const dayService = require("../services/dayService");

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

  // Agregar slot a un día específico
  async addSlot(req, res) {
    try {
      const { date, slot } = req.body;

      if (!date || !slot) {
        return res.status(400).json({
          error: "Se requieren los parámetros 'date' y 'slot'",
        });
      }

      const result = await dayService.addSlotToDay(date, slot);
      res.json({
        message: "Slot agregado correctamente",
        day: result,
      });
    } catch (error) {
      console.error("Error al agregar slot:", error);
      res.status(500).json({
        error: "Error al agregar slot al día",
      });
    }
  },

  // Eliminar slot de un día específico
  async removeSlot(req, res) {
    try {
      const { date, slot } = req.body;
      if (!date || !slot) {
        return res
          .status(400)
          .json({ error: "Se requieren los parámetros 'date' y 'slot'" });
      }
      const result = await dayService.removeSlotFromDay(date, slot);
      if (!result) {
        return res.status(404).json({ error: "Día no encontrado" });
      }
      res.json({
        message: "Slot marcado como disponible exitosamente",
        day: result,
      });
    } catch (error) {
      console.error("Error al eliminar slot:", error);
      res
        .status(500)
        .json({ error: "Error al marcar el slot como disponible" });
    }
  },

  // Obtener eventos para FullCalendar
  async calendarEvents(req, res) {
    console.log(req.query);
    try {
      const { start, end, day, month, week } = req.query;
      const events = await dayService.getCalendarEvents({
        start,
        end,
        day,
        month,
        week,
      });
      res.json(events);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener eventos del calendario." });
    }
  },

  // Obtener disponibilidad por rango de fechas (para admin)
  async availabilityByRange(req, res) {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "Se requieren los parámetros 'startDate' y 'endDate'",
      });
    }

    try {
      // Usar el servicio para obtener la disponibilidad
      const days = await dayService.getAvailabilityByRange(startDate, endDate);
      res.json(days);
    } catch (error) {
      console.error("Error fetching availability by range:", error);

      // Manejar errores específicos del servicio
      if (error.message.includes("Formato de fecha inválido")) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to fetch availability by range" });
    }
  },

  // Obtener eventos procesados para un rango de fechas (optimizado)
  async processedEventsByRange(req, res) {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "Se requieren los parámetros 'startDate' y 'endDate'",
      });
    }

    try {
      // Usar el servicio para obtener eventos procesados
      const events = await dayService.getProcessedEventsForRange(
        startDate,
        endDate
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching processed events by range:", error);

      // Manejar errores específicos del servicio
      if (error.message.includes("Formato de fecha inválido")) {
        return res.status(400).json({ error: error.message });
      }

      res
        .status(500)
        .json({ error: "Failed to fetch processed events by range" });
    }
  },
};

module.exports = dayController;
