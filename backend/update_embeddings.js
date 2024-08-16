import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import Lore from './models/Lore.js';  // Adjust the path as needed

dotenv.config();

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2";

async function generateEmbedding(text) {
  try {
    const response = await axios.post(HUGGINGFACE_API_URL, { inputs: text }, {
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function updateEmbeddings() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const loreEntries = await Lore.find({});
    console.log(`Found ${loreEntries.length} lore entries`);

    for (const entry of loreEntries) {
      console.log(`Updating embedding for entry: ${entry._id}`);
      const newEmbedding = await generateEmbedding(entry.original_title + ": " + entry.original_description);
      entry.plot_embedding_hf = newEmbedding;
      await entry.save();
    }

    console.log('All embeddings updated successfully');
  } catch (error) {
    console.error('Error updating embeddings:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateEmbeddings();