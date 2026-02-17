import { SkeletonBlock } from "./SkeletonBlock";

export const CardSkeleton = ({ blocks = 2 }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col gap-6">
        {Array.from({ length: blocks }).map((_, i) => (
          <SkeletonBlock key={i} />
        ))}
      </div>
    </div>
  );
};
