import { useContext, useEffect } from "react";
import { checkToken } from "../../../store/actions/user.actions";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";
import { buttonSubmit, inputBorder, labelBorder } from "../../../utils/styles";
import { CriteriosContext } from "../../../Context/Criterios/ItemContext";
import { Down, View } from "../../../Icons/Iconos";
import { SCarteras } from "./Components/Select/SCarteras";

export const Auditoria = () => {
  const {
    formAuditoriaAudios,
    sCarterasRef,
    sCarterasActive,
    handleSelectCarteras,
    carterasActive,
    setFormAuditoriaAudios,
    removerCartera,
    resultadosAuditoria,
    obtenerResultadosAuditoria,
  } = useContext(CriteriosContext);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  // console.log("Usuario: ", user);

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && user?.CARGO !== 17 && user?.CARGO !== 20) {
      navigate("/");
    }
  }, [isAuth, dispatch, user, navigate]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="sombra container-gestiones-cycweb relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        {/* ENCABEZADO */}
        <div className="container-tittle relative flex items-center justify-center w-full">
          <h1 className="text-2xl font-bold">Historial de Evaluaciones</h1>
        </div>

        {/* Filtros */}
        <div className="container-formulario flex flex-col gap-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtro Cartera */}
            <div
              ref={sCarterasRef}
              className="relative w-full"
              onClick={handleSelectCarteras}
            >
              <div
                className={`${inputBorder} flex flex-wrap items-center cursor-pointer`}
              >
                {formAuditoriaAudios.idCarteras.length === 0 ? (
                  <span className="text-gray-400">Todos</span>
                ) : (
                  formAuditoriaAudios.idCarteras.map((id) => {
                    const cartera = carterasActive.find((c) => c.id === id);
                    if (!cartera) return null;

                    return (
                      <div
                        key={id}
                        className="flex items-center bg-gray-200 text-sm px-2 py-1 mr-1 mb-1 rounded"
                      >
                        <span className="mr-1">{cartera.nombre}</span>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-red-500 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            removerCartera(id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <label htmlFor="idCartera" className={labelBorder}>
                Elegir Cartera
              </label>

              <Down
                className={`absolute right-2 top-[35%] ${
                  sCarterasActive ? "rotate-180 text-[#09c]" : ""
                }`}
              />

              <SCarteras />
            </div>

            {/* Filtro Fecha */}
            {/* Filtro Fecha Desde */}
            <div className="relative w-full">
              <input
                type="date"
                id="fechaDesde"
                name="fechaDesde"
                className={inputBorder}
                value={formAuditoriaAudios.fechaDesde || ""}
                onChange={(e) =>
                  setFormAuditoriaAudios({
                    ...formAuditoriaAudios,
                    fechaDesde: e.target.value,
                  })
                }
              />
              <label htmlFor="fechaDesde" className={labelBorder}>
                Desde
              </label>
            </div>

            {/* Filtro Fecha Hasta */}
            <div className="relative w-full">
              <input
                type="date"
                id="fechaHasta"
                name="fechaHasta"
                className={inputBorder}
                value={formAuditoriaAudios.fechaHasta || ""}
                onChange={(e) =>
                  setFormAuditoriaAudios({
                    ...formAuditoriaAudios,
                    fechaHasta: e.target.value,
                  })
                }
              />
              <label htmlFor="fechaHasta" className={labelBorder}>
                Hasta
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={obtenerResultadosAuditoria}
              className={buttonSubmit}
            >
              Buscar
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          <table className="relative w-full text-[#67748e] text-nowrap">
            <thead>
              <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
                <th className="py-3 px-6">Auditoría</th>
                <th className="py-3 px-6">(Q) Audios</th>
                <th className="py-3 px-6">Usuario</th>
                <th className="py-3 px-6">Cartera</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {resultadosAuditoria.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No hay resultados
                  </td>
                </tr>
              ) : (
                resultadosAuditoria.map((item, index) => {
                  const archivo = item.archivo;
                  const exitosos = item.data?.exitosos?.length || 0;
                  const fallidos = item.data?.fallidos?.length || 0;
                  const totalAudios = exitosos + fallidos;

                  // Extraemos el id de la cartera
                  const match = archivo.match(/^resultados_(\d+)_/);
                  const idCartera = match ? match[1] : "-";

                  // Buscamos la cartera
                  const carteraNombre =
                    carterasActive.find((c) => c.id === parseInt(idCartera))
                      ?.nombre || idCartera;

                  // Usuario que subio el zip
                  const usuario = item.data?.usuario || "-";

                  return (
                    <tr
                      key={index}
                      className="text-xs text-left leading-[1.5] font-normal border-b cursor-pointer hover:bg-gray-100"
                    >
                      <td className="py-3 px-6">{archivo}</td>
                      <td className="py-3 px-6">{totalAudios}</td>
                      <td className="py-3 px-6">{usuario}</td>
                      <td className="py-3 px-6">{carteraNombre}</td>
                      <td className="py-3 px-6">
                        <button
                          type="button"
                          className="text-xl text-[#67748e] hover:text-[#09f] transition-all duration-300"
                          onClick={() =>
                            navigate(`/speech/auditoria/detalle/${archivo}`)
                          }
                        >
                          <View />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
