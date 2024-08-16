// File: routes/aiSearch.js

import express from 'express';
import axios from 'axios';
import Lore from '../models/Lore.js';  // Adjust the import path as needed
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2",
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

router.post('/ai-search', async (req, res) => {
    try {
      const { query } = req.body;
      
      const queryEmbedding = await generateEmbedding(query);
  
      const relevantLore = await Lore.aggregate([
        {
          $vectorSearch: {
            index: "DndSemanticSearch",
            path: "plot_embedding_hf",
            queryVector: queryEmbedding,
            numCandidates: 150,
            limit: 5
          }
        },
        {
          $project: {
            original_title: 1,
            original_description: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ]);
  
      const context = relevantLore.map(entry => 
        `${entry.original_title}: ${entry.original_description.substring(0, 500)}...`
      ).join('\n\n');
  
      const aiResponse = await axios.post('https://api.anthropic.com/v1/messages', {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1500,
        temperature: 0.2,
        system: "You are an AI assistant for my Dungeons and Dragons campaign, named Tungra, lore archive. Answer questions based on the provided lore context. Only give the answer. Spice up the answer with some lore flavor.",
        messages: [
          { role: "user", content: `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer the question based on the provided lore context. If the answer is not in the lore, say so.` }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });
  
      res.json({ answer: aiResponse.data.content[0].text });
    } catch (error) {
      console.error('Error in AI search:', error.response?.data || error.message);
      res.status(500).json({ error: 'An error occurred while processing your question. Please try again.' });
    }
  });
  
  export default router;