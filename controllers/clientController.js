const { Client } = require("../models");
const {
  createClient,
  clientExists,
  updateClient,
} = require("../services/clientService");

async function index(req, res) {
  try {
    const { search } = req.query;

    let whereClause = {};

    // Si hay un parámetro de búsqueda, agregar filtros
    if (search && search.trim()) {
      const { Op } = require("sequelize");
      const searchTerm = search.trim();

      whereClause = {
        [Op.or]: [
          {
            firstname: {
              [Op.like]: `%${searchTerm.toLowerCase()}%`,
            },
          },
          {
            lastname: {
              [Op.like]: `%${searchTerm.toLowerCase()}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${searchTerm.toLowerCase()}%`,
            },
          },
          {
            phone: {
              [Op.like]: `%${searchTerm.toLowerCase()}%`,
            },
          },
        ],
      };
    }

    const clients = await Client.findAll({
      where: whereClause,
      order: [["firstname", "ASC"]],
    });

    return res.json(clients);
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
