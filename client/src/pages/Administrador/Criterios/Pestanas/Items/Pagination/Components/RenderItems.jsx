import { useContext } from "react";
import { PagItem } from "./PagItem";
import { CriteriosContext } from "../../../../../../../Context/Criterios/ItemContext";

export const RenderItems = () => {
  const {
    curPageItems,
    pageStarItems,
    pageEndItems,
    changeCurPageItems,
    totalItemsPages,
  } = useContext(CriteriosContext);

  // Arreglo para almecenar los botones de la paginacion
  const itemsButtonsMov = [];

  // Boton Anterior (solo si no estamos en la primera pagina)
  if (curPageItems > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageItems(curPageItems - 1)}
      />
    );
  }

  // Si la pagina visible no es la pagina 1, agregamos un boton para ir a la primer pagina
  if (pageStarItems > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageItems === 1}
        onPageChange={() => changeCurPageItems(1)}
      />
    );

    // Si hay mas de 2 paginas ocultar, agregamos puntos suspensivos
    if (pageStarItems > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  // Paginas
  for (let i = pageStarItems; i <= pageEndItems; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageItems === i}
        onPageChange={() => changeCurPageItems(i)}
      />
    );
  }

  // Puntos suspensivos
  if (pageEndItems < totalItemsPages) {
    if (pageEndItems < totalItemsPages - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    // Agregamos un botón para la última página
    itemsButtonsMov.push(
      <PagItem
        key={totalItemsPages}
        page={totalItemsPages}
        isActiva={curPageItems === totalItemsPages}
        onPageChange={() => changeCurPageItems(totalItemsPages)}
      />
    );
  }

  // Botón Siguiente (solo aparece si no estamos en la última página)
  if (curPageItems < totalItemsPages) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageItems(curPageItems + 1)}
      />
    );
  }

  return <>{itemsButtonsMov}</>;
};
