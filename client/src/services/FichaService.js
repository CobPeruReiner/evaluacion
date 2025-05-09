import axios from 'axios';
import { API_URL } from '../constants/env';

const getAsesorEvaluaciones = async (params) => {

  try {
    const response = await axios.get(`${API_URL}api/v1/fichas/filter`, {
      params
    });

    return response.data.fichas;
  } catch (error) {
    console.error('Error al mostrar las evaluaciones');
    throw error;
  }
};

export { getAsesorEvaluaciones };