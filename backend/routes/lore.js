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

router.get('/', async (req, res) => {
  try {
    const loreEntries = await Lore.find();
    res.json(loreEntries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lore entries', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, writer } = req.body;
    const newLore = new Lore({
      original_title: title,
      original_description: description,
      writer,
      timestamp: new Date(),
      title: title.replace(/\s/g, ''),
      description: description.replace(/\s/g, ''),
    });

    await newLore.save();

    // Generate and save embedding
    const embedding = await generateEmbedding(title);
    newLore.plot_embedding_hf = embedding;
    await newLore.save();

    res.status(201).json({ message: 'Lore added successfully', lore: newLore });
  } catch (error) {
    res.status(500).json({ message: 'Error adding lore entry', error: error.message });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    const embedding = await generateEmbedding(query);

    const results = await Lore.aggregate([
      {
        $vectorSearch: {
          queryVector: embedding,
          path: "plot_embedding_hf",
          numCandidates: 100,
          limit: 10,
          index: "DndSemanticSearch",
        }
      }
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error performing search', error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedLore = await Lore.findByIdAndDelete(req.params.id);
    if (!deletedLore) {
      return res.status(404).json({ message: 'Lore entry not found' });
    }
    res.json({ message: 'Lore entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lore entry', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const updatedLore = await Lore.findByIdAndUpdate(
      req.params.id,
      {
        original_title: title,
        original_description: description,
        title: title.replace(/\s/g, ''),
        description: description.replace(/\s/g, ''),
      },
      { new: true }
    );
    if (!updatedLore) {
      return res.status(404).json({ message: 'Lore entry not found' });
    }
    res.json(updatedLore);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lore entry', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const loreEntry = await Lore.findById(req.params.id);
    if (!loreEntry) {
      return res.status(404).json({ message: 'Lore entry not found' });
    }
    res.json(loreEntry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lore entry', error: error.message });
  }
});


router.post('/ai-search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Use vector search to find relevant lore entries
    const relevantLore = await Lore.aggregate([
      {
        $vectorSearch: {
          index: "DndSemanticSearch",
          path: "plot_embedding_hf",
          queryVector: queryEmbedding,
          numCandidates: 100,
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

    // Prepare context from relevant lore
    const context = relevantLore.map(entry => 
      `${entry.original_title}: ${entry.original_description}`
    ).join('\n\n');

    // Query the AI with the relevant context
    const aiResponse = await axios.post('https://api.anthropic.com/v1/messages', {
      model: "claude-2.1",
      max_tokens: 1000,
      temperature: 0.2,
      system: "You are an AI assistant for a Dungeons and Dragons lore archive. Answer questions based on the provided lore context.",
      messages: [
        { role: "user", content: `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer the question based on the provided lore context. If the answer is not in the lore, say so.` }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY
      }
    });

    res.json({ answer: aiResponse.data.content[0].text });
  } catch (error) {
    console.error('Error in AI search:', error);
    res.status(500).json({ error: 'An error occurred while processing your question.' });
  }
});

export default router;