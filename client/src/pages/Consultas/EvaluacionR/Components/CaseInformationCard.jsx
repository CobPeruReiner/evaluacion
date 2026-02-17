import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { FiUpload } from "react-icons/fi";
import { inputBorder, labelBorder } from "../../../../UI/actions";
import { EvaluacionContext } from "../../../../Context/Evaluacion/EvaluacionContext";
import { useContext, useEffect } from "react";
import { SkeletonInput } from "../../../../components/Skeleton/SkeletonInput";
import moment from "moment";
import { CardSkeleton } from "../../../../components/Skeleton/SKeletonCard";

export const CaseInformationCard = () => {
  const {
    fillInfoGestion,
    infoGestion,
    calificacionGestion,
    handleChangeCalificacionGestion,
    dataTipoLlamada,
    PendingTipoLlamada,
    dataTipoGestion,
    PendingTipoGestion,
    dataMotivoNoPago,
    PendingMotivoNoPago,
    dataResponsableNoFCR,
    pendingResponsableNoFCR,

    dataMotivoNoFCR,
    pendingMotivoNoFCR,
    getMotivoNoFCR,

    dataMotivoAlerta,
    pendingMotivoAlerta,
  } = useContext(EvaluacionContext);

  const isLoading =
    PendingTipoLlamada ||
    PendingTipoGestion ||
    PendingMotivoNoPago ||
    !infoGestion?.idGestion;

  useEffect(() => {
    fillInfoGestion();
  }, []);

  if (isLoading) {
    return <CardSkeleton blocks={2} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-solid border-b border-gray-200 transition-all duration-300">
        <h2 className="text-base font-semibold text-gray-800">
          Información de la gestión
        </h2>

        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          En Evaluación
        </span>
      </div>

      {/* Audio */}
      <div className="relative bg-gray-100 px-5 py-4 flex flex-col gap-4 border-solid border-b border-gray-200 transition-all duration-300">
        <div className="flex justify-between text-xs text-gray-500 ">
          <span>Call Recording</span>
        </div>

        <AudioPlayer
          showJumpControls={false}
          customAdditionalControls={[]}
          customVolumeControls={[]}
          layout="horizontal"
        />

        <button
          type="button"
          disabled={false}
          className=" w-full inline-flex items-center justify-center gap-2 text-xs font-medium border border-gray-200 rounded-md py-2 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-300"
        >
          <FiUpload className="text-sm" />
          Subir audio
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 text-sm px-5 py-4 border-solid border-b border-gray-200 transition-all duration-300">
        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs">Cartera</p>
          <p className="text-gray-800 font-medium text-xs">
            {infoGestion?.nombreCartera || "-"}
          </p>
        </div>

        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs">ID Gestión</p>
          <p className="text-gray-800 font-medium text-xs">
            {infoGestion?.idGestion || "-"}
          </p>
        </div>

        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs">Agente</p>
          <p className="text-gray-800 font-medium text-xs">
            {infoGestion?.nombreAgente || "-"}
          </p>
        </div>

        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs">Cliente</p>
          <p className="text-gray-800 font-medium text-xs">
            {infoGestion?.codCliente || "-"}
          </p>
        </div>

        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs">Fecha</p>
          <p className="text-gray-800 font-medium text-xs">
            {infoGestion?.fechaGestion
              ? moment(infoGestion?.fechaGestion)
                  .utc()
                  .format("DD/MM/YYYY HH:mm:ss")
              : "-"}
          </p>
        </div>

        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs">Teléfono</p>
          <p className="text-gray-800 font-medium text-xs">
            {infoGestion?.telefonoGestion || "-"}
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative flex flex-col gap-5 px-5 py-4 transition-all duration-300">
        {/* Disposition */}
        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs ">Tipificación</p>
          <div className="container-tipo-gestion">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {infoGestion?.tipificacionGestion || "-"}
            </span>
          </div>
        </div>

        {/* Reason */}
        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs ">Motivo</p>
          <p className="text-gray-800 text-sm">
            {infoGestion?.motivoGestion || "-"}
          </p>
        </div>

        {/* AHT / Call type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
          <div className="relative flex flex-col gap-2 transition-all duration-300">
            <p className="text-gray-400 text-xs ">TMO</p>
            <div className="relative w-full">
              <input
                name="tiempoMuertoGestion"
                value={calificacionGestion.tiempoMuertoGestion}
                onChange={handleChangeCalificacionGestion}
                className={inputBorder}
              />
              <label
                htmlFor="tiempoMuertoGestion"
                className={labelBorder}
              ></label>
            </div>
          </div>

          <div className="relative flex flex-col gap-2 transition-all duration-300">
            <p className="text-gray-400 text-xs ">Tipo de Llamada</p>
            <div className="relative w-full">
              <select
                name="idTipoLlamada"
                disabled={PendingTipoLlamada}
                value={calificacionGestion.idTipoLlamada ?? ""}
                onChange={handleChangeCalificacionGestion}
                className={`${inputBorder} ${
                  PendingTipoLlamada ? "text-transparent" : ""
                }`}
              >
                <option value="">
                  {PendingTipoLlamada ? "Cargando..." : "Seleccione un tipo…"}
                </option>

                {!PendingTipoLlamada &&
                  dataTipoLlamada.map((item) => (
                    <option
                      key={item.ID_TIPO_LLAMADA}
                      value={item.ID_TIPO_LLAMADA}
                    >
                      {item.NOMBRE_TIPO_LLAMADA}
                    </option>
                  ))}
              </select>

              {PendingTipoLlamada && <SkeletonInput />}

              <label htmlFor="idTipoLlamada" className={labelBorder}></label>
            </div>
          </div>
        </div>

        {/* Management type */}
        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs ">Tipo de Gestión</p>
          <div className="container-select-tipo-gestion relative w-full">
            <select
              name="idTipoGestion"
              disabled={PendingTipoGestion}
              value={calificacionGestion.idTipoGestion ?? ""}
              onChange={handleChangeCalificacionGestion}
              className={`${inputBorder} ${
                PendingTipoGestion ? "text-transparent" : ""
              }`}
            >
              <option value="">
                {PendingTipoGestion ? "Cargando..." : "Seleccione un tipo…"}
              </option>

              {!PendingTipoGestion &&
                dataTipoGestion.map((item) => (
                  <option
                    key={item.ID_TIPO_GESTION}
                    value={item.ID_TIPO_GESTION}
                  >
                    {item.NOMBRE_TIPO_GESTION}
                  </option>
                ))}
            </select>

            {PendingTipoGestion && <SkeletonInput />}

            <label htmlFor="idTipoGestion" className={labelBorder}></label>
          </div>
        </div>

        {/* Non payment reason */}
        <div className="relative flex flex-col gap-2 transition-all duration-300">
          <p className="text-gray-400 text-xs ">Motivo de No Pago</p>
          <div className="container-select-motivo-Nopago relative w-full">
            <select
              name="idMotivoNoPago"
              disabled={PendingMotivoNoPago}
              value={calificacionGestion.idMotivoNoPago ?? ""}
              onChange={handleChangeCalificacionGestion}
              className={`${inputBorder} ${
                PendingMotivoNoPago ? "text-transparent" : ""
              }`}
            >
              <option value="">
                {PendingMotivoNoPago ? "Cargando..." : "Seleccione un motivo…"}
              </option>

              {!PendingMotivoNoPago &&
                dataMotivoNoPago.map((item) => (
                  <option
                    key={item.ID_MOTIVO_NO_PAGO}
                    value={item.ID_MOTIVO_NO_PAGO}
                  >
                    {item.NOMBRE_MOTIVO_NO_PAGO}
                  </option>
                ))}
            </select>

            {PendingMotivoNoPago && <SkeletonInput />}

            <label htmlFor="idMotivoNoPago" className={labelBorder}></label>
          </div>
        </div>

        {/* Flag */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={calificacionGestion.isAlerta}
            onChange={(e) =>
              handleChangeCalificacionGestion({
                target: {
                  name: "isAlerta",
                  value: e.target.checked,
                },
              })
            }
            className="h-4 w-4"
          />
          <label htmlFor="isAlerta" className="text-sm text-gray-700">
            Marcar con Alerta
          </label>
        </div>

        {calificacionGestion.isAlerta && (
          <div className="relative flex flex-col gap-2 transition-all duration-300">
            <p className="text-gray-400 text-xs">Motivo alerta</p>

            <div className="relative w-full">
              <select
                name="idMotivoAlerta"
                disabled={pendingMotivoAlerta}
                value={calificacionGestion.idMotivoAlerta ?? ""}
                onChange={(e) => {
                  const id = e.target.value;

                  const obj = dataMotivoAlerta.find(
                    (m) => String(m.ID_MOTIVO_ALERTA) === String(id),
                  );

                  handleChangeCalificacionGestion({
                    target: { name: "idMotivoAlerta", value: id || null },
                  });

                  handleChangeCalificacionGestion({
                    target: {
                      name: "nombreMotivoAlerta",
                      value: obj?.NOMBRE_MOTIVO_ALERTA || "",
                    },
                  });
                }}
                className={`${inputBorder} ${
                  pendingMotivoAlerta ? "text-transparent" : ""
                }`}
              >
                <option value="">
                  {pendingMotivoAlerta
                    ? "Cargando..."
                    : "Seleccione motivo de alerta…"}
                </option>

                {!pendingMotivoAlerta &&
                  dataMotivoAlerta.map((m) => (
                    <option key={m.ID_MOTIVO_ALERTA} value={m.ID_MOTIVO_ALERTA}>
                      {m.NOMBRE_MOTIVO_ALERTA}
                    </option>
                  ))}
              </select>

              {pendingMotivoAlerta && <SkeletonInput />}

              <label htmlFor="idMotivoAlerta" className={labelBorder}></label>
            </div>
          </div>
        )}

        {/* FCR */}
        {!calificacionGestion.isAlerta && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
            <div className="relative flex flex-col gap-2 transition-all duration-300">
              <p className="text-gray-400 text-xs ">Responsable No FCR</p>
              <div className="relative w-full">
                <select
                  name="idResponsableNoFCR"
                  disabled={
                    pendingResponsableNoFCR || calificacionGestion.isAlerta
                  }
                  value={calificacionGestion.idResponsableNoFCR ?? ""}
                  onChange={(e) => {
                    const id = e.target.value;

                    const obj = dataResponsableNoFCR.find(
                      (r) => String(r.ID_RESPONSABLE_NO_FCR) === String(id),
                    );

                    handleChangeCalificacionGestion({
                      target: { name: "idResponsableNoFCR", value: id || null },
                    });

                    handleChangeCalificacionGestion({
                      target: {
                        name: "nombreResponsableNoFCR",
                        value: obj?.NOMBRE_RESPONSABLE_NO_FCR || "",
                      },
                    });

                    handleChangeCalificacionGestion({
                      target: { name: "idMotivoNoFCR", value: null },
                    });

                    handleChangeCalificacionGestion({
                      target: { name: "nombreMotivoNoFCR", value: "" },
                    });

                    getMotivoNoFCR(id);
                  }}
                  className={`${inputBorder} ${
                    pendingResponsableNoFCR ? "text-transparent" : ""
                  }`}
                >
                  <option value="">
                    {pendingResponsableNoFCR
                      ? "Cargando..."
                      : "Seleccione responsable…"}
                  </option>

                  {!pendingResponsableNoFCR &&
                    dataResponsableNoFCR.map((r) => (
                      <option
                        key={r.ID_RESPONSABLE_NO_FCR}
                        value={r.ID_RESPONSABLE_NO_FCR}
                      >
                        {r.NOMBRE_RESPONSABLE_NO_FCR}
                      </option>
                    ))}
                </select>

                {pendingResponsableNoFCR && <SkeletonInput />}

                <label
                  htmlFor="idResponsableNoFCR"
                  className={labelBorder}
                ></label>
              </div>
            </div>

            <div className="relative flex flex-col gap-2 transition-all duration-300">
              <p className="text-gray-400 text-xs ">Motivo No FCR</p>
              <div className="relative w-full">
                <select
                  name="idMotivoNoFCR"
                  disabled={
                    pendingMotivoNoFCR ||
                    calificacionGestion.isAlerta ||
                    !calificacionGestion.idResponsableNoFCR
                  }
                  value={calificacionGestion.idMotivoNoFCR ?? ""}
                  onChange={(e) => {
                    const id = e.target.value;

                    const obj = dataMotivoNoFCR.find(
                      (m) => String(m.ID_MOTIVO_NO_FCR) === String(id),
                    );

                    handleChangeCalificacionGestion({
                      target: { name: "idMotivoNoFCR", value: id || null },
                    });

                    handleChangeCalificacionGestion({
                      target: {
                        name: "nombreMotivoNoFCR",
                        value: obj?.NOMBRE_MOTIVO_NO_FCR || "",
                      },
                    });
                  }}
                  className={`${inputBorder} ${
                    pendingMotivoNoFCR ? "text-transparent" : ""
                  }`}
                >
                  <option value="">
                    {pendingMotivoNoFCR ? "Cargando..." : "Seleccione motivo…"}
                  </option>

                  {!pendingMotivoNoFCR &&
                    dataMotivoNoFCR.map((m) => (
                      <option
                        key={m.ID_MOTIVO_NO_FCR}
                        value={m.ID_MOTIVO_NO_FCR}
                      >
                        {m.NOMBRE_MOTIVO_NO_FCR}
                      </option>
                    ))}
                </select>

                {pendingMotivoNoFCR && <SkeletonInput />}

                <label htmlFor="idMotivoNoFCR" className={labelBorder}></label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
