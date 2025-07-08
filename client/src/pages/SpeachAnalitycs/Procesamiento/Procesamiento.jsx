import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkToken } from "../../../store/actions/user.actions";
import { Toaster } from "sonner";
import { UploadFile } from "../../../Icons/Iconos";
import { CriteriosContext } from "../../../Context/Criterios/ItemContext";
import { MVerProcesados } from "./Components/Modal/MVerProcesados";
import { MVerCalificados } from "./Components/Modal/MVerCalificados";
import { buttonSecondary } from "../../../utils/styles";

export const Procesamiento = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  const { handleZip, inputRef, openMVerCalificacion } =
    useContext(CriteriosContext);

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && user.cargo === "asesor") {
      navigate("/perfilAsesor");
    }
  }, [isAuth, dispatch]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="sombra container-procesamiento-audios relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        <h1 className="title-procesamiento text-2xl font-bold">
          Procesamiento de Audios
        </h1>

        <div className="upload-file-procesamiento flex-1 flex items-center justify-center min-h-[450px]">
          <div
            className="group relative w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl px-8 py-12 bg-gradient-to-b from-white to-gray-50 hover:from-[#e6f7ff] hover:to-[#d4f0ff] hover:border-[#09c] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center"
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-[#09c]/10 text-[#09c] p-5 rounded-full group-hover:bg-[#09c]/20 transition-all duration-300">
                <UploadFile className="text-5xl" />
              </div>
              <p className="mt-4 text-gray-700 font-medium text-sm group-hover:text-[#09c] transition-all">
                Click o arrastra tus audios aquí
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Formatos soportados: .wav, .mp3 (ZIP)
              </p>
            </div>

            {/* Input oculto */}
            <input
              type="file"
              accept=".zip"
              ref={inputRef}
              onChange={handleZip}
              className="hidden"
            />
          </div>
        </div>

        <div className="buttons-actions-procesa relative flex">
          <button
            type="button"
            className={buttonSecondary}
            onClick={openMVerCalificacion}
          >
            Ver Evaluados
          </button>
        </div>
      </div>

      <MVerProcesados />
      <MVerCalificados />
    </>
  );
};
