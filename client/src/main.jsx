import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import "./index.css";
import { SideBarProvider } from "./Context/SidebarProvider";
import { CriteriosProvider } from "./Context/Criterios/ItemProvider";
import { EvaluacionProvider } from "./Context/Evaluacion/EvaluacionProvider";
import { MonitoreoProvider } from "./Context/Monitoreo/MonitoreoProvider";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <SideBarProvider>
          <CriteriosProvider>
            <EvaluacionProvider>
              <MonitoreoProvider>
                <App />
              </MonitoreoProvider>
            </EvaluacionProvider>
          </CriteriosProvider>
        </SideBarProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
