export const PagItem = ({ isActiva, onPageChange, page }) => {
  return (
    <div
      className={`paginacion-item w-9 h-9 flex justify-center items-center text-sm text-[#8392ab] border border-[#dee2e6] shadow-md rounded-full cursor-pointer ${
        isActiva ? "bg-[#09c] text-white" : "bg-transparent hover:bg-gray-100"
      } transition-all duration-300`}
      onClick={onPageChange}
    >
      {page}
    </div>
  );
};
