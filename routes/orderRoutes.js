const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/", orderController.index);
router.get("/:id", orderController.show);
router.post("/:date/:slot", orderController.store);
router.put("/:id", orderController.update);
router.delete("/:id/:date/:slot", orderController.destroy);
router.get("/status/:status/email/:email", orderController.getByStatusAndEmail);

module.exports = router;
