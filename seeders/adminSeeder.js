const { Admin } = require("../models");
async function Seeder() {
  await Admin.create({
    firstname: "Marcos",
    lastname: "Gonzalez",
    email: "amargon@gmail.com",
    password: "admin",
    role: "globalAdmin",
  });
  console.log("Admin seeded");
}
module.exports = Seeder;
