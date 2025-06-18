const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Client = sequelize.define(
    "Client",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: { notEmpty: true },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: { notEmpty: true },
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      car: {
        type: DataTypes.JSON,
        required: true,
      },
    },
    {
      tableName: "clients",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      scopes: {
        privateInfo: { attributes: {} },
      },
    }
  );
  // Métodos de instancia y hooks pueden agregarse aquí si se desea
  return Client;
};
