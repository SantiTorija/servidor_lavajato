const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Config = sequelize.define(
    "Config",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "configs",
      timestamps: true,
    }
  );
  return Config;
};
