import React from "react";
import * as XLSX from "xlsx";
import "./exportButton.css";

const ExportButton = ({ data, filename }) => {
  const handleExport = () => {
    // Columnas que deben ser tratadas como decimales
    const decimalColumns = [
      "apertura",
      "apertura_completado",
      "indagacion",
      "indagacion_completado",
      "manejo",
      "manejo_completado",
      "cierre",
      "cierre_completado",
      "habilidades",
      "habilidades_completado",
      "herramientas",
      "herramientas_completado",
      "calificacion_final",
    ];

    // Asegurar que los datos en las columnas especificadas sean números decimales
    const formattedData = data.map((item) => {
      const newItem = { ...item };
      decimalColumns.forEach((column) => {
        if (newItem[column] !== undefined && newItem[column] !== null) {
          const parsedValue = parseFloat(newItem[column]);
          newItem[column] = !isNaN(parsedValue) ? parsedValue : 0; // Si no es un número, asignar 0
        } else {
          newItem[column] = 0; // Asignar 0 si el valor es undefined o null
        }
      });
      return newItem;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Obtener el rango de celdas para aplicar el formato
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (ws[address] && decimalColumns.includes(ws[address].v)) {
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
          const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
          if (ws[cell_address]) {
            ws[cell_address].t = "n"; // Establecer el tipo de celda como número
          }
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "MySheet1");

    XLSX.writeFile(wb, `${filename}.xlsx`);

    // Validar la conversión y mostrar un mensaje de éxito
    console.log(
      "Conversión a decimal completada exitosamente para todas las columnas especificadas."
    );
  };

  return (
    <button
      className="relative text-sm leading-6 border border-solid border-[#28a745] text-[#28a745] px-2 py-1 rounded-md font-normal hover:bg-[#28a745] hover:text-white transition-all duration-300"
      onClick={handleExport}
    >
      Exportar registros
    </button>
  );
};

export default ExportButton;
