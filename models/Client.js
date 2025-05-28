const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = (sequelize, Model, DataTypes, Order) => {
  class Client extends Model {}

  Client.init(
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
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
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
      sequelize,
      modelName: "client",
      /* hooks: {
        beforeBulkCreate: async (members, options) => {
          for (const member of members) {
            member.allowTransfer = true;
            member.password = await bcrypt.hash(member.password, 10);
          }
        },
        beforeCreate: async (member, options) => {
          member.allowTransfer = true;
          member.password = await bcrypt.hash(member.password, 10);
        },
        beforeDestroy: async (member, options) => {
          const UnprocessedOrders = await Order.findAll({
            where: { memberId: member.id, deliberyStatus: "InProcess" },
          });
          for (const order of UnprocessedOrders) {
            order.destroy();
          }
        },
      }, */

      defaultScope: {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      scopes: {
        privateInfo: {
          attributes: {},
        },
      },
    }
  );

  /* Client.prototype.isValidPassword = async function (password) {
    const member = await Client.scope("privateInfo").findByPk(this.id);
    const valid = await bcrypt.compare(password, member.password);
    return valid;
  };

  Client.prototype.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
  };

  Client.prototype.changePassword = async function (pass) {
    this.password = await bcrypt.hash(pass, 10);
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
    this.save();
  };
 */
  return Client;
};
