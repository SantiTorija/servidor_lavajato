const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", orderController.index);
router.get("/:id", orderController.show);
router.post("/:date/:slot/:email", orderController.store);
router.post("/admin", authenticateToken, orderController.storeAdmin);
router.put("/:id", orderController.update);
router.delete("/:id/:date/:slot", orderController.destroy);
router.get("/status/:status/email/:email", orderController.getByStatusAndEmail);

module.exports = router;
