const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
//const findAndUpdate = require("../services/dayService");

module.exports = (sequelize, Model, DataTypes) => {
  class Order extends Model {}

  Order.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cart: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "order",
      hooks: {
        beforeDestroy: async (order, options) => {
          try {
            const date = order.cart[0].date;
            const slot = order.cart[0].slot;
            //findAndUpdate(date, slot);
          } catch (error) {
            throw new Error(
              `Error restoring stock before delete: ${error.message}`
            );
          }
        },
      },
    }
  );
  return Order;
};
