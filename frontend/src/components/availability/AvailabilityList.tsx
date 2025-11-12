import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface Availability {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  duration_minutes: number;
  time_slots: TimeSlot[];
}

interface AvailabilityListProps {
  refresh: boolean;
}

const AvailabilityList = ({ refresh }: AvailabilityListProps) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailabilities();
  }, [refresh]);

  const fetchAvailabilities = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.get("/api/availabilities/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailabilities(response.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load availabilities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this availability?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axiosClient.delete(`/api/availabilities/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAvailabilities();
    } catch (err: any) {
      window.alert("Failed to delete availability");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading availabilities...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  if (availabilities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No availabilities set. Add your first availability above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">My Availabilities</h2>
      {availabilities.map((availability) => (
        <div
          key={availability.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">
                {new Date(availability.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <p className="text-gray-600">
                {availability.start_time} - {availability.end_time}
              </p>
              <p className="text-sm text-gray-500">
                Slot Duration: {availability.slot_duration} minutes
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(availability.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">
              Time Slots ({availability.time_slots.length} slots):
            </h4>
            <div className="flex flex-wrap gap-2">
              {availability.time_slots.map((slot, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                >
                  {slot.start_time} - {slot.end_time}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailabilityList;