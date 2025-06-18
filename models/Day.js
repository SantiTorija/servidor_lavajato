const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Day = sequelize.define(
    "Day",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
      },
      slots_available: {
        type: DataTypes.JSON, // Almacena los horarios disponibles
        defaultValue: [],
      },
    },
    {
      tableName: "days",
      indexes: [
        {
          unique: true,
          fields: ["date"],
        },
      ],
    }
  );
  return Day;
};
