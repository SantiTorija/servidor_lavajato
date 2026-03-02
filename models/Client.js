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
      noShowCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      clientStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "activo",
        validate: {
          isIn: [["activo", "inactivo", "vetado"]],
        },
      },
      statusReason: {
        type: DataTypes.TEXT,
        allowNull: true,
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
