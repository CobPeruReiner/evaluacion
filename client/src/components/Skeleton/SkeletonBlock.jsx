export const SkeletonBlock = ({ title = true, lines = 6, className = "" }) => {
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="flex flex-col w-full h-3 mb-4 bg-gray-300 rounded-full animate-pulse" />
      )}

      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="block w-full h-2 mb-2 bg-gray-300 rounded-full animate-pulse"
        />
      ))}
    </div>
  );
};
