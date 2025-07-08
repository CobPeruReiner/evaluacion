import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { Loader } from "../../../../../components/Loader";
import { Close, Pause, Play } from "../../../../../Icons/Iconos";
import moment from "moment";

export const MVerCalificados = () => {
  const {
    processResultSucces,
    audioActivo,
    seleccionarAudio,
    refMVerCalificacion,
    mVerCalificacion,
    closeMVerCalificacion,
    accionSeleccionada,
    seleccionarAccion,
    audioInstance,
    isPlaying,
    audioEnReproduccion,
    reproducirAudio,
  } = useContext(CriteriosContext);

  if (!processResultSucces) return null;

  const rawFecha = processResultSucces[0]?.metadatos?.fecha;
  const fechaGlobal = rawFecha
    ? moment(rawFecha, "YYYYMMDD").format("DD/MM/YYYY")
    : "Sin fecha";

  const cantidadAudios = processResultSucces.length;

  return (
    <div
      className={`fixed left-0 top-0 right-0 bottom-0 bg-[rgba(0,0,0,0.4)] z-[202] flex justify-center items-center transition-all duration-500 ${
        mVerCalificacion ? "visible" : "invisible"
      }`}
    >
      <div
        ref={refMVerCalificacion}
        className={`w-[85%] h-[85%] max-h-[90vh] bg-white rounded-md border border-gray-200 shadow-lg flex flex-col gap-3 p-4 transition-transform duration-500 ${
          mVerCalificacion ? "translate-y-0" : "translate-y-[600%]"
        }`}
      >
        <div className="header-modal-ver-calificados relative w-full text-left">
          <h1 className="relative text-[#344767] text-xl font-bold">
            Evaluados
          </h1>

          <Close
            onClick={closeMVerCalificacion}
            className="absolute right-0 top-0 text-xl cursor-pointer"
          />
        </div>

        <hr />

        <div className="flex w-full gap-4 overflow-hidden h-full">
          {processResultSucces.length > 0 ? (
            <>
              {/* Lista de audios */}
              <div className="relative border border-solid border-gray-200 h-[98%] mt-2 w-1/3 flex flex-col gap-4 bg-transparent rounded-lg shadow p-4 overflow-y-auto">
                <div className="text-sm flex justify-between">
                  <span>
                    <strong>Número de audios:</strong> {cantidadAudios}
                  </span>
                  <span>
                    <strong>{fechaGlobal}</strong>
                  </span>
                </div>

                {processResultSucces.map((item, index) => {
                  // Nombre asesor
                  const full_name = item.metadatos?.full_name || "Asesor";

                  // Calificacion
                  const calificacion = item?.evaluacion?.calificacion || 89;

                  // Fecha y hora
                  const hora =
                    item.metadatos?.hora?.slice(0, 2) +
                      ":" +
                      item.metadatos?.hora?.slice(2, 4) || "00:00";

                  return (
                    <div
                      key={index}
                      onClick={() => seleccionarAudio(index)}
                      className={`cursor-pointer p-3 rounded-md border hover:bg-gray-100 transition-all duration-300 ${
                        audioActivo === index
                          ? "bg-gray-100 border-[#09c] text-[#09c]"
                          : "bg-white"
                      }`}
                    >
                      <div className="font-semibold text-sm">{full_name}</div>
                      <div className="text-xs text-gray-600">
                        Calificación: {calificacion}
                      </div>
                      <div className="text-xs flex items-center justify-between space-x-2">
                        <span>{hora}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            reproducirAudio(item.archivo, index);
                          }}
                        >
                          {audioEnReproduccion === index && isPlaying ? (
                            <Pause className="text-gray-500 hover:text-red-500 cursor-pointer" />
                          ) : (
                            <Play className="text-gray-500 hover:text-blue-500 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Tabs */}
                <div className="absolute left-0 right-0 bottom-0 flex gap-8 text-sm justify-center border-t">
                  <button
                    onClick={() => seleccionarAccion("match")}
                    className={`relative py-4 px-4 border-b-2 transition-all duration-300 ${
                      accionSeleccionada === "match"
                        ? "border-[#09c] text-[#09c]"
                        : "text-gray-400 hover:border-[#09c]"
                    }`}
                  >
                    Match
                  </button>
                  <button
                    onClick={() => seleccionarAccion("notmatch")}
                    className={`relative py-4 px-4 border-b-2 transition-all duration-300 ${
                      accionSeleccionada === "notmatch"
                        ? "border-[#09c] text-[#09c]"
                        : "text-gray-400 hover:border-[#09c]"
                    }`}
                  >
                    Not Match
                  </button>
                  <button
                    onClick={() => seleccionarAccion("audio")}
                    className={`relative py-4 px-4 border-b-2 transition-all duration-300 ${
                      accionSeleccionada === "audio"
                        ? "border-[#09c] text-[#09c]"
                        : "text-gray-400 hover:border-[#09c]"
                    }`}
                  >
                    Audio
                  </button>
                </div>
              </div>

              {/* Transcripción */}
              <div className="relative border border-solid border-gray-200 h-[98%] mt-2 w-2/3 bg-transparent rounded-lg shadow p-4 flex flex-col overflow-hidden">
                {audioActivo !== null && (
                  <>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                      {processResultSucces[audioActivo]?.transcripcion?.map(
                        (seg, i) => {
                          const esAsesor =
                            seg.speaker === "000" || seg.speaker === "002";
                          const nombre = esAsesor
                            ? processResultSucces[audioActivo].metadatos
                                ?.full_name || "Asesor"
                            : "Cliente";

                          return (
                            <div
                              key={i}
                              className={`flex ${
                                esAsesor ? "justify-start" : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-xs px-4 py-3 rounded-2xl shadow text-sm ${
                                  esAsesor
                                    ? "bg-blue-100 text-left"
                                    : "bg-green-100 text-right"
                                }`}
                              >
                                <p className="font-semibold text-xs mb-1">
                                  {nombre}
                                </p>
                                <p className="mb-1">{seg.text}</p>
                                <p className="text-[10px] text-gray-500 mt-1">
                                  [{seg.start.toFixed(2)}s -{" "}
                                  {seg.end.toFixed(2)}s]
                                </p>
                              </div>
                            </div>
                          );
                        }
                      ) || (
                        <p className="text-center text-gray-500">
                          Sin transcripción
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Loader height="h-20" width="w-20" />
          )}
        </div>
      </div>
    </div>
  );
};
