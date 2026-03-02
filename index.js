require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const dbInitialSetup = require("./dbInitialSetup");
const configSeeder = require("./seeders/configSeeder");
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes(app);

//dbInitialSetup();

app.get("/", (req, res) => {
  res.send("Hola desde el backend!");
});

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  try {
    await configSeeder();
  } catch (err) {
    console.error(
      "Error ejecutando configSeeder (verificar que la tabla configs exista):",
      err.message,
    );
  }
});
