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
      email: {
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
        /*  beforeCreate: async (order, options) => {
          // Importar aquí para evitar dependencias circulares
          const { Day } = require("./index");
          // cart es un objeto
          const date = order.cart?.date;
          const slot = order.cart?.slot;
          if (!date || !slot) {
            throw new Error("Faltan datos de fecha o slot en la orden");
          }
          // Buscar el día correspondiente
          const day = await Day.findOne({ where: { date } });

          // Verificar si el slot ya está reservado (no está en slots_available)
          if (!day.slots_available.includes(slot)) {
            throw new Error("el slot ya fue reservado");
          }
        }, */
      },
    }
  );
  return Order;
};
