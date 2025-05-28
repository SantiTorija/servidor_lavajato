const express = require("express");
const logRouter = express.Router();
const logController = require("../controllers/logController");
const checkJwt = require("../middleware/checkJwt");

logRouter.use(checkJwt);

logRouter.get("/", logController.index);
logRouter.get("/:id", logController.show);
logRouter.post("/", logController.store);
logRouter.delete("/:id", checkJwt, logController.destroy);

module.exports = logRouter;
