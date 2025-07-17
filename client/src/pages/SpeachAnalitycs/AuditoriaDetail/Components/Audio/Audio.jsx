import { useContext, useEffect, useRef } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const Audio = ({ item, API_URL, index }) => {
  const audioRef = useRef(null);
  const audioURL = `${API_URL}audios/${item.archivo}`;
  const { setDuracionAudio } = useContext(CriteriosContext);

  useEffect(() => {
    const audioElement = audioRef.current?.audio?.current;
    if (!audioElement) return;

    const handleMetadata = () => {
      const duracionSegundos = audioElement.duration;
      const minutos = Math.floor(duracionSegundos / 60);
      const segundos = Math.floor(duracionSegundos % 60);
      const duracionFormateada = `${minutos}:${segundos
        .toString()
        .padStart(2, "0")}`;
      setDuracionAudio(index, duracionFormateada);
    };

    audioElement.addEventListener("loadedmetadata", handleMetadata);

    // ✅ Solo forzar .load() si la duración aún no está disponible
    if (isNaN(audioElement.duration) || audioElement.duration === Infinity) {
      audioElement.load();
    }

    return () => {
      audioElement.removeEventListener("loadedmetadata", handleMetadata);
    };
  }, [audioURL, index, setDuracionAudio]);

  return (
    <div className="p-6 bg-white border rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-700">
          🎧 Audio de la llamada
        </h4>
      </div>
      <AudioPlayer
        ref={audioRef}
        src={audioURL}
        showJumpControls={false}
        customAdditionalControls={[]}
        className="rounded-md shadow-none"
      />
    </div>
  );
};
