const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/admin/Settings.jsx', 'utf8');

const newSection =         </div>
        </div>

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
              <input type="text" name="whatsappMessageGreeting" value={settings.whatsappMessageGreeting || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Par défaut (Rien dans le panier)</label>
              <input type="text" name="whatsappMessageDefault" value={settings.whatsappMessageDefault || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Panier en cours (Variables: {\, \})</label>
              <textarea name="whatsappMessageCart" value={settings.whatsappMessageCart || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="3" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Suivi Commande (Variables: {\})</label>
              <textarea name="whatsappMessageOrder" value={settings.whatsappMessageOrder || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="3" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50">
            {loading ? '...' : '💾 Enregistrer les réglages'}
          </button>
        </div>
      </form>;

content = content.replace(/<\/div>\s*<\/div>\s*<div className="flex justify-end">\s*<button type="submit"[^>]*>[\s\S]*?<\/button>\s*<\/div>\s*<\/form>/, newSection);
fs.writeFileSync('frontend/src/pages/admin/Settings.jsx', content, 'utf8');
