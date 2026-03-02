const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get(
  "/clients/client-quantity-by-month",
  authenticateToken,
  analyticsController.getClientQuantityByMonth
);
router.get("/dashboard/kpis", authenticateToken, analyticsController.getDashboardKPIs);
router.get("/dashboard/revenue-by-month", authenticateToken, analyticsController.getRevenueByMonth);
router.get("/dashboard/orders-by-status", authenticateToken, analyticsController.getOrdersByStatus);
router.get("/dashboard/top-services", authenticateToken, analyticsController.getTopServices);
router.get("/dashboard/popular-slots", authenticateToken, analyticsController.getPopularSlots);

module.exports = router;
