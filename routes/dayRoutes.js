const express = require("express");
const dayController = require("../controllers/dayController");

const router = express.Router();

// Obtener todos los slots
router.get("/", dayController.index);

router.get("/availability/:year/:month", dayController.availability);

router.get("/dayAvailability/:date", dayController.dayAvailability);

// Obtener un slot por ID
router.get("/:id", dayController.show);

// Crear un nuevo slot
router.post("/", dayController.store);

// Actualizar un slot por ID
router.put("/:id", dayController.update);

// Eliminar un slot por ID
router.delete("/:id", dayController.destroy);

module.exports = router;
