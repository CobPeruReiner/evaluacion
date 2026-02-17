import { useContext, useMemo } from "react";
import { EvaluacionContext } from "../../../../Context/Evaluacion/EvaluacionContext";
import {
  buttonSecondary,
  buttonSubmit,
  inputTextAreaL,
  labelTextAreaL,
} from "../../../../UI/actions";
import { CardSkeleton } from "../../../../components/Skeleton/SKeletonCard";
import {
  estilosNivel,
  getNivelCriterio,
} from "../../../../utils/Evaluacion/getNivelCriterio";
import moment from "moment";

export const EvaluationFormPanel = () => {
  const {
    formularioEvaluacion,
    pendingFormularioEvaluacion,

    activeItemId,
    activeItem,
    changeActiveItem,

    respuestaPorCriterio,
    handleChangeAccion,

    observacionPorItem,
    handleChangeObservacionItem,

    // GO/NEXT
    goNextItem,
    goPrevItem,
    saveEvaluacion,
    isFirstItem,
    isLastItem,

    calificacionGestion,
  } = useContext(EvaluacionContext);

  if (pendingFormularioEvaluacion) {
    return <CardSkeleton blocks={3} />;
  }

  const currentScore = useMemo(() => {
    if (!formularioEvaluacion.length) return 0;

    let total = 0;
    let maximo = 0;

    formularioEvaluacion.forEach((item) => {
      item.criterios.forEach((criterio) => {
        const acciones = criterio.acciones || [];
        if (!acciones.length) return;

        const seleccionadaId = respuestaPorCriterio[criterio.idCriterio];

        const accionSeleccionada = acciones.find(
          (a) => String(a.idAccion) === String(seleccionadaId),
        );

        if (accionSeleccionada) {
          total += Number(accionSeleccionada.pesoAccion);
        }

        const mejorAccion = Math.max(
          ...acciones.map((a) => Number(a.pesoAccion)),
        );

        maximo += mejorAccion;
      });
    });

    if (!maximo) return 0;

    return (total / maximo) * 100;
  }, [formularioEvaluacion, respuestaPorCriterio]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Formulario de Evaluación
            </h2>
            <p className="text-xs text-[#6B7280]">
              Seleccione la calificación adecuada para cada elemento en función
              de la interacción con el cliente
            </p>
          </div>

          <div className="text-right">
            <div className="container-calificacion">
              <p className="text-xs text-[#6B7280]">Calificación</p>
              <p className="text-2xl font-bold text-[#0B67FF]">
                {currentScore.toFixed(0)}%
              </p>
            </div>
            <div className="container-timer">
              <p className="text-xs text-[#6B7280]">Tiempo de monitoreo</p>

              <p className="text-lg font-semibold text-gray-800">
                {moment
                  .utc(calificacionGestion.duracionMonitoreo * 1000)
                  .format("HH:mm:ss")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200 bg-gray-50 px-4">
        <div className="flex gap-6 overflow-x-auto">
          {formularioEvaluacion.map((item) => {
            const active = item.idItem === activeItemId;

            return (
              <button
                key={item.idItem}
                onClick={() => changeActiveItem(item.idItem)}
                className={`relative py-5 text-sm font-medium whitespace-nowrap
                  ${active ? "text-[#0B67FF]" : "text-[#6B7280] hover:text-gray-700"}
                `}
              >
                {item.nombreItem}

                {active && (
                  <span className="absolute left-0 -bottom-[1px] w-full h-[3px] bg-[#0B67FF] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {pendingFormularioEvaluacion && (
          <div className="text-sm text-[#6B7280]">Cargando formulario...</div>
        )}

        {!pendingFormularioEvaluacion && !activeItem && (
          <div className="text-sm text-[#6B7280]">
            No hay configuración disponible.
          </div>
        )}

        {!pendingFormularioEvaluacion && activeItem && (
          <>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {activeItem.nombreItem}
            </h3>

            <p className="text-xs text-[#6B7280] mb-6">
              Seleccione la calificación correspondiente para cada criterio.
            </p>

            {/* Criterios */}
            <div className="flex flex-col gap-4">
              {activeItem.criterios.map((criterio) => {
                const nivel = getNivelCriterio(criterio, respuestaPorCriterio);
                const estilos = estilosNivel[nivel];

                return (
                  <div
                    key={criterio.idCriterio}
                    className={`border rounded-xl px-4 py-4 flex flex-col gap-3 transition-colors duration-200 ${estilos.container}`}
                  >
                    <div className="flex justify-between gap-4 items-center">
                      <p className="text-sm leading-snug font-medium">
                        {criterio.nombreCriterio}
                      </p>

                      <select
                        className={`max-w-80 min-w-[120px] border rounded-md px-3 py-1.5 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 ${estilos.select}`}
                        value={respuestaPorCriterio[criterio.idCriterio] || ""}
                        onChange={(e) =>
                          handleChangeAccion(
                            criterio.idCriterio,
                            e.target.value,
                          )
                        }
                      >
                        <option value=""></option>

                        {criterio.acciones.map((accion) => (
                          <option key={accion.idAccion} value={accion.idAccion}>
                            {accion.nombreAccion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Observación por ITEM */}
            <div className="mt-8">
              <div
                className={`relative w-full container-observacion-item-${activeItem.idItem}`}
              >
                <textarea
                  rows={3}
                  className={inputTextAreaL}
                  value={observacionPorItem[activeItem.idItem] || ""}
                  onChange={(e) =>
                    handleChangeObservacionItem(
                      activeItem.idItem,
                      e.target.value,
                    )
                  }
                  placeholder=" "
                />

                <label className={labelTextAreaL}>Escribir observación</label>
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
        <div className="mt-auto px-6 py-4 border-t border-gray-200 flex justify-between">
          {/* PREVIOUS */}
          <button
            onClick={goPrevItem}
            disabled={isFirstItem}
            className={buttonSecondary}
          >
            Anterior
          </button>

          <div className="flex gap-3">
            {/* SAVE */}
            <button onClick={saveEvaluacion} className={buttonSubmit}>
              Guardar
            </button>

            {/* CONTINUE */}
            <button
              onClick={goNextItem}
              disabled={isLastItem}
              className={buttonSecondary}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
