import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { checkToken } from "../store/actions/user.actions";
import "./styles/asesorEvaluaciones.css";
import {
  getAsesorEvaluaciones,
  getAsesorPromedioCalificacion,
} from "../services/AsesorService";
import { updateCurrentEvaluacion } from "../store/actions/currentEvaluacion.actions";
import { FaCheckCircle, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";

const optionsMeses = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const getCurrentMonth = () => {
  const mes = optionsMeses.find((x) => x.value === new Date().getMonth() + 1);
  if (mes) {
    const currentMonth = mes.label.toLowerCase();
    return currentMonth;
  } else return;
};

const AsesorEvaluaciones = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  const [currentEvaluaciones, setCurrentEvaluaciones] = useState([]);
  const [currentAnualCalificacion, setCurrentAnualCalificacion] = useState();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  // const [currentMonth, setCurrentMonth] = useState('junio')

  const navigate = useNavigate();

  const getCurrentEvaluaciones = async (dni, mes) => {
    const evaluaciones = await getAsesorEvaluaciones(dni, mes);
    setCurrentEvaluaciones(evaluaciones);

    const promedioAnualCalificacion = await getAsesorPromedioCalificacion(dni);
    setCurrentAnualCalificacion(promedioAnualCalificacion);
  };

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
  }, [isAuth, dispatch]);

  useEffect(() => {
    if (user && currentMonth) {
      getCurrentEvaluaciones(user.DOC, currentMonth);
    }
  }, [currentMonth, user]);

  const showFeedback = (gestion) => {
    navigate("/feedbackAsesor");
    // window.open('/feedbackAsesor','_blank');
    dispatch(updateCurrentEvaluacion(gestion));
  };

  const calcularPromedio = (evaluaciones) => {
    if (evaluaciones.length === 0) return 0;
    const suma = evaluaciones.reduce(
      (acc, evaluacion) => acc + parseFloat(evaluacion.calificacion_final),
      0
    );
    return suma / evaluaciones.length;
  };

  return (
    <section className="sombra w-full px-4 py-8 mx-auto bg-white">
      {/* Título */}
      <div className="flex items-center justify-between mb-8">
        <FaCheckCircle className="text-green-500 text-3xl" />
        <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">
          EVALUACIONES ASESOR
        </h1>
        <FaClipboardList className="text-blue-500 text-3xl" />
      </div>

      <div className="p-6 space-y-6">
        {/* Selector de mes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mes de evaluaciones
          </label>
          <Select
            placeholder="Seleccionar"
            className="text-sm"
            onChange={(e) => setCurrentMonth(e.label.toLowerCase())}
            options={optionsMeses}
          />
        </div>

        {/* Nota general */}
        <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-2">
          <p className="text-sm text-gray-600">Nota de calidad general:</p>
          <span className="text-lg font-bold text-blue-600">
            {currentAnualCalificacion
              ? (parseFloat(currentAnualCalificacion) * 100).toFixed(2)
              : "0.00"}
            %
          </span>
        </div>

        {/* Evaluaciones */}
        <div className="space-y-4">
          {currentEvaluaciones && currentEvaluaciones.length ? (
            <>
              {/* Cabecera */}
              <div className="grid grid-cols-3 text-sm font-semibold text-gray-500 border-b pb-2">
                <div>Revisado</div>
                <div>Evaluaciones</div>
                <div>Calificación</div>
              </div>

              {/* Lista */}
              {currentEvaluaciones.map((e, index) => (
                <div
                  key={e.id}
                  onClick={() => showFeedback(e)}
                  className="grid grid-cols-3 items-center text-sm border rounded-md px-4 py-2 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div>
                    {e.feedback_recibido === 1 ? (
                      <FaCheck className="text-green-500 text-lg" />
                    ) : (
                      <ImCross className="text-red-500 text-lg" />
                    )}
                  </div>
                  <div>Evaluación {index + 1}</div>
                  <div className="font-semibold text-gray-800">
                    {(parseFloat(e.calificacion_final) * 100).toFixed(2)}%
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-500 text-center">Sin evaluaciones</p>
          )}
        </div>

        {/* Promedio mensual */}
        <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-2">
          <p className="text-sm text-gray-600">
            Promedio de Nota {currentMonth}:
          </p>
          <span className="text-lg font-bold text-blue-600">
            {currentEvaluaciones &&
              (calcularPromedio(currentEvaluaciones) * 100).toFixed(2)}
            %
          </span>
        </div>
      </div>
    </section>
  );
};

export default AsesorEvaluaciones;
