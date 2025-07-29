const servicePriceService = require("../services/servicePriceService");

async function index(req, res) {
  try {
    const servicePrices = await servicePriceService.getAll();
    return res.json(servicePrices);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function show(req, res) {
  try {
    const servicePrice = await servicePriceService.getById(req.params.id);
    return res.json(servicePrice);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function getByCarType(req, res) {
  try {
    const servicePrices = await servicePriceService.getByCarTypeId(
      req.params.carTypeId
    );
    return res.json(servicePrices);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function getByCarTypeName(req, res) {
  try {
    const { carTypeName } = req.params;
    const servicePrices = await servicePriceService.getPricesByCarTypeName(
      carTypeName
    );
    return res.json(servicePrices);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function getByCarTypeAndService(req, res) {
  try {
    const { carTypeId, serviceId } = req.params;
    const servicePrice = await servicePriceService.getByCarTypeAndService(
      carTypeId,
      serviceId
    );

    if (!servicePrice) {
      return res.status(404).json({
        message:
          "No se encontró un precio para esta combinación de tipo de auto y servicio",
      });
    }

    return res.json(servicePrice);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function store(req, res) {
  try {
    const servicePrice = await servicePriceService.create(req.body);
    return res.json(servicePrice);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    const result = await servicePriceService.update(req.params.id, req.body);
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function destroy(req, res) {
  try {
    const result = await servicePriceService.destroy(req.params.id);
    return res.json(result);
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
  getByCarTypeName,
  getByCarTypeAndService,
};
