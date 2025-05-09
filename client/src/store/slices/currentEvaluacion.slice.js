import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentEvaluacion: {},
};

const currentEvaluacionSlice = createSlice({
  name: 'currentEvaluacion',
  initialState,
  reducers: {
    setCurrentEvaluacion(state, action) {
      state.currentEvaluacion = action.payload;
    },
  },
});

export const { setCurrentEvaluacion } = currentEvaluacionSlice.actions;
export default currentEvaluacionSlice.reducer;
