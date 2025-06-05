import { useContext } from "react";
import { PagItem } from "./PagItem";
import { CriteriosContext } from "../../../../../../../Context/Criterios/ItemContext";

export const RenderItems = () => {
  const {
    curPageTipoLlamada,
    pageStartTipoLlamada,
    pageEndTipoLlamada,
    changeCurPageTipoLlamada,
    totalPaginasTipoLlamada,
  } = useContext(CriteriosContext);

  // Arreglo para almecenar los botones de la paginacion
  const itemsButtonsMov = [];

  // Boton Anterior (solo si no estamos en la primera pagina)
  if (curPageTipoLlamada > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageTipoLlamada(curPageTipoLlamada - 1)}
      />
    );
  }

  // Si la pagina visible no es la pagina 1, agregamos un boton para ir a la primer pagina
  if (pageStartTipoLlamada > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageTipoLlamada === 1}
        onPageChange={() => changeCurPageTipoLlamada(1)}
      />
    );

    // Si hay mas de 2 paginas ocultar, agregamos puntos suspensivos
    if (pageStartTipoLlamada > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  // Paginas
  for (let i = pageStartTipoLlamada; i <= pageEndTipoLlamada; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageTipoLlamada === i}
        onPageChange={() => changeCurPageTipoLlamada(i)}
      />
    );
  }

  // Puntos suspensivos
  if (pageEndTipoLlamada < totalPaginasTipoLlamada) {
    if (pageEndTipoLlamada < totalPaginasTipoLlamada - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    // Agregamos un botón para la última página
    itemsButtonsMov.push(
      <PagItem
        key={totalPaginasTipoLlamada}
        page={totalPaginasTipoLlamada}
        isActiva={curPageTipoLlamada === totalPaginasTipoLlamada}
        onPageChange={() => changeCurPageTipoLlamada(totalPaginasTipoLlamada)}
      />
    );
  }

  // Botón Siguiente (solo aparece si no estamos en la última página)
  if (curPageTipoLlamada < totalPaginasTipoLlamada) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageTipoLlamada(curPageTipoLlamada + 1)}
      />
    );
  }

  return <>{itemsButtonsMov}</>;
};
