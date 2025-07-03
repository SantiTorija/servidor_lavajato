const serviceService = require("../services/servicesSevice");
const { Op } = require("sequelize");

async function index(req, res) {
  try {
    const services = await serviceService.findAll();
    return res.json(services);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function show(req, res) {
  try {
    const admin = await Admin.findByPk(req.params.id);
    return res.json(admin);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function store(req, res) {
  const adminEmailExists = await Admin.findOne({
    where: { email: req.body.email },
  });

  if (adminEmailExists) {
    return res.status(401).json({ error: "Email already in use!" });
  }
  try {
    const admin = await Admin.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: `admin_${
        req.body.firstname.slice(0, 1).toLowerCase() +
        req.body.lastname.toLowerCase()
      }`,
      role: req.body.role,
    });
    return res.json(admin);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    await serviceService.update(req.params.id, req.body);
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
