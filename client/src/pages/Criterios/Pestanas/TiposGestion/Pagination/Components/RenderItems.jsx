import { useContext } from "react";
import { PagItem } from "./PagItem";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const RenderItems = () => {
  const {
    curPageTipos,
    pageStartTipos,
    pageEndTipos,
    changeCurPageTipos,
    totalTiposPages,
  } = useContext(CriteriosContext);

  // Arreglo para almecenar los botones de la paginacion
  const itemsButtonsMov = [];

  // Boton Anterior (solo si no estamos en la primera pagina)
  if (curPageTipos > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageTipos(curPageTipos - 1)}
      />
    );
  }

  // Si la pagina visible no es la pagina 1, agregamos un boton para ir a la primer pagina
  if (pageStartTipos > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageTipos === 1}
        onPageChange={() => changeCurPageTipos(1)}
      />
    );

    // Si hay mas de 2 paginas ocultar, agregamos puntos suspensivos
    if (pageStartTipos > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  // Paginas
  for (let i = pageStartTipos; i <= pageEndTipos; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageTipos === i}
        onPageChange={() => changeCurPageTipos(i)}
      />
    );
  }

  // Puntos suspensivos
  if (pageEndTipos < totalTiposPages) {
    if (pageEndTipos < totalTiposPages - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    // Agregamos un botón para la última página
    itemsButtonsMov.push(
      <PagItem
        key={totalTiposPages}
        page={totalTiposPages}
        isActiva={curPageTipos === totalTiposPages}
        onPageChange={() => changeCurPageTipos(totalTiposPages)}
      />
    );
  }

  // Botón Siguiente (solo aparece si no estamos en la última página)
  if (curPageTipos < totalTiposPages) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageTipos(curPageTipos + 1)}
      />
    );
  }

  return <>{itemsButtonsMov}</>;
};
