const { Sequelize, Model, DataTypes } = require("sequelize");
const pg = require("pg");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    //dialectModule: pg,
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const Admin = require("./Admin")(sequelize, Model, DataTypes);
const Log = require("./Log")(sequelize, Model, DataTypes);
const Client = require("./Client")(sequelize, Model, DataTypes);
const Service = require("./Service")(sequelize, Model, DataTypes);
const Order = require("./Order")(sequelize, Model, DataTypes);
const Day = require("./Day")(sequelize, Model, DataTypes);
const CarType = require("./CarType")(sequelize, Model, DataTypes);
const ServicePrice = require("./ServicePrice")(sequelize, Model, DataTypes);

// Associations
// Cliente - Orden
Order.belongsTo(Client);
Client.hasMany(Order);

// Servicio - Precio de Servicio
Service.hasMany(ServicePrice);
ServicePrice.belongsTo(Service);

// Tipo de Carro - Precio de Servicio
CarType.hasMany(ServicePrice);
ServicePrice.belongsTo(CarType);

// Orden - Servicio (uno a muchos)
Order.belongsTo(Service);
Service.hasMany(Order);

// Orden - Tipo de Carro
Order.belongsTo(CarType);
CarType.hasMany(Order);

module.exports = {
  sequelize,
  Admin,
  Log,
  Service,
  Client,
  Order,
  Day,
  CarType,
  ServicePrice,
};
