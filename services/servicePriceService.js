const { ServicePrice, Service, CarType } = require("../models");

async function getAll() {
  return ServicePrice.findAll({
    include: [{ model: Service }, { model: CarType }],
  });
}

async function getById(id) {
  return ServicePrice.findByPk(id, {
    include: [{ model: Service }, { model: CarType }],
  });
}

async function getByCarTypeId(carTypeId) {
  return ServicePrice.findAll({
    where: { CarTypeId: carTypeId },
    include: [{ model: Service }],
  });
}

async function getPricesByCarTypeName(carTypeName) {
  return ServicePrice.findAll({
    include: [
      {
        model: Service,
        required: true,
      },
      {
        model: CarType,
        where: { name: carTypeName },
        required: true,
      },
    ],
  });
}

async function create(data) {
  return ServicePrice.create({
    serviceId: data.serviceId,
    carTypeId: data.carTypeId,
    price: data.price,
  });
}

async function update(id, data) {
  await ServicePrice.update(data, { where: { id } });
  return { message: "updated" };
}

async function destroy(id) {
  await ServicePrice.destroy({ where: { id } });
  return { message: "destroyed" };
}

module.exports = {
  getAll,
  getById,
  getByCarTypeId,
  getPricesByCarTypeName,
  create,
  update,
  destroy,
};
