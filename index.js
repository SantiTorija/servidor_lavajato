require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const dbInitialSetup = require("./dbInitialSetup");
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

const allowedOrigins = ["https://cliente-lavajato.vercel.app", undefined];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Bloqueado por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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
