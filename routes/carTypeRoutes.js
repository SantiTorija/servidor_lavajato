const express = require("express");
const router = express.Router();
const carTypeController = require("../controllers/carTypeController");

router.get("/", carTypeController.index);
router.get("/:id", carTypeController.show);
router.post("/", carTypeController.store);
router.put("/:id", carTypeController.update);
router.delete("/:id", carTypeController.destroy);

module.exports = router;
