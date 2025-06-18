const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  const ServicePrice = sequelize.define(
    "ServicePrice",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.01 },
      },
    },
    {
      tableName: "ServicePrices",
      timestamps: true,
      indexes: [{ unique: true, fields: ["serviceId", "carTypeId"] }],
    }
  );
  return ServicePrice;
};
