const express = require("express");
const router = express.Router();
const db = require("../models");

// Solo permite POST
router.all("/seed-admin", (req, res, next) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }
  next();
});

router.post("/seed-admin", async (req, res) => {
  try {
    const Admin = db.Admin;
    // Buscar si ya existe el admin
    const existing = await Admin.findOne({
      where: { email: "info@lavajatouy.com" },
    });
    if (existing) {
      return res.json({ message: "El administrador ya existe." });
    }
    // Crear el admin
    await Admin.create({
      firstname: "Marcos",
      lastname: "Gonzalez",
      email: "info@lavajatouy.com",
      password: "Montero1234",
      role: "globalAdmin",
    });
    return res.json({ message: "Administrador creado exitosamente." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error al crear el administrador", error: err.message });
  }
});

module.exports = router;
