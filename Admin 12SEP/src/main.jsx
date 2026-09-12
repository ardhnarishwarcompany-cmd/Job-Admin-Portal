import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/sonner";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import ErrorBoundary from "./components/components_lite/ErrorBoundary.jsx";
import { ThemeProvider } from "next-themes";

import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";
import { toast } from "sonner";

// Global Axios Response Interceptor for Robust Error Handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network Error: Please check your internet connectivity.");
      return Promise.reject(error);
    }
    const { status, data } = error.response;
    if (status !== 401 && status !== 403) {
      const errMsg = data?.message || "An unexpected error occurred. Please try again.";
      toast.error(errMsg);
    }
    return Promise.reject(error);
  }
);

const persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
          <ErrorBoundary>
            <App />
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
