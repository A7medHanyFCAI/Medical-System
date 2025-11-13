import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    setUsername(storedUsername || '');
    setRole(storedRole || '');
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  };

  const isAuthenticated = !!localStorage.getItem('access_token');

  // Don't show navbar on login/register pages
  if (location.pathname === '/' || location.pathname === '/register') {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getDoctorLinks = () => [
    { path: '/doctor', label: 'Dashboard', icon: '🏠' },
    { path: '/doctor/profile', label: 'My Profile', icon: '👤' },
    { path: '/doctor/availability', label: 'Availability', icon: '📅' },
    { path: '/doctor/appointments', label: 'Appointments', icon: '📋' },
  ];

  const getPatientLinks = () => [
    { path: '/patient', label: 'Dashboard', icon: '🏠' },
    { path: '/patient/profile', label: 'My Profile', icon: '👤' },
    { path: '/patient/doctors', label: 'Find Doctors', icon: '🔍' },
    { path: '/patient/appointments', label: 'My Appointments', icon: '📋' },
  ];

  const links = role === 'doctor' ? getDoctorLinks() : getPatientLinks();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate(role === 'doctor' ? '/doctor' : '/patient')}
              className="flex items-center space-x-2 hover:opacity-80 transition"
            >
              <span className="text-2xl">🏥</span>
              <span className="text-xl font-bold text-blue-600">
                MediCare
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  location.pathname === link.path
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate(role === 'doctor' ? '/doctor/profile' : '/patient/profile')}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="font-semibold">{username}</div>
                <div className="text-gray-500 text-xs capitalize">{role}</div>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* User Info */}
            <button
              onClick={() => {
                navigate(role === 'doctor' ? '/doctor/profile' : '/patient/profile');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">{username}</div>
                <div className="text-gray-500 text-sm capitalize">{role}</div>
              </div>
            </button>

            {/* Navigation Links */}
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  location.pathname === link.path
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium mt-4"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;