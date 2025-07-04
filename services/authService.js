const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Admin } = require("../models");

/**
 * Autentica un usuario admin y genera un JWT.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: Object, token: string}>}
 */
async function loginUser(email, password) {
  const user = await Admin.findOne({ where: { email } });

  if (!user) throw new Error("Credenciales inválidas");

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) throw new Error("Credenciales inválidas");

  // Solo datos seguros
  const userData = {
    name: user.firstname + " " + user.lastname,
    id: user.id,
    role: user.role || "admin",
    email: user.email,
  };

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  return { user: userData, token };
}

module.exports = { loginUser };
