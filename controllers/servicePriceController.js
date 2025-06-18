const { ServicePrice, Service, CarType } = require("../models");

async function index(req, res) {
  try {
    const servicePrices = await ServicePrice.findAll({
      include: [{ model: Service }, { model: CarType }],
    });
    return res.json(servicePrices);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function show(req, res) {
  try {
    const servicePrice = await ServicePrice.findByPk(req.params.id, {
      include: [{ model: Service }, { model: CarType }],
    });
    return res.json(servicePrice);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function getByCarType(req, res) {
  try {
    const servicePrices = await ServicePrice.findAll({
      where: { carTypeId: req.params.carTypeId },
      include: [{ model: Service }],
    });
    return res.json(servicePrices);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function store(req, res) {
  try {
    const servicePrice = await ServicePrice.create({
      serviceId: req.body.serviceId,
      carTypeId: req.body.carTypeId,
      price: req.body.price,
    });
    return res.json(servicePrice);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    await ServicePrice.update(req.body, { where: { id: req.params.id } });
    return res.json({ message: "updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function destroy(req, res) {
  try {
    await ServicePrice.destroy({ where: { id: req.params.id } });
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
  getByCarType,
};
