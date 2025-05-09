import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import "./index.css";
import { SideBarProvider } from "./Context/SidebarProvider";
import { CriteriosProvider } from "./Context/Criterios/ItemProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SideBarProvider>
          <CriteriosProvider>
            <App />
          </CriteriosProvider>
        </SideBarProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
