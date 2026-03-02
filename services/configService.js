const { Config } = require("../models");

const DEFAULT_NO_SHOW_VET_THRESHOLD = 4;

/**
 * Obtiene el umbral de faltas sin aviso a partir del cual se veta automáticamente al cliente.
 * Lee desde la tabla Config. Si no existe, retorna el valor por defecto (4).
 * Preparado para que una futura pantalla de configuración pueda editar este valor.
 */
const getNoShowVetThreshold = async () => {
  try {
    const config = await Config.findOne({
      where: { key: "noShowVetThreshold" },
    });
    if (config && config.value) {
      const parsed = parseInt(config.value, 10);
      return isNaN(parsed) ? DEFAULT_NO_SHOW_VET_THRESHOLD : parsed;
    }
    return DEFAULT_NO_SHOW_VET_THRESHOLD;
  } catch (error) {
    console.error("Error en getNoShowVetThreshold:", error);
    return DEFAULT_NO_SHOW_VET_THRESHOLD;
  }
};

module.exports = {
  getNoShowVetThreshold,
};
