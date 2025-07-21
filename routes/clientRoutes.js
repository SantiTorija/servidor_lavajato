const express = require("express");
const clientRouter = express.Router();
const clientController = require("../controllers/clientController");
const authenticateToken = require("../middleware/authenticateToken");

clientRouter.get("/", authenticateToken, clientController.index);
clientRouter.get(
  "/new-by-month",
  authenticateToken,
  clientController.newClientsByMonth
);
clientRouter.get("/:email", clientController.show);
clientRouter.post("/", clientController.store);
clientRouter.put("/:id", clientController.update);
clientRouter.delete("/:id", clientController.destroy);

module.exports = clientRouter;
