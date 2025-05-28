const { Log, Admin } = require("../models");

async function index(req, res) {
  const where = {};
  if (req.query.orderId) {
    where.orderId = req.query.orderId;
  } else if (req.query.memberId) {
    where.memberId = req.query.memberId;
  } else {
    where.productId = req.query.productId;
  }

  const logs = await Log.findAll({ include: Admin, order: [["createdAt", "DESC"]], where: where });
  res.json(logs);
}

async function store(req, res) {
  if (!req.body) {
    return res.status(400).json({ message: "The Log is empty" });
  }
  try {
    await Log.create({
      task: req.body.task,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      adminId: req.auth.sub,
    });
    return res.status(200).json({ message: "Log created" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
}

async function show(req, res) {
  try {
    const log = await Log.findOne({ where: { id: req.params.id }, include: Member });
    if (!log) return res.status(404).json({ message: "Log not found" });
    return res.status(200).json(log);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

async function destroy(req, res) {
  try {
    const log = await Suggestion.destroy({ where: { id: req.params.id } });
    if (!log) return res.status(404).json({ message: "Log not found" });
    return res.status(200).json({ message: "Log deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  index,
  store,
  show,
  destroy,
};
