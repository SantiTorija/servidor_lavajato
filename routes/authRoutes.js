const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login
router.post("/login", authController.login);

// Verificación de token
router.get("/verify", authController.verifyToken);

// Logout (el frontend limpia el token)
router.post("/logout", (req, res) => res.json({ ok: true }));

module.exports = router;
