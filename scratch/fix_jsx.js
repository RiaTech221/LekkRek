const fs = require('fs');
const file = 'frontend/src/pages/admin/MenuManager.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<<<<<<< HEAD
                          const token = localStorage.getItem('token');
                          fetch('http://192.168.1.6:8080/api/v1/upload', {
=======
                          fetch(\`\${API_URL}/api/v1/upload\`, {
>>>>>>> develop`;

const replacement = `                          const token = localStorage.getItem('token');
                          fetch(\`\${API_URL}/api/v1/upload\`, {`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
