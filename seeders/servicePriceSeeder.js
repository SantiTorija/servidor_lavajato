const { ServicePrice } = require("../models");

async function Seeder() {
  await ServicePrice.create({
    id: 1,
    ServiceId: 1,
    CarTypeId: 1,
    price: "800",
  });
  await ServicePrice.create({
    id: 2,
    ServiceId: 2,
    CarTypeId: 1,
    price: "1100",
  });
  await ServicePrice.create({
    id: 3,
    ServiceId: 1,
    CarTypeId: 2,
    price: "1100",
  });
  await ServicePrice.create({
    id: 4,
    ServiceId: 2,
    CarTypeId: 2,
    price: "1300",
  });
  await ServicePrice.create({
    id: 5,
    ServiceId: 1,
    CarTypeId: 3,
    price: "1300",
  });
  await ServicePrice.create({
    id: 6,
    ServiceId: 2,
    CarTypeId: 3,
    price: "1700",
  });
  console.log("ServicePrice seeded");
}

module.exports = Seeder;
