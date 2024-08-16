import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TungraDashboard from './components/TungraDashboard';
import LoreEntryPage from './components/LoreEntryPage';
import Login from './components/Login';
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from './ThemeToggle';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <ThemeToggle />
          {user && (
            <button 
              onClick={handleLogout}
              className="fixed top-4 right-16 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          )}
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/" 
              element={user ? <TungraDashboard user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/lore/:id" 
              element={user ? <LoreEntryPage user={user} /> : <Navigate to="/login" replace />} 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;