const express = require("express");
const router = express.Router();
const servicePriceController = require("../controllers/servicePriceController");

router.get("/", servicePriceController.index);
router.get("/car-type/:carTypeId", servicePriceController.getByCarType);
router.get("/:id", servicePriceController.show);
router.post("/", servicePriceController.store);
router.put("/:id", servicePriceController.update);
router.delete("/:id", servicePriceController.destroy);

module.exports = router;
