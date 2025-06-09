import { useContext, useEffect } from "react";
import { CriteriosContext } from "../../../Context/Criterios/ItemContext";
import { Loader } from "../../../components/Loader";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  BackPage,
  Calendar,
  Campaign,
  Down,
  Hour,
  Phone,
  Up,
  User,
  View,
} from "../../../Icons/Iconos";
import moment from "moment";

export const AuditoriaDetail = () => {
  const API_URL = `${import.meta.env.VITE_API_URL}`;

  const { archivo } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  const {
    loadingEvaluacionDetail,
    evaluacionDetail,
    obtenerDetalleEvaluacion,
    expandedAudio,
    toggleAudio,
    showDetail,
    toggleDetail,
    resetAuditoriaUIState,
  } = useContext(CriteriosContext);

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && user?.CARGO !== 17 && user?.CARGO !== 20) {
      navigate("/");
    } else {
      obtenerDetalleEvaluacion(archivo);
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="sombra container-gestiones-cycweb relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        <button
          onClick={() => {
            resetAuditoriaUIState();
            navigate(-1);
          }}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-all mb-4"
        >
          <BackPage size={20} className="mr-2" />
          Volver
        </button>

        {loadingEvaluacionDetail ? (
          <Loader />
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              🎧 Audios Exitosos
            </h2>
            {evaluacionDetail?.exitosos?.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 shadow mb-4 rounded-lg overflow-hidden transition-all duration-300"
              >
                {/* Header del acordeón */}
                <button
                  type="button"
                  onClick={() => toggleAudio(index)}
                  className="flex justify-between items-center w-full px-6 py-4 bg-white hover:bg-gray-100 font-semibold text-gray-800 text-lg transition-all duration-300"
                >
                  <span className="truncate">{item.archivo}</span>
                  {expandedAudio === index ? (
                    <Up size={20} />
                  ) : (
                    <Down size={20} />
                  )}
                </button>

                {/* Cuerpo del acordeón */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    expandedAudio === index
                      ? "max-h-screen p-6 bg-gray-50 overflow-y-auto"
                      : "max-h-0 overflow-hidden"
                  }`}
                >
                  {expandedAudio === index && (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                        <p className="relative flex items-center gap-4">
                          <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
                            <Calendar className="relative text-2xl" /> Fecha:
                          </span>
                          <span className="relative text-gray-900 text-base">
                            {moment(item.metadatos.fecha, "YYYYMMDD").format(
                              "DD/MM/YYYY"
                            )}
                          </span>
                        </p>
                        <p className="relative flex items-center gap-4">
                          <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
                            <Hour className="relative text-2xl" /> Hora:
                          </span>
                          <span className="relative text-gray-900 text-base">
                            {moment(item.metadatos.hora, "HHmmss").format(
                              "HH:mm:ss"
                            )}
                          </span>
                        </p>
                        <p className="relative flex items-center gap-4">
                          <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
                            <Phone className="relative text-2xl" /> Teléfono:
                          </span>
                          <span className="relative text-gray-900 text-base">
                            {item.metadatos.telefono}
                          </span>
                        </p>
                        <p className="relative flex items-center gap-4">
                          <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
                            <Campaign className="relative text-2xl" /> Campaña:
                          </span>
                          <span className="relative text-gray-900 text-base">
                            {item.metadatos.campaña}
                          </span>
                        </p>
                        <p className="relative flex items-center gap-4">
                          <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
                            <User className="relative text-2xl" /> Anexo:
                          </span>
                          <span className="relative text-gray-900 text-base">
                            {item.metadatos.anexo}
                          </span>
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => toggleDetail(index)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-all duration-300"
                        >
                          <View size={16} />
                          {showDetail[index]
                            ? "Ocultar Detalle"
                            : "Ver Detalle"}
                        </button>
                      </div>

                      {showDetail[index] && (
                        <div className="mt-6 space-y-6">
                          {/* Reproductor de audio */}
                          <div className="mt-4">
                            <h4 className="font-semibold text-lg mb-2 text-gray-700 flex items-center">
                              🎵 Audio
                            </h4>
                            <audio controls className="w-full rounded shadow">
                              <source
                                src={`${API_URL}audios/${item.archivo}`}
                                type={`audio/${
                                  item.archivo.endsWith(".mp3") ? "mpeg" : "wav"
                                }`}
                              />
                              Tu navegador no soporta audio.
                            </audio>
                          </div>

                          {/* Evaluación de APERTURA */}
                          {item.evaluacion?.apertura && (
                            <div className="p-4 bg-white border rounded-lg shadow-sm">
                              <h4 className="font-semibold text-lg mb-3 text-blue-700 flex items-center">
                                📝 Apertura
                              </h4>
                              <div className="text-gray-700 mb-3 space-y-1">
                                <p>
                                  <strong>Resultado:</strong>
                                  <span
                                    className={
                                      item.evaluacion.apertura.resultado ===
                                      "Aprobado"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {item.evaluacion.apertura.resultado}
                                  </span>
                                </p>
                                <p>
                                  <strong>Cumplimiento:</strong>
                                  {item.evaluacion.apertura.cumplimiento?.toFixed(
                                    2
                                  )}
                                  %
                                </p>
                              </div>
                              <div className="bg-gray-50 border rounded p-3 space-y-2">
                                {Object.entries(
                                  item.evaluacion.apertura.criterios || {}
                                ).map(([nombreCriterio, accion], i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between py-1 border-b last:border-b-0"
                                  >
                                    <span className="text-gray-600">
                                      {nombreCriterio}
                                    </span>
                                    <span className="text-right font-medium">
                                      {accion.NOMBRE_ACCION_CRITERIO ||
                                        "No evaluado"}
                                      <span className="text-xs text-gray-400 ml-2">
                                        {accion.PESO_ACCION_CRITERIO}
                                      </span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Evaluación de INDAGACIÓN */}
                          {item.evaluacion?.indagacion && (
                            <div className="p-4 bg-white border rounded-lg shadow-sm">
                              <h4 className="font-semibold text-lg mb-3 text-purple-700 flex items-center">
                                📝 Indagación y Asesoramiento
                              </h4>
                              <div className="text-gray-700 mb-3 space-y-1">
                                <p>
                                  <strong>Resultado:</strong>
                                  <span
                                    className={
                                      item.evaluacion.indagacion.resultado ===
                                      "Aprobado"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {item.evaluacion.indagacion.resultado}
                                  </span>
                                </p>
                                <p>
                                  <strong>Cumplimiento:</strong>
                                  {item.evaluacion.indagacion.cumplimiento?.toFixed(
                                    2
                                  )}
                                  %
                                </p>
                              </div>
                              <div className="bg-gray-50 border rounded p-3 space-y-2">
                                {Object.entries(
                                  item.evaluacion.indagacion.criterios || {}
                                ).map(([nombreCriterio, accion], i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between py-1 border-b last:border-b-0"
                                  >
                                    <span className="text-gray-600">
                                      {nombreCriterio}
                                    </span>
                                    <span className="text-right font-medium">
                                      {accion.NOMBRE_ACCION_CRITERIO ||
                                        "No evaluado"}
                                      <span className="text-xs text-gray-400 ml-2">
                                        {accion.PESO_ACCION_CRITERIO}
                                      </span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Diarizacion */}
                          {item?.error_diarizacion && (
                            <div className="text-sm text-red-600 bg-red-100 p-3 rounded border border-red-200">
                              ⚠️ No se detectó conversación o no se pudo
                              identificar a los hablantes.
                            </div>
                          )}

                          {/* Transcripción */}
                          <div className="space-y-2">
                            {item?.transcripcion.map((seg, i) => {
                              const esAsesor =
                                seg.speaker === "000" || seg.speaker === "002";
                              const nombre = esAsesor
                                ? item.metadatos?.full_name || "Asesor"
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
                                      [{seg.start.toFixed(2)}s -
                                      {seg.end.toFixed(2)}s]
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
