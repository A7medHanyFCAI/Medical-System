import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/common/LogoutButton";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (role !== "doctor") {
      navigate("/");
    } else {
      setUsername(storedUsername || "");
    }
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="bg-white border rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome Dr. {username}</h1>
        <p className="mb-6 text-gray-600">Manage your medical practice from here.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate("/doctor/profile")}
            className="p-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">👤 My Profile</h2>
            <p className="text-sm">View and edit your profile information</p>
          </button>

          <button
            onClick={() => navigate("/doctor/availability")}
            className="p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">📅 Manage Availability</h2>
            <p className="text-sm">Set your available dates and time slots</p>
          </button>
          
          <button
            onClick={() => navigate("/doctor/appointments")}
            className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">📋 View Appointments</h2>
            <p className="text-sm">See your upcoming appointments</p>
          </button>
        </div>
        
        <LogoutButton />
      </div>
    </div>
  );
};

export default DoctorDashboard;