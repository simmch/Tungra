import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '..', 'frontend', 'build');
const destination = path.join(__dirname, 'build');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      copyDir(srcPath, destPath) :
      fs.copyFileSync(srcPath, destPath);
  }
}

try {
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true });
  }
  copyDir(source, destination);
  console.log('Build folder moved successfully!');
} catch (err) {
  console.error('Error moving build folder:', err);
}