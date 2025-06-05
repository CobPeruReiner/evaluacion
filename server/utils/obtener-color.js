const { campañasVicidial } = require("./carteras");

const obtenerColorPorIdCartera = (idCartera) => {
  const carteraNum = Number(idCartera);
  for (const color in campañasVicidial) {
    const existe = campañasVicidial[color].some(
      (c) => c.idCartera === carteraNum
    );
    if (existe) return color;
  }
  return null;
};

module.exports = { obtenerColorPorIdCartera };
