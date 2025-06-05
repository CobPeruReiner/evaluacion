const { QueryTypes } = require("sequelize");

const obtenerNombreAgente = async (db, campaña, anexo) => {
  if (!db || !campaña || !anexo) return null;

  console.log("Parametros recibidos:", { campaña, anexo });

  const query = `
    SELECT vcu.full_name
    FROM vicidial_users vcu
    LEFT JOIN vicidial_campaigns vcc
      ON vcu.user_group = vcc.user_group AND vcc.active = 'Y'
    WHERE vcu.user = ?
    LIMIT 1
  `;

  // console.log("Query:", query);

  try {
    const resultado = await db.query(query, {
      replacements: [anexo, campaña],
      type: QueryTypes.SELECT,
    });

    return resultado.length > 0 ? resultado[0].full_name : null;
  } catch (error) {
    console.error(`❌ Error al obtener full_name:`, error.message);
    return null;
  }
};

module.exports = { obtenerNombreAgente };
