import mongoose from 'mongoose';

const loreSchema = new mongoose.Schema({
  original_title: String,
  original_description: String,
  writer: String,
  timestamp: Date,
  title: String,
  description: String,
  plot_embedding_hf: [Number]
}, { collection: 'lore' }); // Explicitly specify the collection name

export default mongoose.model('Lore', loreSchema);