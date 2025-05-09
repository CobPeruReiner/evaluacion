import axios from 'axios';

import { usersActions } from '../slices/user.slice';
import { errorActions } from '../slices/error.slice';

const USERS_URL = `${import.meta.env.VITE_API_URL}api/v1/users/`;

export const login = (usuario, password) => {
	return async dispatch => {
		try {
			const res = await axios.post(`${USERS_URL}login`, { usuario, password });

			const { user, token } = res.data;

			localStorage.setItem('token', token);

			dispatch(usersActions.login({ user }));
		} catch (error) {
			dispatch(errorActions.setError({ error: error.response.data }));
		}
	};
};

export const signup = userData => {
	return async dispatch => {
		try {
			await axios.post(`${USERS_URL}`, { ...userData });
		} catch (error) {
			dispatch(errorActions.setError({ error: error.response.data }));
		}
	};
};

export const logout = () => {
	return async dispatch => {
		try {
			localStorage.removeItem('token');
			dispatch(usersActions.logout());
		} catch (error) {
			dispatch(errorActions.setError({ error: error.response.data }));
		}
	};
};

export const checkToken = (navigate) => {
	return async dispatch => {
		try {
			const token = localStorage.getItem('token');
			const res = await axios.get(`${USERS_URL}check-token`, {
				headers: { authorization: `Bearer ${token}` },
			});
			dispatch(usersActions.refreshUser({ user: res.data.user }));
		} catch (error) {
			dispatch(logout());
			navigate('/login')
		}
	};
};
