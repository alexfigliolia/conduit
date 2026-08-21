import { createRoot } from "react-dom/client";

import { App } from "./Root";

import "./styles.scss";

const ROOT = document.getElementById("app");

if (!ROOT) {
  throw new Error("WHOOPs");
}

createRoot(ROOT).render(<App />);
