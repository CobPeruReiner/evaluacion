import { currentGestionActions } from '../slices/currentGestion.slice';
import { errorActions } from '../slices/error.slice';

export const setGestion = (record, openedWindow) => {
	return async dispatch => {
		try {
			dispatch(currentGestionActions.setCurrentGestion(record));
			localStorage.setItem('record', JSON.stringify(record));
		} catch (error) {
			dispatch(errorActions.setError({ error: error.response.data }));
		}
	};
};