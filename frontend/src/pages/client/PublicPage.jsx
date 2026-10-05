import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

/**
 * ============================================================================
 * 📁 Fichier : PublicPage.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour PublicPage.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function PublicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/pages/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Page introuvable');
        return res.json();
      })
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPage(null);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER SIMPLIFIÉ */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-red-600 tracking-tighter">
            Lekk<span className="text-gray-900">Rek</span>.
          </Link>
          <Link to="/" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* CONTENU DE LA PAGE */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : !page || !page.content ? (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page en construction</h1>
            <p className="text-gray-500">Le contenu de cette page sera bientôt disponible.</p>
          </div>
        ) : (
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 pb-8 border-b border-gray-100">
              {page.title}
            </h1>
            
            {/* Contenu généré par le WYSIWYG (ReactQuill) - Sécurisé par DOMPurify */}
            <div 
              className="prose prose-red max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content || '') }}
            />
          </article>
        )}
      </main>

      {/* FOOTER SIMPLIFIÉ */}
      <footer className="bg-gray-900 text-white py-8 text-center text-sm">
        <p className="text-gray-400">© {new Date().getFullYear()} LekkRek. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
