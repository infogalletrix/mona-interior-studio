import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CRMPage from "./pages/CRMPage";
import BillingPage from "./pages/BillingPage";
import InvoicesPage from "./pages/InvoicesPage";
import QuotationPage from "./pages/QuotationPage";
import ExpensePage from "./pages/ExpensePage";
import SitesPage from "./pages/SitesPage";
import AccountsPage from "./pages/AccountsPage";
import EmployeesPage from "./pages/EmployeesPage";
import AttendancePage from "./pages/AttendancePage";
import SalaryPage from "./pages/SalaryPage";
import ReportsPage from "./pages/ReportsPage";
import ReceiptPage from "./pages/ReceiptPage";
import ResetDatabasePage from "./pages/ResetDatabasePage";
import { DialogProvider } from "./contexts/DialogContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.on("update-available", () => {
        setUpdateStatus("Downloading new update...");
        setUpdateError("");
      });
      window.ipcRenderer.on("update-downloaded", () => {
        setUpdateStatus("Update ready to install. Click here to restart.");
      });
      window.ipcRenderer.on("update-error", (err) => {
        setUpdateError(err);
        setUpdateStatus("");
      });
    }
  }, []);

  const handleRestart = () => {
    if (window.ipcRenderer && updateStatus.includes("ready")) {
      window.ipcRenderer.send("restart_app");
    }
  };

  return (
    <ThemeProvider>
      <DialogProvider>
        <Router>
          <div className="flex h-screen bg-[#F4F5F7] dark:bg-slate-950 text-[#1C2B4B] dark:text-white overflow-hidden transition-colors duration-300 relative">
            
            {/* Update Notification Banner */}
            {updateStatus && (
              <div 
                onClick={handleRestart}
                className={`absolute top-0 left-0 right-0 z-50 text-center py-2 text-white font-medium ${updateStatus.includes('ready') ? 'bg-green-600 cursor-pointer hover:bg-green-700' : 'bg-blue-500'}`}
              >
                {updateStatus}
              </div>
            )}
            
            {/* Update Error Banner */}
            {updateError && (
              <div 
                className="absolute top-0 left-0 right-0 z-50 text-center py-2 text-white font-medium bg-red-600 cursor-pointer"
                onClick={() => setUpdateError("")}
              >
                Update Error: {updateError}
              </div>
            )}

            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <main className="flex-1 overflow-y-auto relative flex flex-col items-center">
              <div className="w-full max-w-[1600px] 2xl:max-w-[1920px] mx-auto">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/crm" element={<CRMPage />} />
                    <Route path="/quotations" element={<QuotationPage />} />

                    {/* Finance */}
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/expenses" element={<ExpensePage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/receipts" element={<ReceiptPage />} />

                    {/* Projects */}
                    <Route path="/sites" element={<SitesPage />} />

                    {/* HR */}
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/salary" element={<SalaryPage />} />
                    <Route path="/reports" element={<ReportsPage />} />

                    {/* Admin Utilities */}
                    <Route path="/reset007" element={<ResetDatabasePage />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </Router>
      </DialogProvider>
    </ThemeProvider>
  );
}

export default App;
