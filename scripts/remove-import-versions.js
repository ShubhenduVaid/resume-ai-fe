const fs = require('fs');
const path = require('path');

// Directory to search recursively (search client source only)
const SRC_DIR = path.join(__dirname, '..', 'src');

// File extensions to process
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Regex to match imports with @version, e.g. lucide-react@0.487.0 or @radix-ui/react-slot@1.1.2
const importRegex = /(['"])(@?[^'"@\s]+(?:\/[\w-]+)*?)@\d+\.[\d.]+(['"])/g;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(importRegex, '$1$2$3');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

walkDir(SRC_DIR);
console.log('Done.');
