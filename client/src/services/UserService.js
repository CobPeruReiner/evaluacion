import axios from 'axios';
import { API_URL } from '../constants/env'

const getSupervisores = async () => {

  try {
    const response = await axios.get(`${API_URL}api/v1/users/supervisores`);
    return response.data.supervisores;

  } catch (error) {
    console.error('Error al obtener los supervisores', error);
    throw error;
  }
};

const getCarteras = async (doc) => {
  try {
    const response = await axios.get(`${API_URL}api/v1/users/carteras`, {
      params: { doc }
    });
    return response.data.carteras;

  } catch (error) {
    console.error('Error al obtener las carteras', error);
    throw error;
  }
};

export { getSupervisores, getCarteras };