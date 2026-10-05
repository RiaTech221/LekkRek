const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src');
let changedCount = 0;

files.forEach(f => {
  if (f.endsWith('config.js') || f.endsWith('main.jsx')) return;
  
  let content = fs.readFileSync(f, 'utf8');
  let orig = content;
  
  // Also check if `import { API_BASE_URL }` is added at the top
  if (!content.includes('import { API_BASE_URL }')) {
     const depth = f.split(path.sep).length - 3;
     const relativePath = depth > 0 ? '../'.repeat(depth) + 'config' : './config';
     content = `import { API_BASE_URL } from '${relativePath}';\n` + content;
  }
  
  // We messed up previously by replacing the first part. Let's fix the trailing quotes.
  // Look for: `${API_BASE_URL}/some/path'
  // Or: `${API_BASE_URL}/some/path"
  // And change it to: `${API_BASE_URL}/some/path`
  
  // Note: we can find `${API_BASE_URL}` followed by anything but a quote, followed by a quote.
  content = content.replace(/(`\$\{API_BASE_URL\}[^'"\s\n]*)(['"])/g, '$1`');

  if (content !== orig) {
    fs.writeFileSync(f, content);
    changedCount++;
  }
});

console.log('Fixed syntax in ' + changedCount + ' files.');
