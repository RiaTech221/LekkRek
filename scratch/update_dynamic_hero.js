const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // We are looking for the hero title and subtitle block
  const oldTitleRegex = /<h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight max-w-2xl">[\s\S]*?<\/h2>/;
  const newTitleBlock = `<h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight max-w-2xl whitespace-pre-line" dangerouslySetInnerHTML={{ __html: platformSettings?.heroTitle || 'Les menus du jour<br/>à Ziguinchor.' }}></h2>`;
  
  const oldDescRegex = /<p className="text-xl text-gray-200 max-w-xl mb-10 font-medium[^>]*>[\s\S]*?<\/p>/;
  const newDescBlock = `<p className="text-xl text-gray-200 max-w-xl mb-10 font-medium leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: platformSettings?.heroSubtitle || 'Qui a cuisiné quoi, à quel prix, où le trouver.<br/>Publié du lundi au samedi à 10h30.<br/>Ce qu\\'il reste à 13h30.' }}></p>`;

  content = content.replace(oldTitleRegex, newTitleBlock);
  content = content.replace(oldDescRegex, newDescBlock);

  fs.writeFileSync(file, content);
}

updateFile('frontend/src/pages/client/ClientView.jsx');
updateFile('frontend/src/pages/client/MobileClientView.jsx');
