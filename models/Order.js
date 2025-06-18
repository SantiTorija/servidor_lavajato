const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
//const findAndUpdate = require("../services/dayService");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
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
      tableName: "orders",
      timestamps: true,
      hooks: {
        beforeDestroy: async (order, options) => {
          try {
            const date = order.cart[0]?.date;
            const slot = order.cart[0]?.slot;
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
