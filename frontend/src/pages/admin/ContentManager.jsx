import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';

/**
 * ============================================================================
 * 📁 Fichier : ContentManager.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour ContentManager.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */

import 'react-quill/dist/quill.snow.css';

export default function ContentManager() {
  const [selectedSlug, setSelectedSlug] = useState('about');
  const [title, setTitle] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [content, setContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const pages = [
    { value: 'about', label: '📄 Page : À propos' },
    { value: 'terms', label: '⚖️ Page : Conditions Générales' },
    { value: 'privacy', label: '🔒 Page : Confidentialité' },
    { value: 'cookies', label: '🍪 Page : Politique de Cookies' },
    { value: 'team', label: '👥 Bloc : Équipe' }
  ];

  const fetchPageContent = async (slug) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/pages/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title || '');
        setSeoKeywords(data.seoKeywords || '');
        setContent(data.content || '');
      } else {
        setTitle('');
        setSeoKeywords('');
        setContent('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent(selectedSlug);
    setMessage({ text: '', type: '' });
  }, [selectedSlug]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8080/api/v1/pages/${selectedSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, seoKeywords, content })
      });

      if (response.ok) {
        setMessage({ text: '✅ Page sauvegardée avec succès !', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: '❌ Erreur lors de la sauvegarde.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '❌ Impossible de contacter le serveur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessage({ text: '⏳ Extraction du texte en cours (PDF/Word)...', type: 'info' });

    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/documents/parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setContent(prev => prev + (prev ? '<br/><br/>' : '') + data.text);
          setMessage({ text: '✅ Texte extrait et ajouté à l\'éditeur !', type: 'success' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } else {
          setMessage({ text: '❌ ' + data.message, type: 'error' });
        }
      } else {
        setMessage({ text: '❌ Erreur lors de l\'extraction du document.', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: '❌ Impossible de contacter le serveur pour l\'extraction.', type: 'error' });
    } finally {
      setIsUploading(false);
      e.target.value = null; // reset
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto" style={{ background: '#f9fafb' }}>
      <header className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <span className="text-red-600">📝</span> Éditeur Visuel (CMS)
        </h2>
        <p className="text-gray-500 text-sm mt-2 font-medium">Gérez le contenu des pages publiques et extrayez du texte depuis vos documents Word ou PDF.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Barre du haut */}
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sélectionner la page</label>
            <select 
              value={selectedSlug} 
              onChange={e => setSelectedSlug(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
            >
              {pages.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <input 
              type="file" 
              accept=".txt,.pdf,.doc,.docx" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm disabled:opacity-50"
            >
              <span className="text-lg">📄</span> 
              {isUploading ? 'Extraction...' : 'Importer Word / PDF'}
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading || isUploading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 transition-all text-sm disabled:opacity-50"
            >
              {loading && !isUploading ? 'Sauvegarde...' : '💾 Enregistrer'}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`mx-6 mt-6 p-4 rounded-xl font-medium text-sm flex items-center gap-3 \${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Champs de saisie */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Titre de la page</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Politique de confidentialité"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mots-clés SEO (Optionnel)</label>
              <input 
                type="text" 
                value={seoKeywords} 
                onChange={e => setSeoKeywords(e.target.value)}
                placeholder="Ex: cgu, juridique, lekk rek..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between items-end">
              <span>Contenu Riche</span>
              <span className="text-gray-400 normal-case font-normal">Saisissez ou formatez le texte, l'import Word/PDF l'ajoute ici.</span>
            </label>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                className="border-none"
                style={{ height: '400px' }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
