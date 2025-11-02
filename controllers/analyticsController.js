const { getClientQuantityByMonth } = require("../services/analyticsService");

const analyticsController = {
  /**
   * GET /analytics/clients/client-quantity-by-month
   * Obtiene la cantidad total de clientes por mes (progresión acumulada)
   */
  async getClientQuantityByMonth(req, res) {
    try {
      const data = await getClientQuantityByMonth();
      return res.json(data);
    } catch (error) {
      console.error("Error en getClientQuantityByMonth:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = analyticsController;
