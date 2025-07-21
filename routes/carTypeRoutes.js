const express = require("express");
const router = express.Router();
const carTypeController = require("../controllers/carTypeController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", carTypeController.index);
router.get("/:id", carTypeController.show);
router.post("/", authenticateToken, carTypeController.store);
router.put("/:id", authenticateToken, carTypeController.update);
router.delete("/:id", authenticateToken, carTypeController.destroy);

module.exports = router;
