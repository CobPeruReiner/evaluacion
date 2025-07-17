import { useContext, useEffect } from "react";
import { CriteriosContext } from "../../../Context/Criterios/ItemContext";
import { Loader } from "../../../components/Loader";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import * as Icon from "../../../Icons/Iconos";
import { Pagination } from "./Components/Pagination/Pagination";
import { Metadatos } from "./Components/Metadatos/Metadatos";
import { Transcripcion } from "./Components/Transcripcion/Transcripcion";
import { TranscripcionError } from "./Components/TranscripcionError/TranscripcionError";
import { Audio } from "./Components/Audio/Audio";
import { RenderComun } from "./Components/Render/Comun/RenderComun";
import { RenderScotiabank } from "./Components/Render/RenderScotiabank";

export const AuditoriaDetail = () => {
  const API_URL = `${import.meta.env.VITE_API_URL}`;

  const { archivo } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  const {
    loadingEvaluacionDetail,
    calificacionRef,
    audiosPaginated,
    obtenerDetalleEvaluacion,
    expandedAudio,
    toggleAudio,
    showDetail,
    toggleDetail,
    resetAuditoriaUIState,
    searchTelefono,
    handleInputSearchTelefono,
    duraciones,
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

  // console.log("Evaluaciones Detail:", evaluacionDetail);
  // console.log("Evaluaciones Paginadas:", audiosPaginated);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="sombra container-gestiones-cycweb relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        <div className="container-header flex flex-col md:flex-row justify-between gap-4 items-center">
          <button
            onClick={() => {
              resetAuditoriaUIState();
              navigate(-1);
            }}
            className="relative text-xl flex items-center text-[#09c] hover:bg-[#09c]/20 rounded-full px-2 py-1 transition-all duration-300"
          >
            <Icon.BackPage size={20} className="mr-2" />
            Volver
          </button>

          <div className="relative text-lg">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Icon.Search />
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full px-9 py-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#09c] focus:border-[#09c] outline-none"
              placeholder="Buscar evaluación..."
              value={searchTelefono}
              onChange={handleInputSearchTelefono}
              autoComplete="off"
            />
          </div>
        </div>

        {loadingEvaluacionDetail ? (
          <Loader />
        ) : (
          <div className="contianer-evaluacion relative flex flex-col gap-5">
            <div className="relative flex flex-col gap-5">
              <h2 className="text-xl font-bold text-gray-800">
                🎧 Audios Exitosos
              </h2>
              {audiosPaginated?.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 shadow rounded-lg overflow-hidden transition-all duration-300"
                >
                  {/* Header del acordeón */}
                  <button
                    type="button"
                    onClick={() => toggleAudio(index)}
                    className="flex justify-between items-center w-full px-6 py-4 bg-white hover:bg-gray-100 font-semibold text-gray-800 text-lg transition-all duration-300"
                  >
                    <span className="truncate">{item.archivo}</span>
                    <span className="text-sm text-gray-600">
                      📞 Teléfono: {item?.metadatos?.telefono}
                    </span>
                    <span className="text-sm text-gray-600">
                      ⏱️ Duración de la Llamada:{" "}
                      {duraciones[index] || "Cargando..."}
                    </span>

                    {expandedAudio === index ? (
                      <Icon.Up size={20} />
                    ) : (
                      <Icon.Down size={20} />
                    )}
                  </button>

                  {/* Cuerpo del acordeón */}
                  <div
                    className={`flex flex-col gap-4 transition-all duration-500 ease-in-out ${
                      expandedAudio === index
                        ? "max-h-screen p-6 bg-gray-50 overflow-y-auto"
                        : "max-h-0 overflow-hidden"
                    }`}
                  >
                    {expandedAudio === index && (
                      <>
                        <Metadatos item={item} />

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDetail(index);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-all duration-300"
                          >
                            <Icon.View size={16} />
                            {showDetail[index]
                              ? "Ocultar Detalle"
                              : "Ver Detalle"}
                          </button>
                        </div>

                        {showDetail[index] && (
                          <div className="relative flex flex-col gap-5 transition-all duration-300">
                            {/* Reproductor de audio */}
                            <Audio
                              item={item}
                              API_URL={API_URL}
                              index={index}
                            />

                            {/* RENDER CALIFICACION */}
                            {item.evaluacion?.scotiabank_evaluacion ? (
                              <RenderScotiabank item={item} itemIndex={index} />
                            ) : (
                              <RenderComun item={item} />
                            )}

                            {/* Diarizacion */}
                            <TranscripcionError item={item} />

                            {/* Transcripción */}
                            <Transcripcion item={item} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Pagination />
          </div>
        )}
      </div>
    </>
  );
};
