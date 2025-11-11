import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/common/LogoutButton";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (role !== "patient") {
      navigate("/");
    } else {
      setUsername(storedUsername || "");
    }
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Welcome {username}</h1>
      <p className="mb-6">This is your dashboard.</p>
      <LogoutButton />
    </div>
  );
};

export default PatientDashboard;
