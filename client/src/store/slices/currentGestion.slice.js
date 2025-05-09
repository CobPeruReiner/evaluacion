import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	currentGestion: {},
};

const currentGestionSlice = createSlice({
	initialState,
	name: 'currentGestion',
	reducers: {
		setCurrentGestion(state, action) {
			state.currentGestion = action.payload;
		}
	},
});

export const currentGestionActions = currentGestionSlice.actions;
export default currentGestionSlice.reducer;