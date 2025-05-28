const { Service } = require("../models");
async function Seeder() {
  await Service.create({
    type: "Lavado completo",
    carType: "Auto - furgón chico",
    price: "800",
  });
  await Service.create({
    type: "Lavado completo y encerado",
    carType: "Auto - furgón chico",
    price: "1100",
  });
  await Service.create({
    type: "Lavado completo",
    carType: "Pick Up pequeñas - SUV",
    price: "1000",
  });
  await Service.create({
    type: "Lavado completo y encerado",
    carType: "Pick Up pequeñas - SUV",
    price: "1300",
  });
  await Service.create({
    type: "Lavado completo",
    carType: "Pick Up - SUV 7 plazas",
    price: "1200",
  });
  await Service.create({
    type: "Lavado completo y encerado",
    carType: "Pick Up - SUV 7 plazas",
    price: "1500",
  });
  console.log("Service seeded");
}
module.exports = Seeder;
