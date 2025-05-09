import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	registers: [],
};

const registersSlice = createSlice({
	initialState,
	name: 'registers',
	reducers: {
		setRegisters(state, action) {
			state.registers = action.payload.base;
		},
		getRegisters(state, action) {
			return state.registers;
		},
	},
});

export const registersActions = registersSlice.actions;
export default registersSlice.reducer;