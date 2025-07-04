import { Apertura } from "./Apertura/Apertura";
import { Indagacion } from "./Indagacion/Indagacion";

export const RenderComun = ({ item }) => {
  return (
    <>
      {/* Evaluación de APERTURA */}
      <Apertura item={item} />

      {/* Evaluación de INDAGACIÓN */}
      <Indagacion item={item} />
    </>
  );
};
