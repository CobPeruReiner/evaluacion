import { useContext } from "react";
import { PagItem } from "./PagItem";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const RenderItems = () => {
  const {
    curPageCriterios,
    pageStarCriterios,
    pageEndCriterios,
    changeCurPageCriterios,
    totalCriteriosPages,
  } = useContext(CriteriosContext);

  // Arreglo para almecenar los botones de la paginacion
  const itemsButtonsMov = [];

  // Boton Anterior (solo si no estamos en la primera pagina)
  if (curPageCriterios > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageCriterios(curPageCriterios - 1)}
      />
    );
  }

  // Si la pagina visible no es la pagina 1, agregamos un boton para ir a la primer pagina
  if (pageStarCriterios > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageCriterios === 1}
        onPageChange={() => changeCurPageCriterios(1)}
      />
    );

    // Si hay mas de 2 paginas ocultar, agregamos puntos suspensivos
    if (pageStarCriterios > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  // Paginas
  for (let i = pageStarCriterios; i <= pageEndCriterios; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageCriterios === i}
        onPageChange={() => changeCurPageCriterios(i)}
      />
    );
  }

  // Puntos suspensivos
  if (pageEndCriterios < totalCriteriosPages) {
    if (pageEndCriterios < totalCriteriosPages - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    // Agregamos un botón para la última página
    itemsButtonsMov.push(
      <PagItem
        key={totalCriteriosPages}
        page={totalCriteriosPages}
        isActiva={curPageCriterios === totalCriteriosPages}
        onPageChange={() => changeCurPageCriterios(totalCriteriosPages)}
      />
    );
  }

  // Botón Siguiente (solo aparece si no estamos en la última página)
  if (curPageCriterios < totalCriteriosPages) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageCriterios(curPageCriterios + 1)}
      />
    );
  }

  return <>{itemsButtonsMov}</>;
};
