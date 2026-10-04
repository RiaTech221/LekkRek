const fs = require('fs');
const files = [
  'frontend/src/pages/client/ClientView.jsx',
  'frontend/src/pages/client/MobileClientView.jsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/if \(!formData\.clientAddress \|\| formData\.clientAddress\.trim\(\)\.length < 5\) \{/g, "if (formData.type === 'LIVRAISON' && (!formData.clientAddress || formData.clientAddress.trim().length < 5)) {");
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed ' + file);
});
