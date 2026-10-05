import { useContext, useEffect, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const Audio = ({ item, API_URL, index }) => {
  const audioRef = useRef(null);
  const audioURL = `${API_URL}audios/${item.archivo}`;
  const { setDuracionAudio } = useContext(CriteriosContext);
  const [securedAudioUrl, setSecuredAudioUrl] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";

    const loadAudio = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(audioURL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`No se pudo obtener el audio (${response.status})`);

        objectUrl = URL.createObjectURL(await response.blob());
        setSecuredAudioUrl(objectUrl);
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error al cargar audio:", error);
        setSecuredAudioUrl("");
      }
    };

    loadAudio();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [audioURL]);

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
  }, [securedAudioUrl, index, setDuracionAudio]);

  return (
    <div className="p-6 bg-white border rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-700">
          🎧 Audio de la llamada
        </h4>
      </div>
      <AudioPlayer
        ref={audioRef}
        src={securedAudioUrl}
        showJumpControls={false}
        customAdditionalControls={[]}
        className="rounded-md shadow-none"
      />
    </div>
  );
};
