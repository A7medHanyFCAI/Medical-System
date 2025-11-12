import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface Appointment {
  id: number;
  doctor_name: string;
  specialty: string;
  start_date_time: string;
  end_date_time: string;
  duration: string;
}

const MyAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/api/patient/appointments/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this appointment?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axiosClient.delete(`/api/patient/appointments/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">Loading appointments...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <button
          onClick={() => navigate('/patient')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">No appointments yet</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Book Your First Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">Dr. {apt.doctor_name}</h3>
                  <p className="text-gray-600">{apt.specialty}</p>
                  <p className="mt-2">
                    {new Date(apt.start_date_time).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(apt.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;