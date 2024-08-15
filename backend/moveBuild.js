import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '..', 'frontend', 'build');
const destination = path.join(__dirname, 'build');

fs.move(source, destination, { overwrite: true })
  .then(() => console.log('Build folder moved successfully!'))
  .catch((err) => console.error(err));