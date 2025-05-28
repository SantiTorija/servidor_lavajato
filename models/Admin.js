const bcrypt = require("bcryptjs");

module.exports = (sequelize, Model, DataTypes) => {
  class Admin extends Model {}

  Admin.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lastname: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING(320),
        allowNull: false,
        validate: {
          notEmpty: true,
          isLowercase: true,
        },
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "admin",
      hooks: {
        beforeBulkCreate: async (users, options) => {
          for (const user of users) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeCreate: async (user, options) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
      },

      defaultScope: {
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"],
        },
      },
      scopes: {
        privateInfo: {
          attributes: {},
        },
      },
    },
  );

  Admin.prototype.isValidPassword = async function (password) {
    const admin = await Admin.scope("privateInfo").findByPk(this.id);
    const valid = await bcrypt.compare(password, admin.password);
    return valid;
  };

  return Admin;
};
