import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";

import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { ToastProvider } from "./context/ToastContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);