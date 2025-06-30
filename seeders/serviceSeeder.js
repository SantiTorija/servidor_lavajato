const { Service } = require("../models");

async function Seeder() {
  await Service.create({
    id: 1,
    name: "Lavado completo",
    description:
      "Incluye: lavado exterior, aspirado completo, acondicionador de plásticos interiores, limpieza de vidrios, abrillantador de neumáticos.",
  });
  await Service.create({
    id: 2,
    name: "Lavado completo y encerado",
    description:
      "Incluye: lavado exterior, aspirado completo, acondicionador de plásticos interiores, limpieza de vidrios, abrillantador de neumáticos. Encerado exterior con cera Malco, generando mayor brillo y protección",
  });
  console.log("Service seeded");
}

module.exports = Seeder;
