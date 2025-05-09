import { Spinner } from "../Icons/Iconos";

export const Loader = ({ width = "w-12", height = "h-12" }) => {
  return (
    <div className="text-center">
      <div role="status">
        <Spinner
          className={`inline ${width} ${height} animate-spin text-[#09f]`}
        />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};
