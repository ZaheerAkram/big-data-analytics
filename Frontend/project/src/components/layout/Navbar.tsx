import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on login or signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.75V19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.2501 8.74994L5.75 15.2501" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.2501 15.25L5.75 8.74997" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ml-2 text-xl font-heading font-bold text-gray-800">AI Interview</span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAdmin ? (
                <>
                  <Link to="/admin" className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    location.pathname === '/admin' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    location.pathname === '/dashboard' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                    Interviews
                  </Link>
                  <Link to="/status" className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    location.pathname === '/status' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                    Status
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="p-1 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            
            <div className="ml-3 relative">
              <div>
                <button 
                  onClick={toggleDropdown}
                  className="flex text-sm rounded-full focus:outline-none items-center border px-3 py-2 hover:bg-gray-50"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium mr-1">{currentUser?.fullName.split(' ')[0]}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-semibold">{currentUser?.fullName}</p>
                    <p className="text-gray-500">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {isAdmin ? (
            <Link
              to="/admin"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === '/admin' 
                  ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700' 
                  : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  location.pathname === '/dashboard' 
                    ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700' 
                    : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                Interviews
              </Link>
              <Link
                to="/status"
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  location.pathname === '/status' 
                    ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700' 
                    : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                Status
              </Link>
            </>
          )}
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{currentUser?.fullName}</div>
              <div className="text-sm font-medium text-gray-500">{currentUser?.email}</div>
            </div>
            <button className="ml-auto p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-3 space-y-1">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;