const express = require("express");
const dayController = require("../controllers/dayController");

const router = express.Router();

// Obtener todos los slots
router.get("/", dayController.index);

router.get("/availability/:year/:month", dayController.availability);

router.get("/dayAvailability/:date", dayController.dayAvailability);
// Endpoint para eventos de calendario (FullCalendar)
router.get("/calendar-events", dayController.calendarEvents);

// Agregar slot a un día específico
router.post("/add-slot", dayController.addSlot);

// Eliminar slot de un día específico
router.post("/remove-slot", dayController.removeSlot);

// Obtener un slot por ID
router.get("/:id", dayController.show);

// Crear un nuevo slot
router.post("/", dayController.store);

// Actualizar un slot por ID
router.put("/:id", dayController.update);

// Eliminar un slot por ID
router.delete("/:id", dayController.destroy);

module.exports = router;
