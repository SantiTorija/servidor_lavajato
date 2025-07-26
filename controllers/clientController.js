const { Client } = require("../models");
const {
  createClient,
  clientExists,
  updateClient,
  getNewClientsByMonth,
} = require("../services/clientService");

async function index(req, res) {
  try {
    const clients = await Client.findAll();
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
    await Client.destroy({ where: { id: req.params.id } });
    return res.json({ message: "destroyed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function newClientsByMonth(req, res) {
  try {
    const data = await getNewClientsByMonth();
    return res.json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  newClientsByMonth,
};
