import React, { useState } from "react";
import { Database, AlertTriangle, Key } from "lucide-react";
import { useDialog } from "../contexts/DialogContext";
import { useNavigate } from "react-router-dom";

export default function ResetDatabasePage() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showDialog } = useDialog();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!password) {
      showDialog({ title: "Error", message: "Password is required.", type: "error" });
      return;
    }

    showDialog({
      title: "EXTREME DANGER: Factory Reset",
      message: "This will permanently delete all data in the database and reset it to a clean slate. This action CANNOT be undone. Are you absolutely sure?",
      type: "confirm",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const response = await fetch(`/api/reset-database?password=${encodeURIComponent(password)}`, {
            method: 'POST'
          });
          
          if (response.ok) {
            const data = await response.json();
            showDialog({ 
              title: "Success", 
              message: data.message || "Database reset successfully.", 
              type: "success" 
            });
            setPassword("");
            setTimeout(() => {
                navigate("/");
                window.location.reload();
            }, 1500);
          } else {
            showDialog({ 
              title: "Access Denied", 
              message: "Invalid password or reset failed.", 
              type: "error" 
            });
          }
        } catch (error) {
          showDialog({ 
            title: "Connection Error", 
            message: "Failed to connect to the server.", 
            type: "error" 
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 w-full">
      <div className="themed-card shadow-2xl rounded-3xl overflow-hidden max-w-md w-full border border-rose-500/30 bg-[var(--bg-surface)]">
        <div className="bg-rose-500/10 p-6 flex flex-col items-center justify-center border-b border-rose-500/20">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 text-rose-500">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-rose-500 uppercase tracking-widest text-center">System Reset</h2>
          <p className="text-center text-sm font-medium text-rose-500/80 mt-2">
            Restricted access zone.
          </p>
        </div>
        
        <form onSubmit={handleReset} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2 flex items-center gap-2">
              <Key size={14} /> Authorization Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
              className="w-full p-3 border border-[var(--border-color)] rounded-xl themed-input outline-none focus:border-rose-500 font-bold tracking-widest text-center transition bg-transparent"
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !password}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-lg ${
              isSubmitting || !password
                ? "bg-rose-500/50 text-white/50 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 text-white hover:shadow-rose-600/20"
            }`}
          >
            <Database size={18} /> {isSubmitting ? "Resetting..." : "Initiate Reset"}
          </button>
        </form>
      </div>
    </div>
  );
}
