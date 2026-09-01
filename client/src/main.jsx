import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import { SideBarProvider } from "./Context/SidebarProvider";
import { Toaster } from "sonner";
import { PrimeReactProvider } from "primereact/api";
import { addLocale } from "primereact/api";
import "./styles/tailwind-base.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./styles/tailwind-utilities.css";
import "./index.css";

addLocale("es", {
  firstDayOfWeek: 1,
  dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
  monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  today: "Hoy",
  clear: "Limpiar",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ locale: "es", ripple: true }}>
      <Provider store={store}>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <SideBarProvider>
            <App />
          </SideBarProvider>
        </BrowserRouter>
      </Provider>
    </PrimeReactProvider>
  </React.StrictMode>,
);
