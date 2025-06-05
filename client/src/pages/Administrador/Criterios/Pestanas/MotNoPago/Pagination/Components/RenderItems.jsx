import { useContext } from "react";
import { PagItem } from "./PagItem";
import { CriteriosContext } from "../../../../../../../Context/Criterios/ItemContext";

export const RenderItems = () => {
  const {
    curPageMotivos,
    pageStartMotivos,
    pageEndMotivos,
    changeCurPageMotivos,
    totalMotivosPages,
  } = useContext(CriteriosContext);

  // Arreglo para almecenar los botones de la paginacion
  const itemsButtonsMov = [];

  // Boton Anterior (solo si no estamos en la primera pagina)
  if (curPageMotivos > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageMotivos(curPageMotivos - 1)}
      />
    );
  }

  // Si la pagina visible no es la pagina 1, agregamos un boton para ir a la primer pagina
  if (pageStartMotivos > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageMotivos === 1}
        onPageChange={() => changeCurPageMotivos(1)}
      />
    );

    // Si hay mas de 2 paginas ocultar, agregamos puntos suspensivos
    if (pageStartMotivos > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  // Paginas
  for (let i = pageStartMotivos; i <= pageEndMotivos; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageMotivos === i}
        onPageChange={() => changeCurPageMotivos(i)}
      />
    );
  }

  // Puntos suspensivos
  if (pageEndMotivos < totalMotivosPages) {
    if (pageEndMotivos < totalMotivosPages - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    // Agregamos un botón para la última página
    itemsButtonsMov.push(
      <PagItem
        key={totalMotivosPages}
        page={totalMotivosPages}
        isActiva={curPageMotivos === totalMotivosPages}
        onPageChange={() => changeCurPageMotivos(totalMotivosPages)}
      />
    );
  }

  // Botón Siguiente (solo aparece si no estamos en la última página)
  if (curPageMotivos < totalMotivosPages) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageMotivos(curPageMotivos + 1)}
      />
    );
  }

  return <>{itemsButtonsMov}</>;
};
