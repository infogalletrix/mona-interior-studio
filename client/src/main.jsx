import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // This imports your Tailwind-enabled CSS
import App from "./App.jsx";
import { showToast } from "./utils/toast";

// Global Loading Overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'global-loading-overlay';
loadingOverlay.innerHTML = `
  <div id="loading-backdrop" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300 opacity-0 pointer-events-none">
    <div id="loading-modal" class="bg-white rounded-3xl px-8 py-6 shadow-2xl flex flex-col items-center gap-4 transform scale-95 transition-all duration-300">
      <div class="w-10 h-10 border-4 border-indigo-100 border-t-[var(--accent)] rounded-full animate-spin"></div>
      <p class="text-slate-800 font-black text-xs uppercase tracking-widest">Processing...</p>
    </div>
  </div>
`;
document.body.appendChild(loadingOverlay);

let activeRequests = 0;
const showLoading = () => {
  activeRequests++;
  const backdrop = document.getElementById('loading-backdrop');
  const modal = document.getElementById('loading-modal');
  backdrop.classList.remove('opacity-0', 'pointer-events-none');
  backdrop.classList.add('opacity-100');
  modal.classList.remove('scale-95');
  modal.classList.add('scale-100');
};

const hideLoading = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    const backdrop = document.getElementById('loading-backdrop');
    const modal = document.getElementById('loading-modal');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    backdrop.classList.remove('opacity-100');
    modal.classList.add('scale-95');
    modal.classList.remove('scale-100');
  }
};

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

  const method = (args[1] && args[1].method) || (args[0] instanceof Request ? args[0].method : 'GET');
  const isSaveRequest = ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase());
  
  if (isSaveRequest) showLoading();

  try {
    const response = await originalFetch.apply(this, args);
    if (!response.ok) {
      showToast(`Server Error: ${response.status} ${response.statusText}`, "error");
    }
    if (isSaveRequest) hideLoading();
    return response;
  } catch (error) {
    showToast(`Network Error: ${error.message}`, "error");
    if (isSaveRequest) hideLoading();
    throw error;
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
