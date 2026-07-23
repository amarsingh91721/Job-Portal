import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="811985715513-4tjkos96e76he9e1udcm2dnlauslho05.apps.googleusercontent.com">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);