const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authenticateToken = require("../middleware/authenticateToken");

// Middleware opcional para proteger el endpoint del cron
function verifyCron(req, res, next) {
  const auth = req.header("Authorization") || "";
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.set("Cache-Control", "no-store");
  next();
}

router.get("/", orderController.index);
// alias GET solo para cron
router.get(
  "/reserve-notification",
  verifyCron,
  orderController.reserveNotification
);
router.get("/status/:status/email/:email", orderController.getByStatusAndEmail);
router.get("/:id", orderController.show);
router.post("/admin", authenticateToken, orderController.storeAdmin);
router.post("/:date/:slot/:email", orderController.store);
router.post("/reserve-notification", orderController.reserveNotification);
router.put("/:id", orderController.update);
router.delete("/:id/:date/:slot", orderController.destroy);

module.exports = router;
