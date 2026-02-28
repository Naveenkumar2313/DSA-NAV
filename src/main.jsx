import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// ROOT APP COMPONENT
import App from "./app/App";
// THIRD PARTY CSS
import "perfect-scrollbar/css/perfect-scrollbar.css";

const root = createRoot(document.getElementById("root"));

root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);
