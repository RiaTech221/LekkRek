@
const fs = require("fs");
let lines = fs.readFileSync("frontend/src/pages/admin/Settings.jsx", "utf8").split("\n");

const newContent = `
        {/* TEXTES WHATSAPP */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full mt-6">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-green-50 text-green-600 p-1.5 rounded-md">💬</span> Textes WhatsApp (Modèles)
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Salutation</label>
              <input type="text" name="whatsappMessageGreeting" value={settings.whatsappMessageGreeting || ""} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Par défaut</label>
              <input type="text" name="whatsappMessageDefault" value={settings.whatsappMessageDefault || ""} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Panier en cours (utiliser {count} et {total})</label>
              <textarea name="whatsappMessageCart" value={settings.whatsappMessageCart || ""} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Suivi Commande (utiliser {orderNumber})</label>
              <textarea name="whatsappMessageOrder" value={settings.whatsappMessageOrder || ""} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="2" />
            </div>
          </div>
        </div>
`;

lines.splice(157, 0, newContent);
fs.writeFileSync("frontend/src/pages/admin/Settings.jsx", lines.join("\n"), "utf8");
@
