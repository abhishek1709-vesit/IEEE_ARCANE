import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthForm } from "./components/AuthForm";
import { DashboardRedesigned } from "./components/DashboardRedesigned";
import { PatientsPage } from "./components/PatientsPage";
import { PatientDetailPage } from "./components/PatientDetailPage";
import { AlertsPage } from "./components/AlertsPage";
import { SettingsPage } from "./components/SettingsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { useEffect } from "react";

function App() {
  // Initialize dark mode from localStorage when app loads
  useEffect(() => {
    const savedSettings = localStorage.getItem("doctorSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      if (parsedSettings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/dashboard" element={<DashboardRedesigned />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:patientId" element={<PatientDetailPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
