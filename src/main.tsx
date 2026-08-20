import { Suspense } from "react";
import { createRoot } from "react-dom/client";

import LoadingScreen from "@/components/loading-screen";

import App from "./app";
import "./styles.css";

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>,
  );
}
