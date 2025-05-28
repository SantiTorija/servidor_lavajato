const { Order } = require("../models");

const isOrder = async (id) => {
  try {
    const orders = await Order.findAll({
      where: { id: id },
    });

    if (!orders) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    const today = new Date();
    const filteredOrders = orders.filter((order) => {
      const cart = order.cart; // acceso seguro al primer ítem
      if (cart.date) {
        const orderDate = new Date(cart.date);
        return orderDate > today;
      }
      return false;
    });
    console.log(filteredOrders);
    return filteredOrders;
  } catch (error) {
    return error;
  }
};

const getOrdersByStatusAndEmail = async (status, email) => {
  try {
    const orders = await Order.findAll({ where: { phone: email } });
    console.log(orders);
    if (!orders) return [];
    const today = new Date();
    if (status === "Active") {
      return orders.filter((order) => {
        const cart = order.cart;
        if (cart.date) {
          const orderDate = new Date(cart.date);
          return orderDate > today;
        }
        return false;
      });
    }
    if (status === "Inactive") {
      return orders.filter((order) => {
        const cart = order.cart;
        if (cart.date) {
          const orderDate = new Date(cart.date);
          return orderDate < today;
        }
        return false;
      });
    }
    // Otros estados pueden implementarse aquí
    return [];
  } catch (error) {
    return error;
  }
};

module.exports = { isOrder, getOrdersByStatusAndEmail };
