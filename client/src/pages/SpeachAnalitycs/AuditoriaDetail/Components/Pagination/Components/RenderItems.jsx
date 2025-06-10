import { useContext } from "react";
import { PagItem } from "./PagItem";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const RenderItems = () => {
  const {
    curPageAudios,
    pageStartAudios,
    pageEndAudios,
    changeCurPageAudios,
    totalAudiosPages,
  } = useContext(CriteriosContext);

  // Arreglo para almecenar los botones de la paginacion
  const itemsButtonsMov = [];

  // Boton Anterior (solo si no estamos en la primera pagina)
  if (curPageAudios > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageAudios(curPageAudios - 1)}
      />
    );
  }

  // Si la pagina visible no es la pagina 1, agregamos un boton para ir a la primer pagina
  if (pageStartAudios > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageAudios === 1}
        onPageChange={() => changeCurPageAudios(1)}
      />
    );

    // Si hay mas de 2 paginas ocultar, agregamos puntos suspensivos
    if (pageStartAudios > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  // Paginas
  for (let i = pageStartAudios; i <= pageEndAudios; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageAudios === i}
        onPageChange={() => changeCurPageAudios(i)}
      />
    );
  }

  // Puntos suspensivos
  if (pageEndAudios < totalAudiosPages) {
    if (pageEndAudios < totalAudiosPages - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    // Agregamos un botón para la última página
    itemsButtonsMov.push(
      <PagItem
        key={totalAudiosPages}
        page={totalAudiosPages}
        isActiva={curPageAudios === totalAudiosPages}
        onPageChange={() => changeCurPageAudios(totalAudiosPages)}
      />
    );
  }

  // Botón Siguiente (solo aparece si no estamos en la última página)
  if (curPageAudios < totalAudiosPages) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageAudios(curPageAudios + 1)}
      />
    );
  }

  return <>{itemsButtonsMov}</>;
};
