import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export const Audio = ({ item, API_URL }) => {
  const audioURL = `${API_URL}audios/${item.archivo}`;

  return (
    <div className="p-6 bg-white border rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-700">
          🎧 Audio de la llamada
        </h4>
      </div>
      <AudioPlayer
        src={audioURL}
        showJumpControls={false}
        customAdditionalControls={[]}
        className="rounded-md shadow-none"
      />
    </div>
  );
};
