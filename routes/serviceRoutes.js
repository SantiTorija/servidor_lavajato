const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");

router.get("/", servicesController.index);
router.get("/:id", servicesController.show);
router.post("/:date/:slot", servicesController.store);
router.put("/:id", servicesController.update);
router.delete("/:id", servicesController.destroy);

module.exports = router;
