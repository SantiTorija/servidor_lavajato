const { Config } = require("../models");

const DEFAULT_CONFIGS = [
  { key: "noShowVetThreshold", value: "4" },
];

async function configSeeder() {
  try {
    for (const item of DEFAULT_CONFIGS) {
      const [config] = await Config.findOrCreate({
        where: { key: item.key },
        defaults: { value: item.value },
      });
      if (config.createdAt.getTime() === config.updatedAt.getTime()) {
        console.log(`[Config] Creado: ${item.key} = ${item.value}`);
      }
    }
  } catch (error) {
    console.error("[Config] Error en configSeeder:", error);
    throw error;
  }
}

module.exports = configSeeder;
