import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useRef<Toast>(null);
  return (
    <ToastContext.Provider value={toast}>
      <Toast ref={toast} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}