const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get(
  "/clients/client-quantity-by-month",
  authenticateToken,
  analyticsController.getClientQuantityByMonth
);

module.exports = router;
