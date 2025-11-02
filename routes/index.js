const express = require("express");
const adminRoutes = require("./adminRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const carTypeRoutes = require("./carTypeRoutes");
const clientRoutes = require("./clientRoutes");
const dayRoutes = require("./dayRoutes");
const logRoutes = require("./logRoutes");
const orderRoutes = require("./orderRoutes");
const servicePriceRoutes = require("./servicePriceRoutes");
const serviceRoutes = require("./serviceRoutes");
const authRoutes = require("./authRoutes");
const adminSeederRoutes = require("./adminSeeder");

module.exports = (app) => {
  app.use("/admin", authRoutes);
  //app.use("/admin", adminRoutes);
  app.use("/analytics", analyticsRoutes);
  app.use("/car-type", carTypeRoutes);
  app.use("/client", clientRoutes);
  app.use("/day", dayRoutes);
  app.use("/log", logRoutes);
  app.use("/order", orderRoutes);
  app.use("/service-price", servicePriceRoutes);
  app.use("/service", serviceRoutes);
  app.use("/seed-admin", adminSeederRoutes);
};
