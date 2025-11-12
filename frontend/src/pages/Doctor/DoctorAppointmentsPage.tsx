import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface Appointment {
  id: number;
  patient_name: string;
  start_date_time: string;
  end_date_time: string;
}

const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/api/doctor/appointments/', {
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

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <button
          onClick={() => navigate('/doctor')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold">Patient: {apt.patient_name}</h3>
              <p className="text-gray-600 mt-2">
                {new Date(apt.start_date_time).toLocaleString()} - 
                {new Date(apt.end_date_time).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;