import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import NotFound from "../pages/NotFound";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import PatientDashboard from "../pages/Patient/PatientDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
