import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface Doctor {
  id: number;
  user: { username: string; email: string };
  specialty: { id: number; name: string } | null;
  bio: string;
  contact: string;
  is_approved: boolean;
}

interface Specialty {
  id: number;
  name: string;
}

const DoctorListPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    search: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/api/doctors/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/api/specialties/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialties(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error('Failed to load specialties');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialty = !filters.specialty || doctor.specialty?.id === parseInt(filters.specialty);
    const matchesSearch = !filters.search || 
      doctor.user.username.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSpecialty && matchesSearch && doctor.is_approved;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Find a Doctor</h1>
        <button
          onClick={() => navigate('/patient')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search by Name</label>
            <input
              type="text"
              placeholder="Doctor's name..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full border rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Specialty</label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({...filters, specialty: e.target.value})}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">All Specialties</option>
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {doctor.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">Dr. {doctor.user.username}</h3>
                <p className="text-sm text-gray-600">{doctor.specialty?.name || 'General'}</p>
              </div>
            </div>
            {doctor.bio && <p className="text-gray-600 text-sm mb-4">{doctor.bio}</p>}
            {doctor.contact && <p className="text-sm mb-4">Contact: {doctor.contact}</p>}
            <button
              onClick={() => navigate(`/patient/book-appointment/${doctor.id}`)}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorListPage;