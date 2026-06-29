import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ProductConfigurator from "./ProductConfigurator.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProductConfigurator />
  </StrictMode>
);
