const express = require("express");
const dayController = require("../controllers/dayController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Obtener todos los slots
router.get("/", dayController.index);

router.get("/availability/:year/:month", dayController.availability);

router.get("/dayAvailability/:date", dayController.dayAvailability);
// Endpoint para eventos de calendario (FullCalendar)
router.get("/calendar-events", authenticateToken, dayController.calendarEvents);

// Agregar slot a un día específico
router.post("/add-slot", authenticateToken, dayController.addSlot);

// Eliminar slot de un día específico
router.post("/remove-slot", authenticateToken, dayController.removeSlot);

// Obtener un slot por ID
router.get("/:id", dayController.show);

// Crear un nuevo slot
router.post("/", authenticateToken, dayController.store);

// Actualizar un slot por ID
router.put("/:id", authenticateToken, dayController.update);

// Eliminar un slot por ID
router.delete("/:id", authenticateToken, dayController.destroy);

module.exports = router;
