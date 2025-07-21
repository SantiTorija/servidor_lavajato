const express = require("express");
const router = express.Router();
const servicePriceController = require("../controllers/servicePriceController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, servicePriceController.index);
router.get(
  "/car-type-name/:carTypeName",
  servicePriceController.getByCarTypeName
);
router.get("/car-type/:carTypeId", servicePriceController.getByCarType);
router.get("/:id", servicePriceController.show);
router.post("/", authenticateToken, servicePriceController.store);
router.put("/:id", authenticateToken, servicePriceController.update);
router.delete("/:id", authenticateToken, servicePriceController.destroy);

module.exports = router;
