const slugify = require("slugify");

module.exports = (sequelize, Model, DataTypes) => {
  class Service extends Model {}

  Service.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING(140),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      carType: {
        type: DataTypes.STRING(140),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "service",
      hooks: {
        beforeBulkCreate: async (services, options) => {
          for (const service of services) {
            service.slug = slugify(service.type, {
              lower: true,
              strict: true,
            });
          }
        },
        beforeCreate: async (service, options) => {
          service.slug = slugify(service.type, {
            lower: true,
            strict: true,
          });
        },
      },
    }
  );

  return Service;
};
