import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { PibloPrototype } from "./piblo-prototype";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Piblo root element was not found.");
}

createRoot(root).render(
    <StrictMode>
        <PibloPrototype />
    </StrictMode>,
);
