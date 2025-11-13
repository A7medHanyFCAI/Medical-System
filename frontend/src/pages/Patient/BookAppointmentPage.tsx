/* eslint-disable @typescript-eslint/no-explicit-any */
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
  doctor_id: number;
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
  const [initialLoading, setInitialLoading] = useState(true);

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
      const foundDoctor = response.data.find((d: Doctor) => d.doctor_id === parseInt(doctorId!));
      setDoctor(foundDoctor);
    } catch (err) {
      console.error('Failed to load doctor info:', err);
      setError('Failed to load doctor information');
    }
  };

  const fetchAvailabilities = async () => {
    setInitialLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axiosClient.get(
        `/api/availabilities/by_doctor/?doctor_id=${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAvailabilities(response.data);
      
      if (response.data.length === 0) {
        setError('This doctor has no available slots at the moment.');
      }
    } catch (err: any) {
      console.error('Failed to load availabilities:', err);
      setError(err.response?.data?.detail || 'Failed to load doctor availability');
    } finally {
      setInitialLoading(false);
    }
  };

  const selectedAvailability = availabilities.find(a => a.date === selectedDate);

  const handleBooking = async () => {
    if (!selectedSlot || !selectedDate) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      // FIXED: Format datetime properly with Z suffix for UTC
      // Combine date and time, then add seconds and timezone
      const startDateTime = `${selectedDate}T${selectedSlot.start_time}:00Z`;
      const endDateTime = `${selectedDate}T${selectedSlot.end_time}:00Z`;

      console.log('Booking appointment:', {
        doctor: parseInt(doctorId!),
        start_date_time: startDateTime,
        end_date_time: endDateTime
      });

      await axiosClient.post(
        '/api/patient/appointments/',
        {
          doctor: parseInt(doctorId!),
          start_date_time: startDateTime,
          end_date_time: endDateTime
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      alert('✅ Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err: any) {
      console.error('Booking error:', err);
      console.error('Error response:', err.response?.data);
      
      // Better error handling
      let errorMsg = 'Failed to book appointment';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMsg = errorData.non_field_errors.join(', ');
        } else if (Array.isArray(errorData)) {
          errorMsg = errorData.join(', ');
        } else {
          // Handle field-specific errors
          const errors = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMsg = errors || JSON.stringify(errorData);
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
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
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Back
        </button>
      </div>

      {error && !availabilities.length && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-6 rounded-lg text-center mb-6">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Find Another Doctor
          </button>
        </div>
      )}

      {error && availabilities.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
          <p className="font-semibold mb-2">⚠️ Booking Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {availabilities.length === 0 && !initialLoading && !error && (
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg text-center">
          <p className="mb-4">This doctor has no available slots at the moment.</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Find Another Doctor
          </button>
        </div>
      )}

      {availabilities.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Date</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {availabilities.map(avail => (
              <button
                key={avail.id}
                onClick={() => {
                  setSelectedDate(avail.date);
                  setSelectedSlot(null);
                  setError('');
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
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs mt-1">
                  {new Date(avail.date).toLocaleDateString('en-US', {
                    weekday: 'short'
                  })}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  {avail.time_slots.filter(s => s.is_available).length} slots
                </div>
              </button>
            ))}
          </div>

          {selectedAvailability && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Select Time Slot
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({selectedAvailability.time_slots.filter(s => s.is_available).length} available)
                </span>
              </h2>
              
              {selectedAvailability.time_slots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded">
                  <p className="text-gray-600">No time slots available for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {selectedAvailability.time_slots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (slot.is_available) {
                          setSelectedSlot(slot);
                          setError('');
                        }
                      }}
                      disabled={!slot.is_available}
                      className={`p-3 border-2 rounded transition ${
                        selectedSlot === slot
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                          : slot.is_available
                          ? 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300'
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
                        <div className="text-xs mt-1 font-semibold text-red-600">Booked</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedSlot || loading}
                className="w-full bg-green-500 text-white py-3 rounded font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Booking...' : selectedSlot ? `Confirm Booking for ${selectedSlot.start_time} - ${selectedSlot.end_time}` : 'Select a Time Slot'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAppointmentPage;