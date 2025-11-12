import { useState } from "react";
import axios from "axios";

interface AvailabilityFormProps {
  onSuccess: () => void;
}

const AvailabilityForm = ({ onSuccess }: AvailabilityFormProps) => {
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
      await axios.post(
        "http://127.0.0.1:8000/api/availabilities/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Reset form
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        slot_duration: "30",
      });
      
      onSuccess();
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
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
  );
};

export default AvailabilityForm;