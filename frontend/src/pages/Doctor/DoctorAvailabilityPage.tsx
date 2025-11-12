import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AvailabilityList from "../../components/availability/AvailabilityList";
import axiosClient from "../../api/axiosClient";

const DoctorAvailabilityPage = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    slot_duration: "30",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      await axiosClient.post("/api/availabilities/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        slot_duration: "30",
      });
      
      setRefresh(!refresh);
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          setError(errorMessages);
        } else {
          setError(String(errorData));
        }
      } else {
        setError("Failed to create availability. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Availability</h1>
        <button
          onClick={() => navigate("/doctor")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Add Availability</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slot Duration (minutes)
              </label>
              <select
                name="slot_duration"
                value={formData.slot_duration}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This determines how long each appointment slot will be
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? "Adding..." : "Add Availability"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <AvailabilityList refresh={refresh} />
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;