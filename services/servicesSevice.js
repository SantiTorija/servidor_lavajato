const { Service } = require("../models");

async function findAll() {
  return await Service.findAll({ order: [["id", "ASC"]] });
}

async function findById(id) {
  return await Service.findByPk(id);
}

async function create(data) {
  return await Service.create(data);
}

async function update(id, data) {
  return await Service.update(data, { where: { id } });
}

async function destroy(id) {
  return await Service.destroy({ where: { id } });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  destroy,
};
