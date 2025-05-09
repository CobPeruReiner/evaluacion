import { setCurrentEvaluacion } from '../slices/currentEvaluacion.slice';
import { errorActions } from '../slices/error.slice';

export const updateCurrentEvaluacion = (evaluacion) => {
  return async dispatch => {
    try {
      dispatch(setCurrentEvaluacion(evaluacion));
      localStorage.setItem('currentEvaluacion', JSON.stringify(evaluacion));
    } catch (error) {
      dispatch(errorActions.setError({ error: error.response.data }));
    }
  };
};
