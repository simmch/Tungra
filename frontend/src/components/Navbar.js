import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-indigo-600 p-4 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold hover:text-indigo-200 transition-colors duration-300">
            Tungra Lore
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex items-center space-x-4">
          {user.role === 'ADMIN' && (
            <button
              onClick={() => navigate('/user-management')}
              className="px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-400 transition-colors duration-300"
            >
              User Management
            </button>
          )}
          {user.isGuest ? (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-400 transition-colors duration-300"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-400 transition-colors duration-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;