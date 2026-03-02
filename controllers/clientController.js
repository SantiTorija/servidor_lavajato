const { Client, sequelize } = require("../models");
const { Op } = require("sequelize");
const {
  createClient,
  clientExists,
  updateClient,
} = require("../services/clientService");

// Escapa % y _ para evitar que actúen como comodines en LIKE
function escapeLike(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

async function index(req, res) {
  try {
    const { search, page: pageParam, limit: limitParam } = req.query;

    // Validar limit: solo 10, 20 o 50
    const validLimits = [10, 20, 50];
    const limit = validLimits.includes(Number(limitParam))
      ? Number(limitParam)
      : 10;

    // Validar page: entero >= 1
    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Si hay un parámetro de búsqueda, agregar filtros
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      const pattern = `%${escapeLike(searchTerm)}%`;

      // LOWER() en columna + patrón en minúsculas = búsqueda insensible a mayúsculas
      // Funciona en PostgreSQL (Supabase), MySQL y SQLite
      whereClause = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("firstname")),
            { [Op.like]: pattern }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("lastname")),
            { [Op.like]: pattern }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("email")),
            { [Op.like]: pattern }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("phone")),
            { [Op.like]: pattern }
          ),
        ],
      };
    }

    const { count: total, rows: clients } = await Client.findAndCountAll({
      where: whereClause,
      order: [["firstname", "ASC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      clients,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function show(req, res) {
  try {
    //si hay un clinte lo devuelve, sino devuele false
    const result = await clientExists(req.params.email);
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function store(req, res) {
  try {
    const client = await createClient(req.body);
    return res.json(client);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    const clientId = req.params.id;

    // Validar que el ID sea un número válido
    if (!clientId || isNaN(clientId)) {
      return res.status(400).json({
        message: "ID de cliente inválido",
      });
    }

    // Validar que hay datos para actualizar
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "No se proporcionaron datos para actualizar",
      });
    }

    const updatedClient = await updateClient(clientId, req.body);

    return res.json({
      message: "Cliente actualizado exitosamente",
      client: updatedClient,
    });
  } catch (error) {
    console.log("Error en update:", error);

    // Manejar errores específicos
    if (error.message.includes("Cliente no encontrado")) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor al actualizar cliente",
    });
  }
}

async function destroy(req, res) {
  try {
    const clientId = req.params.id;

    // Validar que el ID sea un número válido
    if (!clientId || isNaN(clientId)) {
      return res.status(400).json({
        message: "ID de cliente inválido",
      });
    }

    // Buscar el cliente antes de eliminarlo para verificar que existe
    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    await Client.destroy({ where: { id: clientId } });

    return res.json({
      message: "Cliente eliminado exitosamente",
      deletedClient: {
        id: client.id,
        firstname: client.firstname,
        lastname: client.lastname,
      },
    });
  } catch (error) {
    console.log("Error en destroy:", error);
    return res.status(500).json({
      message: "Error interno del servidor al eliminar cliente",
    });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
