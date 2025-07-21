const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const { Admin } = require("../models");

/**
 * Login de usuario admin.
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const { user, token } = await authService.loginUser(email, password);

    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ message: err.message || "Credenciales inválidas" });
  }
}

/**
 * Verifica la validez del token JWT.
 */
async function verifyToken(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token requerido" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    // Buscar usuario en la base de datos y devolver todos los datos necesarios
    try {
      const user = await Admin.findByPk(decoded.id);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
        },
      });
    } catch (e) {
      res.status(500).json({ message: "Error al buscar usuario" });
    }
  });
}

module.exports = { login, verifyToken };
