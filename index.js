require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const dbInitialSetup = require("./dbInitialSetup");
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: "https://cliente-lavajato.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));

routes(app);

//dbInitialSetup();

app.get("/", (req, res) => {
  res.send("Hola desde el backend!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
