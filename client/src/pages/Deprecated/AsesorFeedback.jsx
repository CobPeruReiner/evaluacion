import React, { useState, useEffect } from "react";
import "../styles/asesorFeedback.css";
import icon from "../../assets/logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { checkToken } from "../../store/actions/user.actions";
import { updateCurrentEvaluacion } from "../../store/actions/currentEvaluacion.actions";
import { updateAsesorFeedback } from "../../services/AsesorService";
import { useNavigate } from "react-router-dom";

const evaluacionSelections = [
  "saludo_11",
  "contactar_con_persona_12",
  "identificacion_gestor_13",
  "brindar_informacion_21",
  "indagar_motivo_no_pago_22",
  "asesorar_23",
  "mantiene_sentido_urgencia_31",
  "perseverancia_objetivo_32",
  "reafirmar_acuerdos_41",
  "despedida_cliente_42",
  "escucha_activa_51",
  "comunicacion_cliente_52",
  "amabilidad_cliente_53",
  "uso_herramientas_61",
  "registro_gestiones_62",
];

const AsesorFeedback = () => {
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.user);

  const currentEvaluacion = useSelector(
    (state) => state.currentEvaluacion.currentEvaluacion,
  );
  const navigate = useNavigate();

  const [feedbackRecibido, setFeedbackRecibido] = useState(0);
  const [feedbackCompromiso, setFeedbackCompromiso] = useState("");
  const supervisor = user?.supervisor || "No asignado";

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (!user) return;
    const lsEvaluacion = localStorage.getItem("currentEvaluacion");
    if (lsEvaluacion) {
      dispatch(updateCurrentEvaluacion(JSON.parse(lsEvaluacion)));
    }
  }, [isAuth, dispatch]);

  // design grid template
  const rows = Array.from({ length: 19 });
  const columns = Array.from({ length: 6 });

  // ad bg-red to options
  const isNegativeOption = (value) => {
    if (value) {
      const validOptions = ["sí cumple", "no aplica"];
      const currentOption = value.toLowerCase();
      return !validOptions.includes(currentOption);
    }
  };

  // get options !== sí cumple, no aplica to bg them
  const getNegativeOptions = () => {
    const currentOptions = [];
    for (const key in currentEvaluacion) {
      if (evaluacionSelections.includes(key)) {
        currentOptions.push(currentEvaluacion[key]);
      }
    }
    const options = currentOptions.filter(
      (e) => e.toLowerCase() !== "sí cumple" && e.toLowerCase() !== "no aplica",
    );
    return options;
  };

  // style calificacion final
  const getCalificacionStyles = (calificacion) => {
    let calificacionClassname;
    if (calificacion >= 0.8) {
      calificacionClassname = "green-bg white-text";
    } else if (calificacion >= 0.7) {
      calificacionClassname = "yellow-bg white-text";
    } else calificacionClassname = "red-bg white-text";

    return calificacionClassname;
  };

  // submit checkbox option and compromiso to fichas table
  const handleSubmit = async () => {
    if (!(feedbackRecibido && feedbackCompromiso)) {
      return alert("Complete los campos");
    }
    // dispatch(updateAsesorFeedback(currentEvaluacion.id, feedbackRecibido, feedbackCompromiso))
    // navigate('/evaluacionesAsesor')
    try {
      await updateAsesorFeedback(
        currentEvaluacion.id,
        feedbackRecibido,
        feedbackCompromiso,
      );
      alert("Feedback registrado");
      navigate("/evaluacionesAsesor");
    } catch (error) {
      alert("Error al registrar feedback");
      console.error("Error al actualizar evaluacion:", error);
    }
  };

  return (
    <div className="table">
      {rows.map((_, rowIndex) =>
        columns.map((_, colIndex) => {
          // Omitir las celdas necesarias para las combinaciones
          if (rowIndex === 1 && colIndex === 0) return null;
          if (rowIndex === 0 && colIndex > 1 && colIndex <= 5) return null;
          if (rowIndex === 1 && colIndex > 1 && colIndex <= 5) return null;
          if (rowIndex === 2 && colIndex > 1 && colIndex <= 3) return null;
          if (rowIndex === 3 && colIndex > 1 && colIndex <= 3) return null;
          if (rowIndex === 6 && colIndex > 4) return null;
          if (rowIndex === 7 && colIndex > 1 && colIndex <= 3) return null;
          if (rowIndex === 7 && colIndex > 4 && colIndex <= 5) return null;
          if (
            (rowIndex === 8 || rowIndex === 9 || rowIndex === 10) &&
            colIndex === 0
          )
            return null;
          if (rowIndex === 8 && colIndex > 1 && colIndex <= 3) return null;
          if (rowIndex === 8 && colIndex > 4 && colIndex <= 5) return null;
          if (rowIndex === 9 && colIndex > 1 && colIndex <= 3) return null;
          if (rowIndex === 9 && colIndex > 4 && colIndex <= 5) return null;
          if (rowIndex === 10 && colIndex > 1 && colIndex <= 3) return null;
          if (rowIndex === 10 && colIndex > 4 && colIndex <= 5) return null;
          if (rowIndex === 11 && colIndex > 1 && colIndex <= 3) return null;
          if (rowIndex === 11 && colIndex > 4 && colIndex <= 5) return null;

          if (rowIndex === 17 && colIndex >= 3 && colIndex <= 5) return null;
          if (
            currentEvaluacion.feedback_recibido &&
            rowIndex === 18 &&
            colIndex >= 0 &&
            colIndex < 3
          )
            return null;
          if (rowIndex === 18 && colIndex >= 3 && colIndex <= 5) return null;

          if (rowIndex === 0 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell rowspan"
                style={{ "--row-span": 2 }}
              >
                <div className="feedback__logo-text">
                  <img src={icon} alt="Icon" className="cell-image" />
                  <div>
                    <p>COBRANZAS</p>
                    <p>PERU</p>
                  </div>
                </div>
              </div>
            );
          }

          if (rowIndex === 0 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 5, fontSize: "1.6rem" }}
              >
                <strong>FORMATO DE FEEDBACK - PLAN DE MEJORA CONTINUA</strong>
              </div>
            );
          }

          if (rowIndex === 1 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan general-data"
                style={{ "--col-span": 5 }}
              >
                DATOS GENERALES
              </div>
            );
          }

          if (rowIndex === 2 && colIndex === 0) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                ID
              </div>
            );
          }

          if (rowIndex === 2 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3 }}
              >
                {/* 5481 */}
                {currentEvaluacion.id}
              </div>
            );
          }

          if (rowIndex === 2 && colIndex === 4) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                MONITOR
              </div>
            );
          }

          if (rowIndex === 2 && colIndex === 5) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* Aquispe */}
                {currentEvaluacion.nombre_monitor}
              </div>
            );
          }

          if (rowIndex === 3 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                COLABORADOR
              </div>
            );
          }

          if (rowIndex === 3 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan blue-bg"
                style={{ "--col-span": 3 }}
              >
                {/* VELASQUEZ CAICEDO, NICOLE BRISSETTE */}
                {currentEvaluacion.agente}
              </div>
            );
          }

          if (rowIndex === 3 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                NOTA
              </div>
            );
          }

          if (rowIndex === 3 && colIndex === 5) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                // styles depending on current value
                style={{ fontSize: "1.2rem" }}
                className={`cell ${getCalificacionStyles(
                  currentEvaluacion.calificacion_final,
                )}`}
              >
                {/* 48.00% */}
                {(currentEvaluacion.calificacion_final * 100).toFixed(2)} %
              </div>
            );
          }

          // Nuevas celdas
          if (rowIndex === 4 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                FECHA DE LLAMADA
              </div>
            );
          }

          if (rowIndex === 4 && colIndex === 1) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* 19/4/2024 */}
                {currentEvaluacion.fecha_llamada}
              </div>
            );
          }

          if (rowIndex === 4 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                GESTIÓN
              </div>
            );
          }

          if (rowIndex === 4 && colIndex === 3) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* Monitoreo Calidad */}
                {currentEvaluacion.tipo_llamada}
              </div>
            );
          }

          if (rowIndex === 4 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                SUPERVISOR
              </div>
            );
          }

          if (rowIndex === 4 && colIndex === 5) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {supervisor}
                {/* VICTOR UCHUYA (X) */}
              </div>
            );
          }

          if (rowIndex === 5 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                FECHA DE MONITOREO
              </div>
            );
          }

          if (rowIndex === 5 && colIndex === 1) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* 19/4/2024 */}
                {currentEvaluacion.fecha_monitoreo}
              </div>
            );
          }

          if (rowIndex === 5 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                MOTIVO
              </div>
            );
          }

          if (rowIndex === 5 && colIndex === 3) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* Asesor no indaga motivo */}
                {currentEvaluacion.motivo_no_pago}
              </div>
            );
          }

          if (rowIndex === 5 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                CARTERA
              </div>
            );
          }

          if (rowIndex === 5 && colIndex === 5) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* F CONFIANZA PREVENTIVA */}
                {currentEvaluacion.tramo}
              </div>
            );
          }

          if (rowIndex === 6 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell gray-bg white-text"
              >
                FECHA DE FEEDBACK
              </div>
            );
          }

          if (rowIndex === 6 && colIndex === 1) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* 11/5/2024 */}
                {new Date().toLocaleDateString()}
              </div>
            );
          }

          if (rowIndex === 6 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                // className="cell gray-bg white-text"
                className="cell white-text"
              >
                {/* RESULTADO */}
              </div>
            );
          }

          if (rowIndex === 6 && colIndex === 3) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                {/* Cliente predispuesto (X) */}
              </div>
            );
          }

          if (rowIndex === 6 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 2 }}
              />
            );
          }

          // Nuevas celdas para el nuevo grupo
          if (rowIndex === 7 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell black-bg white-text"
              >
                ITEM
              </div>
            );
          }

          if (rowIndex === 7 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan black-bg white-text"
                style={{ "--col-span": 3 }}
              >
                PUNTO DE ENTRENAMIENTO
              </div>
            );
          }

          if (rowIndex === 7 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan black-bg white-text"
                style={{ "--col-span": 2 }}
              >
                RESULTADO DE LLAMADA
              </div>
            );
          }

          //   1. Apertura

          if (rowIndex === 8 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell rowspan"
                style={{ "--row-span": 3 }}
              >
                1. Apertura
              </div>
            );
          }

          if (rowIndex === 8 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                1.1 Saludo
              </div>
            );
          }

          if (rowIndex === 9 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.saludo_11) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.saludo_11}
              </div>
            );
          }

          if (rowIndex === 9 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                1.2 Contactar con la persona adecuada
              </div>
            );
          }

          if (rowIndex === 10 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(
                    currentEvaluacion.contactar_con_persona_12,
                  ) && "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.contactar_con_persona_12}
              </div>
            );
          }

          if (rowIndex === 10 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                1.3 Identificación del gestor
              </div>
            );
          }

          if (rowIndex === 11 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(
                    currentEvaluacion.identificacion_gestor_13,
                  ) && "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.identificacion_gestor_13}
              </div>
            );
          }

          //   2. Indagacion

          if (rowIndex === 11 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell rowspan"
                style={{ "--row-span": 3 }}
              >
                2. Indagacion y asesoramiento
              </div>
            );
          }

          if (rowIndex === 11 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                2.1 Brindar información de la situación del producto
              </div>
            );
          }

          if (rowIndex === 12 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.brindar_informacion_21) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* No brinda información de la situación */}
                {currentEvaluacion.brindar_informacion_21}
              </div>
            );
          }

          if (rowIndex === 12 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                2.2 Indagar motivo de no pago + sustento de pago
              </div>
            );
          }

          if (rowIndex === 12 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(
                    currentEvaluacion.indagar_motivo_no_pago_22,
                  ) && "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* No sondea el motivo de atraso */}
                {currentEvaluacion.indagar_motivo_no_pago_22}
              </div>
            );
          }

          if (rowIndex === 12 && colIndex === 3) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                2.3 Asesorar
              </div>
            );
          }

          if (rowIndex === 12 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.asesorar_23) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* No informa beneficios y/o perjuicios */}
                {currentEvaluacion.asesorar_23}
              </div>
            );
          }

          //   3. Manejo de llamada

          if (rowIndex === 12 && colIndex === 5) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell rowspan"
                style={{ "--row-span": 2 }}
              >
                3. Manejo de llamada
              </div>
            );
          }

          if (rowIndex === 13 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                3.1 Buscar compromiso con el cliente teniendo sentido de
                urgencia
              </div>
            );
          }

          if (rowIndex === 13 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(
                    currentEvaluacion.mantiene_sentido_urgencia_31,
                  ) && "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* No impone sentido de urgencia / cliente toma decisión */}
                {currentEvaluacion.mantiene_sentido_urgencia_31}
              </div>
            );
          }

          if (rowIndex === 13 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                3.2 Perseverancia en el objetivo | Manejo de objeciones
              </div>
            );
          }

          if (rowIndex === 13 && colIndex === 3) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(
                    currentEvaluacion.perseverancia_objetivo_32,
                  ) && "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* No aplica */}
                {currentEvaluacion.perseverancia_objetivo_32}
              </div>
            );
          }

          //   4. Cierre de llamada

          if (rowIndex === 13 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell rowspan"
                style={{ "--row-span": 2 }}
              >
                4. Cierre de llamada
              </div>
            );
          }

          if (rowIndex === 13 && colIndex === 5) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                4.1 Reafirmar acuerdos y próximos pasos (Parafraseo)
              </div>
            );
          }

          if (rowIndex === 14 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.reafirmar_acuerdos_41) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* No reconfirma compromiso de pago */}
                {currentEvaluacion.reafirmar_acuerdos_41}
              </div>
            );
          }

          if (rowIndex === 14 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                4.2 Despedida del cliente
              </div>
            );
          }

          if (rowIndex === 14 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.despedida_cliente_42) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.despedida_cliente_42}
              </div>
            );
          }

          //   5. Habilidades blandas
          if (rowIndex === 14 && colIndex === 3) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell rowspan"
                style={{ "--row-span": 3 }}
              >
                5. Habilidades blandas
              </div>
            );
          }

          if (rowIndex === 14 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                5.1 Escucha activa
              </div>
            );
          }

          if (rowIndex === 14 && colIndex === 5) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.escucha_activa_51) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.escucha_activa_51}
              </div>
            );
          }

          if (rowIndex === 15 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                5.2 Comunicación con el cliente
              </div>
            );
          }

          if (rowIndex === 15 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.comunicacion_cliente_52) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.comunicacion_cliente_52}
              </div>
            );
          }

          if (rowIndex === 15 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                5.3 Amabilidad con el cliente
              </div>
            );
          }

          if (rowIndex === 15 && colIndex === 3) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.amabilidad_cliente_53) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.amabilidad_cliente_53}
              </div>
            );
          }

          //   6. Uso de herramientas
          if (rowIndex === 15 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell rowspan"
                style={{ "--row-span": 2 }}
              >
                6. Uso de herramientas
              </div>
            );
          }

          if (rowIndex === 15 && colIndex === 5) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                6.1 Uso de herramientas de apoyo
              </div>
            );
          }

          if (rowIndex === 16 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.uso_herramientas_61) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* No utiliza la información cuando es necesario */}
                {currentEvaluacion.uso_herramientas_61}
              </div>
            );
          }

          if (rowIndex === 16 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 3, textAlign: "left" }}
              >
                6.2 Registro de gestiones (tipificación)
              </div>
            );
          }

          if (rowIndex === 16 && colIndex === 2) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell colspan ${
                  isNegativeOption(currentEvaluacion.registro_gestiones_62) &&
                  "red-bg white-text"
                }`}
                style={{ "--col-span": 2 }}
              >
                {/* Sí cumple */}
                {currentEvaluacion.registro_gestiones_62}
              </div>
            );
          }

          // OBSERVACIONES, COMPROMISO

          if (rowIndex === 16 && colIndex === 3) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan black-bg white-text"
                style={{ "--col-span": 4 }}
              >
                OBSERVACIONES (MONITOR)
              </div>
            );
          }

          if (rowIndex === 16 && colIndex === 4) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan black-bg white-text"
                style={{ "--col-span": 2 }}
              >
                COMPROMISO (ASESOR)
              </div>
            );
          }

          if (rowIndex === 16 && colIndex === 5) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 4 }}
              >
                {/* Cliente Predispuesto (X) */}
                {currentEvaluacion.motivo_no_fcr}
              </div>
            );
          }

          if (rowIndex === 17 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 2 }}
              >
                {/* VELASQUEZ CAICEDO, NICOLE BRISSETTE (X) */}
                {currentEvaluacion.agente}
              </div>
            );
          }

          if (rowIndex === 17 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan asesorFeedback__observacion"
                style={{ "--col-span": 4 }}
              >
                {/* ASESORA NO BRINDA IMPORTES DE PAGO */}
                {currentEvaluacion.observaciones}
                <ul className="asesorFeedback__observacion-list">
                  {currentEvaluacion &&
                    getNegativeOptions().map((e, index) => (
                      <li key={index}>{e}</li>
                    ))}
                </ul>
              </div>
            );
          }

          if (rowIndex === 17 && colIndex === 2) {
            return (
              <textarea
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan asesorFeedback__textarea"
                style={{ "--col-span": 2, width: "100%" }}
                placeholder="Compromiso"
                value={
                  currentEvaluacion.feedback_compromiso
                    ? currentEvaluacion.feedback_compromiso
                    : feedbackCompromiso
                }
                disabled={currentEvaluacion.feedback_compromiso}
                onChange={(e) => setFeedbackCompromiso(e.target.value)}
              />
            );
          }

          if (rowIndex === 18 && colIndex === 0) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell asesorFeedback__checkbox-container"
                // style={{ '--col-span': 4 }}
              >
                <div className="checkbox-wrapper-19">
                  <input
                    type="checkbox"
                    id="cbtest-19"
                    checked={feedbackRecibido}
                    onChange={(e) => setFeedbackRecibido(e.target.checked)}
                  />
                  <label htmlFor="cbtest-19" className="check-box" />
                </div>
                <label htmlFor="cbtest-19">Confirmar feedback</label>
              </div>
            );
          }

          if (rowIndex === 18 && colIndex === 1) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell colspan"
                style={{ "--col-span": 4 }}
              ></div>
            );
          }

          if (rowIndex === 18 && colIndex === 2) {
            return (
              <div key={`${rowIndex}-${colIndex}`} className="cell">
                <button
                  onClick={handleSubmit}
                  className="asesorFeedback__submit"
                >
                  Grabar
                </button>
              </div>
            );
          }

          // ***************** DEFAULT CELLS **********************

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell row-${rowIndex} col-${colIndex}`}
            >
              {`R${rowIndex + 1}C${colIndex + 1}`}
            </div>
          );
        }),
      )}
    </div>
  );
};

export default AsesorFeedback;
