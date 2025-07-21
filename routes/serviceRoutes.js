const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, servicesController.index);
router.get("/:id", servicesController.show);
router.post("/:date/:slot", authenticateToken, servicesController.store);
router.put("/:id", authenticateToken, servicesController.update);
router.delete("/:id", authenticateToken, servicesController.destroy);

module.exports = router;
