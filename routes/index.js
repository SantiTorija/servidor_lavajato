const adminRoutes = require("./adminRoutes");
const logRoutes = require("./logRoutes");
const dayRoutes = require("./dayRoutes");
const orderRoutes = require("./orderRoutes");
const serviceRoutes = require("./serviceRoutes");
const clientRoutes = require("./clientRoutes");

module.exports = (app) => {
  //app.use(authRoutes);
  app.use("/admins", adminRoutes);
  app.use("/logs", logRoutes);
  app.use("/day", dayRoutes);
  app.use("/order", orderRoutes);
  app.use("/client", clientRoutes);
};
