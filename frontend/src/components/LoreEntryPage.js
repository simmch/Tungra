import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

const LoreEntryPage = () => {
  const [entry, setEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
// chris code
  useEffect(() => {
    fetchLoreEntry();
  }, [id]);

  const fetchLoreEntry = async () => {
    try {
      const response = await fetch(`/api/lore/${id}`);
      const data = await response.json();
      setEntry(data);
      setEditTitle(data.original_title);
      setEditDescription(data.original_description);
    } catch (error) {
      console.error('Error fetching lore entry:', error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/lore/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (response.ok) {
        setIsEditing(false);
        fetchLoreEntry();
      }
    } catch (error) {
      console.error('Error updating lore entry:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/lore/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting lore entry:', error);
    }
  };

  const formatText = (text) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };

  if (!entry) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <motion.button
            onClick={() => navigate('/')}
            className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Dashboard
          </motion.button>

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); setShowEditModal(true); }} className="space-y-6">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={10}
              />
              <div className="flex gap-4">
                <motion.button 
                  type="submit" 
                  className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Changes
                </motion.button>
                <motion.button 
                  onClick={() => setIsEditing(false)} 
                  className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-6 text-indigo-900 dark:text-indigo-300">{entry.original_title}</h1>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {formatText(entry.original_description)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Added by: {entry.writer} on {new Date(entry.timestamp).toLocaleString()}
              </p>
              <div className="mt-8 flex gap-4">
                <motion.button 
                  onClick={() => setIsEditing(true)} 
                  className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.button>
                <motion.button 
                  onClick={() => setShowDeleteModal(true)} 
                  className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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

      
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-300">Confirm Changes</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to save these changes?</p>
            <div className="flex justify-end gap-4">
              <motion.button 
                onClick={() => { handleEdit(); setShowEditModal(false); }} 
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Yes, Save Changes
              </motion.button>
              <motion.button 
                onClick={() => setShowEditModal(false)} 
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
  );
};

export default LoreEntryPage;