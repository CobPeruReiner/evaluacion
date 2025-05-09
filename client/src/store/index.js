import { configureStore } from '@reduxjs/toolkit'
import user from './slices/user.slice';
import registers from './slices/registers.slice';
import currentGestion from './slices/currentGestion.slice';
import currentEvaluacion from './slices/currentEvaluacion.slice';
import error from './slices/error.slice';

export const store = configureStore({
  reducer: {
        user,
        registers,
        currentGestion,
        currentEvaluacion,
        error,
  },
})