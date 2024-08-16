import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const TungraDashboard = ({ user }) => {
  const [loreEntries, setLoreEntries] = useState([]);
  const [newLoreTitle, setNewLoreTitle] = useState('');
  const [newLoreDescription, setNewLoreDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiError, setAiError] = useState('');
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  
  const scrollToTop = () => topRef.current.scrollIntoView({ behavior: 'smooth' });
  const scrollToBottom = () => bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  
  useEffect(() => {
    if (user.role === 'ADMIN') {
      fetchLoreEntries();
    }
  }, [user.role]);

  const fetchLoreEntries = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    
      // Make the fetch request with the Authorization header
      const response = await fetch('/api/lore', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Sort entries by timestamp, newest first
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLoreEntries(sortedData);
    } catch (error) {
      console.error('Error fetching lore entries:', error);
    }
  };

  const handleAiSearch = async () => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    setIsAiSearching(true);
    setAiError('');
    try {
      const response = await axios.post(
        '/api/ai-search', 
        { query: aiQuery },  // Request body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',  // Optionally specify content type
          }
        }
      );
      setAiResponse(response.data.answer);
    } catch (error) {
      console.error('Error querying AI:', error);
      setAiError(error.response?.data?.error || 'An error occurred while processing your question. Please try again.');
    }
    setIsAiSearching(false);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      const response = await fetch('/api/lore', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          title: newLoreTitle,
          description: newLoreDescription,
          writer: 'Dashboard User', // You might want to implement user authentication
        })
      });
      if (response.ok) {
        setNewLoreTitle('');
        setNewLoreDescription('');
        fetchLoreEntries(); // Refresh the list
      }
    } catch (error) {
      console.error('Error adding new lore entry:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      const response = await fetch('/api/lore/search', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      setSearchResults(data);
      setIsSearching(true);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const handleDeleteConfirmation = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      const response = await fetch(`/api/lore/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setLoreEntries(loreEntries.filter(entry => entry._id !== deleteId));
        setSearchResults(searchResults.filter(entry => entry._id !== deleteId));
      }
    } catch (error) {
      console.error('Error deleting lore entry:', error);
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleEdit = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      const response = await fetch(`/api/lore/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (response.ok) {
        setEditingId(null);
        fetchLoreEntries(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating lore entry:', error);
    }
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const renderLoreEntry = (entry, isSearchResult = false) => (
    <motion.div 
      key={entry._id} 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {editingId === entry._id ? (
        <form onSubmit={(e) => { e.preventDefault(); handleEdit(entry._id); }} className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={4}
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-300">
              Save
            </button>
            <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors duration-300">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="text-2xl font-bold mb-2 text-indigo-700 dark:text-indigo-300">{entry.original_title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{truncateText(entry.original_description, 50)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Added by: {entry.writer} on {new Date(entry.timestamp).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.original_description.split(' ').length > 50 && (
              <Link 
                to={`/lore/${entry._id}`}
                className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors duration-300"
              >
                View More
              </Link>
            )}
            <button 
              onClick={() => {
                setEditingId(entry._id);
                setEditTitle(entry.original_title);
                setEditDescription(entry.original_description);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300"
            >
              Edit
            </button>
            <button 
              onClick={() => handleDeleteConfirmation(entry._id)}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </motion.div>
  );

return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
    <div ref={topRef} />
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-10">
      <button
        onClick={scrollToTop}
        className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 transition-colors duration-300"
        aria-label="Scroll to top"
      >
        ↑
      </button>
      <button
        onClick={scrollToBottom}
        className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 transition-colors duration-300"
        aria-label="Scroll to bottom"
      >
        ↓
      </button>
    </div>
    
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center text-indigo-900 dark:text-indigo-300 mb-12">Tungra Lore Dashboard</h1>
      
      {(user.role === 'ADMIN' || user.role === 'EDITOR') && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">Add New Lore</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={newLoreTitle}
              onChange={(e) => setNewLoreTitle(e.target.value)}
              placeholder="Lore Title"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <textarea
              value={newLoreDescription}
              onChange={(e) => setNewLoreDescription(e.target.value)}
              placeholder="Lore Description"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
            />
            <button type="submit" className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300">
              Add New Lore
            </button>
          </form>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">AI Lore Search</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Ask AI about the lore"
            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button 
            onClick={handleAiSearch} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
            disabled={isAiSearching}
          >
            {isAiSearching ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>
        {aiError && <p className="text-red-500 mt-2">{aiError}</p>}
      </div>
      
      {aiResponse && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">AI Response</h2>
          <p className="text-gray-700 dark:text-gray-300">{aiResponse}</p>
        </div>
      )}
      
      {user.role === 'ADMIN' && (
        <>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-12">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">Search Lore</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') {
                    setIsSearching(false);
                    setSearchResults([]);
                  }
                }}
                placeholder="Search Lore"
                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button 
                onClick={handleSearch} 
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
              >
                Search
              </button>
            </div>
          </div>

          {isSearching && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-indigo-900 dark:text-indigo-300">Search Results</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((entry) => renderLoreEntry(entry, true))}
              </div>
            </div>
          )}

          {!isSearching && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-indigo-900 dark:text-indigo-300">All Lore Entries</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loreEntries.map((entry) => renderLoreEntry(entry))}
              </div>
            </div>
          )}
        </>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-300">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this entry?</p>
            <div className="flex justify-end gap-4">
              <motion.button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Yes, Delete
              </motion.button>
              <motion.button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    <div ref={bottomRef} />
  </div>
);
};

export default TungraDashboard;