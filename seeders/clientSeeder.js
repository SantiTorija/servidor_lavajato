const { Client } = require("../models");

const FIRST_NAMES = [
  "Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Miguel", "Sofía",
  "José", "Valentina", "Luis", "Isabella", "Jorge", "Camila", "Diego", "Martina",
  "Fernando", "Lucía", "Roberto", "Victoria", "Daniel", "Emma", "Pablo", "Mía",
  "Alejandro", "Regina", "Ricardo", "Sara", "Andrés", "Julia", "Francisco", "Elena",
  "Antonio", "Claudia", "Raúl", "Patricia", "Eduardo", "Gabriela", "Manuel", "Andrea",
  "Javier", "Natalia", "Rafael", "Mariana", "Óscar", "Daniela", "Sergio", "Paula",
  "Héctor", "Carolina", "Arturo", "Alejandra", "Gustavo", "Rosa", "Enrique", "Lorena",
  "Alberto", "Mónica", "César", "Verónica", "Felipe", "Adriana", "Ignacio", "Teresa",
  "Emilio", "Silvia", "Víctor", "Beatriz", "Gerardo", "Rocío", "Hugo", "Diana",
  "Rodrigo", "Erika", "Mauricio", "Leticia", "Iván", "Marisol", "Armando", "Yolanda",
];

const LAST_NAMES = [
  "García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Pérez", "Sánchez",
  "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales",
  "Cruz", "Ortiz", "Gutiérrez", "Chávez", "Ruiz", "Jiménez", "Mendoza", "Vargas",
  "Castillo", "Moreno", "Romero", "Herrera", "Medina", "Aguilar", "Garza", "Castro",
  "Vázquez", "Fernández", "Silva", "Ramos", "Acosta", "Sandoval", "Delgado", "Maldonado",
  "Ríos", "Vega", "Carrillo", "Guerrero", "Núñez", "Contreras", "Domínguez", "Salazar",
  "Miranda", "Luna", "Espinoza", "Navarro", "Mejía", "Figueroa", "Santiago", "Rojas",
  "Soto", "Valdez", "Cervantes", "Fuentes", "Aguirre", "Serrano", "Méndez", "Herrera",
  "Trejo", "Rangel", "Bautista", "Ponce", "Gallegos", "Cabrera", "Escobar", "Villanueva",
  "Padilla", "Ochoa", "Arias", "Franco", "Corona", "Barrera", "Galván", "Leal",
];

const CAR_BRANDS = [
  "Toyota", "Honda", "Ford", "Chevrolet", "Volkswagen", "Fiat", "Nissan", "Hyundai",
  "Kia", "Renault", "Peugeot", "Mazda", "Suzuki", "Jeep", "Dodge", "BMW",
  "Mercedes-Benz", "Audi", "Volvo", "Subaru", "Mitsubishi", "Citroën", "Seat", "Škoda",
];

const CAR_MODELS = [
  "Corolla", "Civic", "Focus", "Cruze", "Gol", "Palio", "Versa", "Accent",
  "Rio", "Clio", "208", "3", "Swift", "Compass", "Journey", "Serie 3",
  "Clase A", "A3", "S60", "Impreza", "L200", "C3", "Ibiza", "Octavia",
  "Hilux", "HR-V", "Ranger", "S10", "T-Cross", "Strada", "Kicks", "Tucson",
  "Sportage", "Duster", "3008", "CX-5", "Vitara", "Renegade", "Ram", "X1",
];

const CAR_TYPES = [
  { carTypeId: 1, carType: "Auto - Furgón chico" },
  { carTypeId: 2, carType: "Pick Up pequeñas - SUV" },
  { carTypeId: 3, carType: "Pick Up - SUV 7 plazas" },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  const prefix = ["11", "15", "351", "221", "261", "381", "387"][Math.floor(Math.random() * 7)];
  const num = String(Math.floor(Math.random() * 90000000) + 10000000);
  return prefix + num;
}

async function Seeder() {
  const clients = [];
  const usedEmails = new Set();

  for (let i = 0; i < 300; i++) {
    let firstname = randomItem(FIRST_NAMES);
    let lastname = randomItem(LAST_NAMES);
    let email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}${i}@ejemplo.com`;

    while (usedEmails.has(email)) {
      email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}${i}_${Math.random().toString(36).slice(2, 6)}@ejemplo.com`;
    }
    usedEmails.add(email);

    const carTypeData = randomItem(CAR_TYPES);
    const clientsData = {
      firstname,
      lastname,
      email,
      phone: Math.random() > 0.1 ? randomPhone() : null,
      car: {
        marca: randomItem(CAR_BRANDS),
        modelo: randomItem(CAR_MODELS),
        carType: carTypeData.carType,
        carTypeId: carTypeData.carTypeId,
      },
      noShowCount: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
      clientStatus: "activo",
      statusReason: null,
    };

    const rand = Math.random();
    if (rand > 0.97) {
      clientsData.clientStatus = "vetado";
      clientsData.noShowCount = clientsData.noShowCount || 4;
      clientsData.statusReason = `Vetado automáticamente por ${clientsData.noShowCount} faltas sin aviso`;
    } else if (rand > 0.95) {
      clientsData.clientStatus = "inactivo";
    }

    clients.push(clientsData);
  }

  await Client.bulkCreate(clients);
  console.log("Client seeded: 300 clientes creados");
}

module.exports = Seeder;
