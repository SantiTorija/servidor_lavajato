const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

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
function verifyToken(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token requerido" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    // Solo datos seguros
    res.json({ user: { id: decoded.id, role: decoded.role } });
  });
}

module.exports = { login, verifyToken };
