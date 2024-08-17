import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TungraDashboard from './components/TungraDashboard';
import LoreEntryPage from './components/LoreEntryPage';
import UserManagement from './components/UserManagement';
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
          {/* <ThemeToggle /> */}
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/" 
              element={user ? <TungraDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/lore/:id" 
              element={user ? <LoreEntryPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/user-management" 
              element={
                user && user.role === 'ADMIN' ? 
                <UserManagement user={user} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;