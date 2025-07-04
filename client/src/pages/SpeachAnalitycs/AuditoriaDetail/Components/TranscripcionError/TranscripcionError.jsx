export const TranscripcionError = ({ item }) => {
  return (
    <>
      {item?.error_diarizacion && (
        <div className="text-sm text-red-600 bg-red-100 p-3 rounded border border-red-200">
          ⚠️ No se detectó conversación o no se pudo identificar a los
          hablantes.
        </div>
      )}
    </>
  );
};
