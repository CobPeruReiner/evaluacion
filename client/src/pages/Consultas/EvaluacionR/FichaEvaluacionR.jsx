import { useEffect } from "react";
import { CaseInformationCard } from "./Components/CaseInformationCard";
import { EvaluationFormPanel } from "./Components/EvaluationFormPanel";
import { EvaluacionContext } from "../../../Context/Evaluacion/EvaluacionContext";
import { useContext } from "react";

export const FichaEvaluacionR = () => {
  const { iniciarMonitoreo, timerActivo } = useContext(EvaluacionContext);

  useEffect(() => {
    if (!timerActivo) {
      iniciarMonitoreo();
    }
  }, []);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-10">
      <div className="xl:col-span-1">
        <CaseInformationCard />
      </div>

      <div className="xl:col-span-2">
        <EvaluationFormPanel />
      </div>
    </div>
  );
};
