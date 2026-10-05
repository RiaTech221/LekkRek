const fs = require('fs');
const file = 'frontend/src/pages/admin/MenuManager.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<<<<<<< HEAD[\s\S]*?const token = localStorage\.getItem\('token'\);[\s\S]*?fetch\('http:\/\/192\.168\.1\.6:8080\/api\/v1\/upload', \{[\s\S]*?=======[\s\S]*?fetch\(`\$\{API_URL\}\/api\/v1\/upload`, \{[\s\S]*?>>>>>>> develop/, "const token = localStorage.getItem('token');\n                          fetch(`${API_URL}/api/v1/upload`, {");

fs.writeFileSync(file, content);
