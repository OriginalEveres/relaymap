import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./styles/base.css";
import "./styles/v2.css";
import "./styles/api.css";
import "./styles/transitions.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
