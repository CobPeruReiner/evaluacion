import * as XLSX from "xlsx";

export const COLUMNAS_PLANTILLA = [
  "NOMBRE_ITEM",
  "PESO_ITEM",
  "NOMBRE_CRITERIO",
  "PESO_CRITERIO",
  "NOMBRE_ACCION",
  "PESO_ACCION",
];

const ejemplo = [
  ["APERTURA", 30, "SALUDO", 15, "Realiza el saludo protocolar", 15],
  ["APERTURA", 30, "IDENTIFICACIÓN", 15, "Confirma los datos del cliente", 15],
  ["GESTIÓN", 70, "NEGOCIACIÓN", 70, "Presenta una alternativa de pago", 70],
];

const texto = (value) => String(value ?? "").trim();
const clave = (value) => texto(value).toLocaleUpperCase();
const peso = (value) => {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : NaN;
};

export function descargarPlantillaMasiva() {
  const libro = XLSX.utils.book_new();
  const instrucciones = XLSX.utils.aoa_to_sheet([
    ["PLANTILLA DE EVALUACIÓN · CARGA MASIVA"],
    ["Cómo usarla"],
    ["1. Completa únicamente la hoja Plantilla."],
    ["2. Cada fila representa una acción; repite el ítem y el criterio cuando tengan más de una acción."],
    ["3. Los pesos se registran como porcentajes entre 0 y 100, sin el símbolo %."],
    ["4. Los ítems no pueden superar 100%. Los criterios no pueden superar el peso del ítem y las acciones el del criterio."],
    ["5. No cambies los encabezados ni elimines columnas. Al cargar el archivo podrás revisar todo antes de crear la plantilla."],
  ]);
  instrucciones["!cols"] = [{ wch: 110 }];
  instrucciones["!merges"] = [XLSX.utils.decode_range("A1:A1")];

  const hoja = XLSX.utils.aoa_to_sheet([COLUMNAS_PLANTILLA, ...ejemplo]);
  hoja["!cols"] = [
    { wch: 28 }, { wch: 14 }, { wch: 32 }, { wch: 17 }, { wch: 46 }, { wch: 15 },
  ];
  hoja["!autofilter"] = { ref: `A1:F${ejemplo.length + 1}` };
  XLSX.utils.book_append_sheet(libro, instrucciones, "Instrucciones");
  XLSX.utils.book_append_sheet(libro, hoja, "Plantilla");
  XLSX.writeFile(libro, "plantilla-evaluacion-masiva.xlsx");
}

function validarPeso(valor, nombre, fila, errores) {
  if (!Number.isFinite(valor) || valor <= 0 || valor > 100) {
    errores.push(`Fila ${fila}: ${nombre} debe ser un número mayor que 0 y hasta 100.`);
  }
}

function validarJerarquia(items, errores) {
  const suma = (lista) => lista.reduce((total, actual) => total + actual.peso, 0);
  if (suma(items) > 100.001) errores.push("La suma de los pesos de los ítems supera el 100%.");
  items.forEach((item) => {
    if (suma(item.criterios) > item.peso + 0.001) {
      errores.push(`Los criterios de “${item.nombre}” superan el peso de su ítem.`);
    }
    item.criterios.forEach((criterio) => {
      if (suma(criterio.acciones) > criterio.peso + 0.001) {
        errores.push(`Las acciones de “${criterio.nombre}” superan el peso de su criterio.`);
      }
    });
  });
}

export async function leerPlantillaMasiva(file) {
  const contenido = await file.arrayBuffer();
  const libro = XLSX.read(contenido, { type: "array", raw: true });
  const hoja = libro.Sheets.Plantilla;
  if (!hoja) throw new Error("No encontramos la hoja “Plantilla” en el archivo.");

  const filas = XLSX.utils.sheet_to_json(hoja, { defval: "", raw: true });
  const encabezados = Object.keys(filas[0] || {}).map(clave);
  const faltantes = COLUMNAS_PLANTILLA.filter((columna) => !encabezados.includes(columna));
  if (faltantes.length) throw new Error(`Faltan columnas requeridas: ${faltantes.join(", ")}.`);
  if (!filas.length) throw new Error("La hoja Plantilla no contiene filas para importar.");

  const errores = [];
  const items = [];
  const indiceItems = new Map();
  filas.forEach((fila, index) => {
    const numeroFila = index + 2;
    const values = Object.fromEntries(Object.entries(fila).map(([key, value]) => [clave(key), value]));
    const nombreItem = texto(values.NOMBRE_ITEM);
    const nombreCriterio = texto(values.NOMBRE_CRITERIO);
    const nombreAccion = texto(values.NOMBRE_ACCION);
    const pesoItem = peso(values.PESO_ITEM);
    const pesoCriterio = peso(values.PESO_CRITERIO);
    const pesoAccion = peso(values.PESO_ACCION);
    if (!nombreItem || !nombreCriterio || !nombreAccion) {
      errores.push(`Fila ${numeroFila}: ítem, criterio y acción son obligatorios.`);
      return;
    }
    validarPeso(pesoItem, "PESO_ITEM", numeroFila, errores);
    validarPeso(pesoCriterio, "PESO_CRITERIO", numeroFila, errores);
    validarPeso(pesoAccion, "PESO_ACCION", numeroFila, errores);
    if (![pesoItem, pesoCriterio, pesoAccion].every(Number.isFinite)) return;

    const itemKey = clave(nombreItem);
    let item = indiceItems.get(itemKey);
    if (!item) {
      item = { nombre: nombreItem, peso: pesoItem, criterios: [], _criterios: new Map() };
      indiceItems.set(itemKey, item);
      items.push(item);
    } else if (item.peso !== pesoItem) {
      errores.push(`Fila ${numeroFila}: “${nombreItem}” tiene pesos de ítem distintos.`);
    }
    const criterioKey = clave(nombreCriterio);
    let criterio = item._criterios.get(criterioKey);
    if (!criterio) {
      criterio = { nombre: nombreCriterio, peso: pesoCriterio, acciones: [] };
      item._criterios.set(criterioKey, criterio);
      item.criterios.push(criterio);
    } else if (criterio.peso !== pesoCriterio) {
      errores.push(`Fila ${numeroFila}: “${nombreCriterio}” tiene pesos de criterio distintos.`);
    }
    criterio.acciones.push({ nombre: nombreAccion, peso: pesoAccion });
  });
  items.forEach((item) => delete item._criterios);
  validarJerarquia(items, errores);

  if (errores.length) {
    const error = new Error("La plantilla tiene datos por corregir.");
    error.errores = errores;
    throw error;
  }
  return { items, filas: filas.length };
}
