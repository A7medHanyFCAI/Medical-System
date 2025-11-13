import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import NotFound from "../pages/NotFound";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import DoctorAvailabilityPage from "../pages/Doctor/DoctorAvailabilityPage";
import DoctorAppointmentsPage from "../pages/Doctor/DoctorAppointmentsPage";
import DoctorProfilePage from "../pages/Doctor/DoctorProfilePage";
import PatientDashboard from "../pages/Patient/PatientDashboard";
import DoctorListPage from "../pages/Patient/DoctorListPage";
import BookAppointmentPage from "../pages/Patient/BookAppointmentPage";
import MyAppointmentsPage from "../pages/Patient/MyAppointmentsPage";
import PatientProfilePage from "../pages/Patient/PatientProfilePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Doctor Routes */}
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/doctor/profile" element={<DoctorProfilePage />} />
      <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
      <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
      
      {/* Patient Routes */}
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="/patient/profile" element={<PatientProfilePage />} />
      <Route path="/patient/doctors" element={<DoctorListPage />} />
      <Route path="/patient/book-appointment/:doctorId" element={<BookAppointmentPage />} />
      <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;