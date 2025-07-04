export const Transcripcion = ({ item }) => {
  return (
    <div className="space-y-2">
      {item?.transcripcion.map((seg, i) => {
        const esAsesor = seg.speaker === "000" || seg.speaker === "002";
        const nombre = esAsesor
          ? item.metadatos?.full_name || "Asesor"
          : "Cliente";

        return (
          <div
            key={i}
            className={`flex ${esAsesor ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl shadow text-sm ${
                esAsesor ? "bg-blue-100 text-left" : "bg-green-100 text-right"
              }`}
            >
              <p className="font-semibold text-xs mb-1">{nombre}</p>
              <p className="mb-1">{seg.text}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                [{seg.start.toFixed(2)}s -{seg.end.toFixed(2)}s]
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
