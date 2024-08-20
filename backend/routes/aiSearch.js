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

// Helper function to truncate context
function truncateContext(context, maxLength = 4000) {
  if (context.length <= maxLength) return context;
  return context.substring(0, maxLength) + "... (truncated)";
}

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // console.log('Generated embedding:', queryEmbedding); // Debugging

    // Use combined text and vector search to find relevant lore entries
    const relevantLore = await Lore.aggregate([
      {
        $search: {
          index: "DndSemanticSearch", // Make sure this matches your actual index name
          compound: {
            should: [
              {
                text: {
                  query: query,
                  path: ["original_title", "original_description"],
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 3
                  }
                }
              },
              {
                moreLikeThis: {
                  like: {
                    "plot_embedding_hf": queryEmbedding
                  }
                }
              }
            ]
          }
        }
      },
      {
        $limit: 5 // Limit to top 5 most relevant entries
      },
      {
        $project: {
          original_title: 1,
          original_description: 1,
          score: { $meta: "searchScore" }
        }
      }
    ]);

    // console.log('Raw results:', relevantLore); // Debugging

    // Prepare context from relevant lore
    let context = relevantLore.map(entry => 
      `${entry.original_title}: ${entry.original_description}`
    ).join('\n\n');

    // Truncate context if it's too long
    context = truncateContext(context);

    // Query the AI with the relevant context
    const aiResponse = await axios.post('https://api.anthropic.com/v1/messages', {
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 3000,
      temperature: 0.2,
      system: "You are an AI assistant for a Dungeons and Dragons lore archive for my campaign called Tungra. Answer questions based on the provided lore context. If the answer is not in the lore, please use context clues from the lore to make an educated guess. Do not start with disclaimers. Limit your response to a maximum of 3 paragraphs.",
      messages: [
        { role: "user", content: `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer questions based on the provided lore context. If the answer is not in the lore, please use context clues from the lore to make an educated guess. Do not start with disclaimers. Limit your response to a maximum of 3 paragraphs.` }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    // Extract the AI's response
    let answer = aiResponse.data.content[0].text;

    // Limit the response to 3 paragraphs if it exceeds that
    const paragraphs = answer.split('\n\n');
    if (paragraphs.length > 3) {
      answer = paragraphs.slice(0, 3).join('\n\n');
    }

    res.json({ answer });
  } catch (error) {
    console.error('Error in AI search:', error);
    let errorMessage = 'An error occurred while processing your question.';
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage += ` Details: ${error.response.data.error.message}`;
    }
    res.status(500).json({ error: errorMessage });
  }
});

  export default router;