const { Client } = require("../models");
const { createClient, clientExists } = require("../services/clientService");

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
    const isClient = await clientExists(req.params.email);
    return res.json(isClient);
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
    await Admin.update(req.body, { where: { id: req.params.id } });
    return res.json({ message: "updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function destroy(req, res) {
  try {
    await Admin.destroy({ where: { id: req.params.id } });
    return res.json({ message: "destroyed" });
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
};
