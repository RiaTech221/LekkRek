const fs = require('fs');
const file = 'frontend/src/pages/admin/Settings.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add default values to initial state
content = content.replace(
  /whatsappMessageDefault: "j'aimerais avoir de plus amples informations s'il vous pla(.*)t."/,
  `whatsappMessageDefault: "j'aimerais avoir de plus amples informations s'il vous pla$1t.",
    heroTitle: "Les menus du jour à Ziguinchor.",
    heroSubtitle: "Qui cuisine quoi aujourd'hui, à quel prix et où le trouver. Menus publiés du lundi au samedi dès 10H30."`
);

// Add the section UI
const newSection = `
        {/* CONTENU PAGE D'ACCUEIL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full mt-6">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-blue-50 text-blue-600 p-1.5 rounded-md">🏠</span> Textes d'Accueil
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Titre principal</label>
              <input type="text" name="heroTitle" value={settings.heroTitle || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Sous-titre (Description)</label>
              <textarea name="heroSubtitle" value={settings.heroSubtitle || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="3" />
            </div>
          </div>
        </div>
`;

content = content.replace('{/* TEXTES WHATSAPP */}', newSection + '\n        {/* TEXTES WHATSAPP */}');

fs.writeFileSync(file, content);
