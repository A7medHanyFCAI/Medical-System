import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Availability {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  time_slots: TimeSlot[];
}

interface Doctor {
  id: number;
  user: { username: string };
  specialty: { name: string } | null;
}

const BookAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctor();
    fetchAvailabilities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/api/doctors/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundDoctor = response.data.find((d: Doctor) => d.id === parseInt(doctorId!));
      setDoctor(foundDoctor);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error('Failed to load doctor info');
    }
  };

  const fetchAvailabilities = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get(
        `/api/availabilities/by_doctor/?doctor_id=${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailabilities(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to load availabilities');
    }
  };

  const selectedAvailability = availabilities.find(a => a.date === selectedDate);

  const handleBooking = async () => {
    if (!selectedSlot || !selectedDate) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      // Format datetime properly - remove 'Z' suffix for local time
      const startDateTime = `${selectedDate}T${selectedSlot.start_time}:00`;
      const endDateTime = `${selectedDate}T${selectedSlot.end_time}:00`;

      await axiosClient.post(
        '/api/patient/appointments/',
        {
          doctor: parseInt(doctorId!),
          start_date_time: startDateTime,
          end_date_time: endDateTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Appointment booked successfully!');
      navigate('/patient/appointments');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.non_field_errors?.[0] ||
                       'Failed to book appointment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!doctor && !error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Book Appointment</h1>
          {doctor && (
            <p className="text-gray-600 mt-2">
              with Dr. {doctor.user.username} 
              {doctor.specialty && ` - ${doctor.specialty.name}`}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {availabilities.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg text-center">
          <p>This doctor has no available slots at the moment.</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Find Another Doctor
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Date</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {availabilities.map(avail => (
              <button
                key={avail.id}
                onClick={() => {
                  setSelectedDate(avail.date);
                  setSelectedSlot(null);
                }}
                className={`p-4 border-2 rounded transition ${
                  selectedDate === avail.date
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white hover:bg-gray-100 border-gray-300'
                }`}
              >
                <div className="font-semibold">
                  {new Date(avail.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs mt-1">
                  {new Date(avail.date).toLocaleDateString('en-US', {
                    weekday: 'short'
                  })}
                </div>
              </button>
            ))}
          </div>

          {selectedAvailability && (
            <>
              <h2 className="text-xl font-semibold mb-4">Select Time Slot</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {selectedAvailability.time_slots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => slot.is_available && setSelectedSlot(slot)}
                    disabled={!slot.is_available}
                    className={`p-3 border-2 rounded transition ${
                      selectedSlot === slot
                        ? 'bg-blue-500 text-white border-blue-500'
                        : slot.is_available
                        ? 'bg-white hover:bg-gray-100 border-gray-300'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">
                      {slot.start_time}
                    </div>
                    <div className="text-xs mt-1">
                      {slot.end_time}
                    </div>
                    {!slot.is_available && (
                      <div className="text-xs mt-1 font-semibold">Booked</div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedSlot || loading}
                className="w-full bg-green-500 text-white py-3 rounded font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Booking...' : selectedSlot ? `Confirm Booking for ${selectedSlot.start_time}` : 'Select a Time Slot'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAppointmentPage;