import axios from "axios";
import React, { useEffect, useState } from "react";
import ExportButton from "../../utils/ExportButton";
import DataTable from "react-data-table-component";

const BASE_URL = `${import.meta.env.VITE_API_URL}api/v1/base/all`;

export const ReporteBase = () => {
  const [baseData, setBaseData] = useState([]);

  const columns = [
    {
      name: "id",
      wrap: true,
      selector: (row) => row.id,
      center: true,
    },
    {
      name: "FECHAGEST",
      wrap: true,
      selector: (row) => row.FECHAGEST,
      center: true,
    },
    {
      name: "CARTERA",
      wrap: true,
      selector: (row) => row.CARTERA,
    },
    {
      name: "IDENTIFICADOR",
      wrap: true,
      selector: (row) => row.IDENTIFICADOR,
    },
    {
      name: "ACCION",
      wrap: true,
      selector: (row) => row.ACCION,
    },
    {
      name: "EFECTO",
      wrap: true,
      selector: (row) => row.EFECTO,
    },
    {
      name: "MOTIVO",
      wrap: true,
      selector: (row) => row.MOTIVO,
    },
    {
      name: "PESO",
      wrap: true,
      selector: (row) => row.PESO,
    },
    {
      name: "HOMOLO",
      wrap: true,
      selector: (row) => row.HOMOLO,
    },
    {
      name: "CONTACTO",
      wrap: true,
      selector: (row) => row.CONTACTO,
    },
    {
      name: "OBSERV",
      grow: 2,
      wrap: true,
      selector: (row) => row.OBSERV,
    },
    {
      name: "ID_CONT",
      wrap: true,
      selector: (row) => row.ID_CONT,
    },
    {
      name: "ASESOR",
      wrap: true,
      selector: (row) => row.ASESOR,
    },
    {
      name: "SUCURSAL",
      wrap: true,
      selector: (row) => row.SUCURSAL,
    },
    {
      name: "PISOS",
      wrap: true,
      selector: (row) => row.PISOS,
    },
    {
      name: "PUERTA",
      wrap: true,
      selector: (row) => row.PUERTA,
    },
    {
      name: "FACHADA",
      wrap: true,
      selector: (row) => row.FACHADA,
    },
    {
      name: "MONTO",
      wrap: true,
      selector: (row) => row.MONTO,
    },
    {
      name: "USUARIO",
      wrap: true,
      selector: (row) => row.USUARIO,
    },
    {
      name: "FICHA",
      wrap: true,
      selector: (row) => row.FICHA,
    },
    {
      name: "ESTADO",
      wrap: true,
      selector: (row) => (
        <p style={{ color: `${row.ESTADO === "REVISADO" ? "green" : "blue"}` }}>
          {row.ESTADO}
        </p>
      ),
    },
  ];

  useEffect(() => {
    axios
      .get(BASE_URL)
      .then((res) => {
        setBaseData(res.data.base);
      })
      .catch((err) => console.log(err));
  }, []);

  const paginationOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <div>
      <ExportButton data={baseData} filename={"Evaluación Reporte"} />
      <DataTable
        columns={columns}
        data={baseData}
        pagination
        paginationComponentOptions={paginationOptions}
        fixedHeader
        fixedHeaderScrollHeight="600px"
        title="Reporte:"
        responsive
      />
    </div>
  );
};
