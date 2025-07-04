export const Audio = ({ item, API_URL }) => {
  return (
    <div className="mt-4">
      <h4 className="font-semibold text-lg mb-2 text-gray-700 flex items-center">
        🎵 Audio
      </h4>
      <audio controls className="w-full rounded shadow">
        <source
          src={`${API_URL}audios/${item.archivo}`}
          type={`audio/${item.archivo.endsWith(".mp3") ? "mpeg" : "wav"}`}
        />
        Tu navegador no soporta audio.
      </audio>
    </div>
  );
};
