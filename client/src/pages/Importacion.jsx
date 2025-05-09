import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx/xlsx.mjs";
import "./importacion.css";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { getRegisters } from "../store/actions/registers.actions";
import { checkToken } from "../store/actions/user.actions";
import axios from "axios";
// import AsignarFicha from "./AsignarFicha";

const columns = [
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
];

const API_URL = `${import.meta.env.VITE_API_URL}api/v1/base/`;

export const Importacion = () => {
  const isAuth = useSelector((state) => state.user.isAuth);

  // const [registers, setRegisters] = useState([]);
  const dispatch = useDispatch();
  const registers = useSelector((state) => state.registers.base);

  const [base, setBase] = useState([]);
  const [showAsignacion, setShowAsignacion] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const handleFile = () => {
    setisLoading(true);
    axios
      .post(API_URL, base)
      .then((res) => {
        setisLoading(false);
        alert("Registros agregados");
        setShowAsignacion(true);
      })
      .catch((err) => {
        alert("Error al agregar");
      });
  };

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer", raw: true }); //cellDates:true, dateNF:'mm/dd/yyyy;@',

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };
      fileReader.onerror = (err) => {
        console.log("error");
        reject(err);
      };
    });

    promise.then((data) => {
      setBase(data);
    });
  };

  useEffect(() => {
    if (!isAuth) dispatch(checkToken(navigate));
    dispatch(getRegisters());
  }, []);

  const paginationOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <div>
      <h1 className="importacion-title">Importar base</h1>
      <div>
        <label htmlFor="base" className="importacion__label">
          Seleccionar archivo
        </label>
        <input
          type="file"
          name="base"
          id="base"
          onChange={(e) => {
            const file = e.target.files[0];
            readExcel(file);
          }}
        />
      </div>
      <div>
        <button className="importacion__label" onClick={handleFile}>
          Guardar registros
        </button>
      </div>
      {base.length ? (
        <>
          <h3>Total de registros: {base.length}</h3>
          {/* {
					showAsignacion && <AsignarFicha/>
				} */}

          <DataTable
            columns={columns}
            data={base}
            pagination
            paginationComponentOptions={paginationOptions}
            fixedHeader
            fixedHeaderScrollHeight="600px"
            title="Registros:"
          />
        </>
      ) : (
        ""
      )}
    </div>
  );
};
