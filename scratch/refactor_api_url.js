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
  let originalContent = content;

  // Replace literal string template: `http://192.168.1.4:8080/api/v1/...`
  content = content.replace(/`http:\/\/192\.168\.1\.4:8080\/api\/v1\//g, '`${API_BASE_URL}/');
  
  // Replace standard string: 'http://192.168.1.4:8080/api/v1/...'
  content = content.replace(/'http:\/\/192\.168\.1\.4:8080\/api\/v1\//g, '`${API_BASE_URL}/');
  // Need to be careful: if we replaced single quotes with backticks inside a normal fetch('...', config) 
  // wait, the above line replaces `'http://.../api/v1/` with ``${API_BASE_URL}/`. But the string still ends with a single quote!
  // e.g. fetch('http://.../api/v1/users') -> fetch(`${API_BASE_URL}/users') -> Syntax error!
  
  // Better regex for standard string replacements:
  content = content.replace(/'http:\/\/192\.168\.1\.4:8080\/api\/v1\/([^']*)'/g, '`${API_BASE_URL}/$1`');
  
  // Also for double quotes:
  content = content.replace(/"http:\/\/192\.168\.1\.4:8080\/api\/v1\/([^"]*)"/g, '`${API_BASE_URL}/$1`');

  if (content !== originalContent) {
    // Add import statement at the top
    // Figure out relative path to config.js based on current file depth
    const depth = f.split(path.sep).length - 3; // frontend/src/ is depth 0
    const relativePath = depth > 0 ? '../'.repeat(depth) + 'config' : './config';
    
    // insert after the last import statement, or at the top
    if (!content.includes('API_BASE_URL')) {
      const importLines = content.match(/^import .*$/gm);
      const importStatement = `import { API_BASE_URL } from '${relativePath}';\n`;
      if (importLines && importLines.length > 0) {
        const lastImport = importLines[importLines.length - 1];
        content = content.replace(lastImport, lastImport + '\n' + importStatement);
      } else {
        content = importStatement + '\n' + content;
      }
    }

    fs.writeFileSync(f, content);
    changedCount++;
  }
});

console.log('Updated ' + changedCount + ' files to use API_BASE_URL.');
