const {
  getClientQuantityByMonth,
  getDashboardKPIs,
  getRevenueByMonth,
  getOrdersByStatus,
  getTopServices,
  getPopularSlots,
} = require("../services/analyticsService");

const analyticsController = {
  async getClientQuantityByMonth(req, res) {
    try {
      const data = await getClientQuantityByMonth();
      return res.json(data);
    } catch (error) {
      console.error("Error en getClientQuantityByMonth:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getDashboardKPIs(req, res) {
    try {
      const data = await getDashboardKPIs();
      return res.json(data);
    } catch (error) {
      console.error("Error en getDashboardKPIs:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getRevenueByMonth(req, res) {
    try {
      const data = await getRevenueByMonth();
      return res.json(data);
    } catch (error) {
      console.error("Error en getRevenueByMonth:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getOrdersByStatus(req, res) {
    try {
      const data = await getOrdersByStatus();
      return res.json(data);
    } catch (error) {
      console.error("Error en getOrdersByStatus:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getTopServices(req, res) {
    try {
      const data = await getTopServices();
      return res.json(data);
    } catch (error) {
      console.error("Error en getTopServices:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getPopularSlots(req, res) {
    try {
      const data = await getPopularSlots();
      return res.json(data);
    } catch (error) {
      console.error("Error en getPopularSlots:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = analyticsController;
