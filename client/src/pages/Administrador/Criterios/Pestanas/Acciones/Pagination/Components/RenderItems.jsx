import { useContext } from "react";
import { PagItem } from "./PagItem";
import { CriteriosContext } from "../../../../../../../Context/Criterios/ItemContext";

export const RenderItems = () => {
  const {
    curPageAcciones,
    pageStartAcciones,
    pageEndAcciones,
    changeCurPageAcciones,
    totalAccionesPages,
  } = useContext(CriteriosContext);

  // Arreglo para almecenar los botones de la paginacion
  const itemsButtonsMov = [];

  // Boton Anterior (solo si no estamos en la primera pagina)
  if (curPageAcciones > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageAcciones(curPageAcciones - 1)}
      />
    );
  }

  // Si la pagina visible no es la pagina 1, agregamos un boton para ir a la primer pagina
  if (pageStartAcciones > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageAcciones === 1}
        onPageChange={() => changeCurPageAcciones(1)}
      />
    );

    // Si hay mas de 2 paginas ocultar, agregamos puntos suspensivos
    if (pageStartAcciones > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  // Paginas
  for (let i = pageStartAcciones; i <= pageEndAcciones; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageAcciones === i}
        onPageChange={() => changeCurPageAcciones(i)}
      />
    );
  }

  // Puntos suspensivos
  if (pageEndAcciones < totalAccionesPages) {
    if (pageEndAcciones < totalAccionesPages - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    // Agregamos un botón para la última página
    itemsButtonsMov.push(
      <PagItem
        key={totalAccionesPages}
        page={totalAccionesPages}
        isActiva={curPageAcciones === totalAccionesPages}
        onPageChange={() => changeCurPageAcciones(totalAccionesPages)}
      />
    );
  }

  // Botón Siguiente (solo aparece si no estamos en la última página)
  if (curPageAcciones < totalAccionesPages) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageAcciones(curPageAcciones + 1)}
      />
    );
  }

  return <>{itemsButtonsMov}</>;
};
