const fs = require('fs');
const file = 'frontend/src/pages/client/ClientView.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldTitle = /Vos plats pr[éǸ]f[éǸ]r[éǸ]s,<br\/>livr[éǸ]s tr[è]s vite\./;
const newTitle = 'Les menus du jour<br/>à Ziguinchor.';

const oldDesc = /D[éǸ]couvrez les meilleurs restaurants de la r[éǸ]gion\. Commandez en quelques clics et suivez votre livreur en temps r[éǸ]el\./;
const newDesc = `Qui a cuisiné quoi, à quel prix, où le trouver.<br/>Publié du lundi au samedi à 10h30.<br/>Ce qu'il reste à 13h30.`;

content = content.replace(oldTitle, newTitle);
content = content.replace(oldDesc, newDesc);

fs.writeFileSync(file, content);
