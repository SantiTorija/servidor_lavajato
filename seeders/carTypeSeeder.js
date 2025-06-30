const { CarType } = require("../models");

async function Seeder() {
  await CarType.create({
    id: 1,
    name: "Auto - Furgón chico",
  });
  await CarType.create({
    id: 2,
    name: "Pick Up pequeñas - SUV",
  });
  await CarType.create({
    id: 3,
    name: "Pick Up - SUV 7 plazas",
  });
  console.log("CarType seeded");
}

module.exports = Seeder;
