module.exports = (sequelize, Model, DataTypes) => {
  class Day extends Model {}

  Day.init(
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
      sequelize,
      modelName: "day",

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
