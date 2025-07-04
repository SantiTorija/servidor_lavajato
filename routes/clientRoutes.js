const express = require("express");
const clientRouter = express.Router();
const clientController = require("../controllers/clientController");

clientRouter.get("/", clientController.index);
clientRouter.get("/new-by-month", clientController.newClientsByMonth);
clientRouter.get("/:email", clientController.show);
clientRouter.post("/", clientController.store);
clientRouter.put("/:id", clientController.update);
clientRouter.delete("/:id", clientController.destroy);

module.exports = clientRouter;
