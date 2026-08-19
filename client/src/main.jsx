import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // This imports your Tailwind-enabled CSS
import App from "./App.jsx";
import { showToast } from "./utils/toast";

// Global fetch interceptor for API error reporting and remote URL rewriting
const originalFetch = window.fetch;
window.fetch = async function () {
  let args = Array.from(arguments);
  const baseUrl = import.meta.env.VITE_API_URL;
  
  if (baseUrl && typeof args[0] === 'string' && args[0].startsWith('/api')) {
    args[0] = baseUrl + args[0];
  } else if (baseUrl && args[0] instanceof Request && args[0].url.startsWith('/api')) {
    args[0] = new Request(baseUrl + args[0].url, args[0]);
  }

  try {
    const response = await originalFetch.apply(this, args);
    if (!response.ok) {
      showToast(`Server Error: ${response.status} ${response.statusText}`, "error");
    }
    return response;
  } catch (error) {
    showToast(`Network Error: ${error.message}`, "error");
    throw error;
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
