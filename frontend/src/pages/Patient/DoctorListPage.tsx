/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface Doctor {
  doctor_id: number;
  user: { 
    id: number;
    username: string; 
    email: string;
  };
  specialty: number | null;
  bio: string;
  contact: string;
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to view doctors');
        navigate('/');
        return;
      }

      // Fetch both doctors and specialties
      const [doctorsResponse, specialtiesResponse] = await Promise.all([
        axiosClient.get('/api/doctors/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosClient.get('/api/specialties/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Doctors Response:', doctorsResponse.data);
      console.log('Specialties Response:', specialtiesResponse.data);

      setDoctors(doctorsResponse.data);
      setSpecialties(specialtiesResponse.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Fetch error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        navigate('/');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view doctors.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load doctors. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get specialty name by ID
  const getSpecialtyName = (specialtyId: number | null): string => {
    if (!specialtyId) return 'General Practice';
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.name : 'General Practice';
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialty = !filters.specialty || 
      (doctor.specialty && doctor.specialty.toString() === filters.specialty);
    const matchesSearch = !filters.search || 
      doctor.user.username.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Find a Doctor</h1>
        <button
          onClick={() => navigate('/patient')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

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
              className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Specialty</label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({...filters, specialty: e.target.value})}
              className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Specialties</option>
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>
        </div>
        {filteredDoctors.length > 0 && (
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* No Results */}
      {!error && filteredDoctors.length === 0 && doctors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-600 text-lg mb-4">No doctors available at the moment</p>
          <button
            onClick={fetchData}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Filtered Results Empty */}
      {!error && filteredDoctors.length === 0 && doctors.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-600 text-lg mb-4">No doctors match your search criteria</p>
          <button
            onClick={() => setFilters({ specialty: '', search: '' })}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Doctors Grid */}
      {!error && filteredDoctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <div key={doctor.doctor_id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {doctor.user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Dr. {doctor.user.username}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">
                    {getSpecialtyName(doctor.specialty)}
                  </p>
                </div>
              </div>
              
              {doctor.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {doctor.bio}
                </p>
              )}
              
              {doctor.contact && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <span className="mr-2">📞</span>
                  <span>{doctor.contact}</span>
                </div>
              )}
              
              <button
                onClick={() => navigate(`/patient/book-appointment/${doctor.doctor_id}`)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorListPage;