module.exports = (sequelize, Model, DataTypes) => {
  class Log extends Model {}

  Log.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      log: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        default: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        default: false,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      productId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      memberId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "logs",
    }
  );

  return Log;
};
