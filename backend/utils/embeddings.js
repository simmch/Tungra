import fetch from 'node-fetch';

export async function generateEmbedding(text) {
  const response = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}