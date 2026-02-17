import { useContext } from "react";
import { PagItem } from "./PagItem";
import { MonitoreoContext } from "../../../../../../Context/Monitoreo/MonitoreoContext";

export const RenderItems = () => {
  const {
    curPageGestiones,
    pageStartGestiones,
    pageEndGestiones,
    changeCurPageGestiones,
    totalGestionesPages,
  } = useContext(MonitoreoContext);

  const itemsButtonsMov = [];

  if (curPageGestiones > 1) {
    itemsButtonsMov.push(
      <PagItem
        key="anterior"
        page={"<"}
        isActiva={false}
        onPageChange={() => changeCurPageGestiones(curPageGestiones - 1)}
      />,
    );
  }

  if (pageStartGestiones > 1) {
    itemsButtonsMov.push(
      <PagItem
        key={1}
        page={1}
        isActiva={curPageGestiones === 1}
        onPageChange={() => changeCurPageGestiones(1)}
      />,
    );

    if (pageStartGestiones > 2) {
      itemsButtonsMov.push(<span key="ellipsis-start">...</span>);
    }
  }

  for (let i = pageStartGestiones; i <= pageEndGestiones; i++) {
    itemsButtonsMov.push(
      <PagItem
        key={i}
        page={i}
        isActiva={curPageGestiones === i}
        onPageChange={() => changeCurPageGestiones(i)}
      />,
    );
  }

  if (pageEndGestiones < totalGestionesPages) {
    if (pageEndGestiones < totalGestionesPages - 1)
      itemsButtonsMov.push(<span key="ellipsis-end">...</span>);

    itemsButtonsMov.push(
      <PagItem
        key={totalGestionesPages}
        page={totalGestionesPages}
        isActiva={curPageGestiones === totalGestionesPages}
        onPageChange={() => changeCurPageGestiones(totalGestionesPages)}
      />,
    );
  }

  if (curPageGestiones < totalGestionesPages) {
    itemsButtonsMov.push(
      <PagItem
        key="siguiente"
        page={">"}
        isActiva={false}
        onPageChange={() => changeCurPageGestiones(curPageGestiones + 1)}
      />,
    );
  }

  return <>{itemsButtonsMov}</>;
};
