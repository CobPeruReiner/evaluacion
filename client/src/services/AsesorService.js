import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAsesorEvaluaciones = async (dni, month) => {

  try {
    const response = await axios.get(`${API_URL}api/v1/fichas/evaluaciones`, {
      params: { dni, month }
    });

    return response.data.fichas;
  } catch (error) {
    console.error('Error al mostrar las evaluaciones del asesor:', error);
    throw error;
  }
};

const getAsesorPromedioCalificacion = async (dni) => {

  try {
    const response = await axios.get(`${API_URL}api/v1/fichas/promedioAnualCalificacion`, {
      params: { dni }
    });

    return response.data.promedio;
  } catch (error) {
    console.error('Error al mostrar las evaluaciones del asesor:', error);
    throw error;
  }
};

const updateAsesorFeedback = async (id, isCompleted, commitment) => {

  try {
    const response = await axios.patch(`${API_URL}api/v1/fichas`, {
       idevaluacion: id, isFeedbackCompleted: isCompleted, compromiso: commitment
    });
    return response.data
  } catch (error) {
    console.error('Error al actualizar evaluacion:', error);
    throw error;
  }
};

export { getAsesorEvaluaciones, getAsesorPromedioCalificacion, updateAsesorFeedback };