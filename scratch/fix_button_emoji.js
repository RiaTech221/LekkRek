const fs = require('fs');
const file = 'frontend/src/pages/admin/Settings.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/{loading \? '\.\.\.' : '\?\? Enregistrer les modifications'}/, '{loading ? \\\'...\\\' : \\\'💾 Enregistrer les modifications\\\'}'.replace(/\\\\'/g, "'").replace(/\\'/g, "'"));

fs.writeFileSync(file, content, 'utf8');
