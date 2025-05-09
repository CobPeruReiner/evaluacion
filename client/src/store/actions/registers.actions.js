import axios from 'axios';

import { registersActions } from '../slices/registers.slice';
import { errorActions } from '../slices/error.slice';

const API_URL = `${import.meta.env.VITE_API_URL}api/v1/base/`;

export const getRegisters = () => {
	return async dispatch => {
		try {
			const res = await axios.get(API_URL);
			const { base } = res.data;
			dispatch(registersActions.setRegisters({base}));
		} catch (error) {
			dispatch(errorActions.setError({ error: error.response.data }));
		}
	};
};

export const setRegisters = (base) => {
	return async dispatch => {
		try {
			dispatch(registersActions.setRegisters({ base }));
		} catch (error) {
			dispatch(errorActions.setError({ error: error.response.data }));
		}
	};
};

export const deleteRegister = (id) => {
	return async dispatch => {
		try {
            await axios.delete(`${API_URL}${id}`);
		} catch (error) {
			dispatch(errorActions.setError({ error: error.response.data }));
		}
	};
};


// export const submitRegisters = (baseData) => {
// 	return async dispatch => {
// 		try {
//             const res = await axios.post(API_URL, baseData);
// 			const { newBase } = res.data;
// 			dispatch(registersActions.setRegisters(newBase));
// 			dispatch(getRegisters());
            
// 		} catch (error) {
// 			dispatch(errorActions.setError({ error: error.response.data }));
// 		}
// 	};
// };