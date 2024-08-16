import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoreEntry = () => {
  const [entry, setEntry] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        const response = await fetch(`/api/lore/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }});
        const data = await response.json();
        setEntry(data);
      } catch (error) {
        console.error('Error fetching lore entry:', error);
      }
    };
    fetchEntry();
  }, [id]);

  if (!entry) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{entry.original_title}</h1>
      <p className="mb-4">{entry.original_description}</p>
      <p className="text-sm text-gray-500 mb-4">
        Added by: {entry.writer} on {new Date(entry.timestamp).toLocaleString()}
      </p>
      <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default LoreEntry;