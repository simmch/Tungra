import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TungraDashboard from './components/TungraDashboard';
import LoreEntryPage from './components/LoreEntryPage';
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from './ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<TungraDashboard />} />
            <Route path="/lore/:id" element={<LoreEntryPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;