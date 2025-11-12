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

const BookAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailabilities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

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
      const startDateTime = `${selectedDate}T${selectedSlot.start_time}:00Z`;
      const endDateTime = `${selectedDate}T${selectedSlot.end_time}:00Z`;

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
      setError(err.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Book Appointment</h1>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Select Date</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {availabilities.map(avail => (
            <button
              key={avail.id}
              onClick={() => setSelectedDate(avail.date)}
              className={`p-4 border rounded ${
                selectedDate === avail.date
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {new Date(avail.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </button>
          ))}
        </div>

        {selectedAvailability && (
          <>
            <h2 className="text-xl font-semibold mb-4">Select Time Slot</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {selectedAvailability.time_slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => slot.is_available && setSelectedSlot(slot)}
                  disabled={!slot.is_available}
                  className={`p-4 border rounded ${
                    selectedSlot === slot
                      ? 'bg-blue-500 text-white'
                      : slot.is_available
                      ? 'bg-white hover:bg-gray-100'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.start_time} - {slot.end_time}
                  {!slot.is_available && <div className="text-xs">Booked</div>}
                </button>
              ))}
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedSlot || loading}
              className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookAppointmentPage;