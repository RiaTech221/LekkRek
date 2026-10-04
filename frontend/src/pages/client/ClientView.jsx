import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * ============================================================================
 * 📁 Fichier : ClientView.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour ClientView.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */

import '../../index.css';

export default function ClientView() {
  const [platformSettings, setPlatformSettings] = useState(null);
  const [plats, setPlats] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // All categories loaded once
  const [allPlats, setAllPlats] = useState([]); // All plats for fallbacks
  const [recommendations, setRecommendations] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isSuccessOpen, setSuccessOpen] = useState(false);
  
  // Filtres
  const [keyword, setKeyword] = useState('');
  const [resto, setResto] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [quartier, setQuartier] = useState('');
  const [momentFilter, setMomentFilter] = useState('');
  
  // Checkout form state
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('lekkrek_client_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { clientName: parsed.name || '', clientPhone: parsed.phone || '', clientAddress: parsed.address || '', type: 'LIVRAISON', paymentMethod: 'WAVE' };
      } catch (e) {}
    }
    return { clientName: '', clientPhone: '', clientAddress: '', type: 'LIVRAISON', paymentMethod: 'WAVE' };
  });
  const [orderInfo, setOrderInfo] = useState(null);

  // States pour le suivi
  const [isTrackModalOpen, setTrackModalOpen] = useState(false);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  
  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop"
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [trackError, setTrackError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [isLoginOpen, setLoginOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');

  const openLoginModal = () => {
    setLoginPhone(formData.clientPhone || '');
    setLoginName(formData.clientName || '');
    setLoginOpen(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!/^(77|78|76|75|70|33)\d{7}$/.test(loginPhone.replace(/\s/g, ''))) {
      return alert("Numéro de téléphone invalide.");
    }
    const cleanPhone = loginPhone.replace(/\s/g, '');
    localStorage.setItem('lekkrek_client_profile', JSON.stringify({ 
      name: loginName || formData.clientName, 
      phone: cleanPhone, 
      address: formData.clientAddress 
    }));
    setFormData(prev => ({ ...prev, clientPhone: cleanPhone, clientName: loginName || prev.clientName }));
    
    // Refresh recommendations
    fetch(`http://192.168.1.6:8080/api/v1/public/menu/recommendations?phone=${cleanPhone}`)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error(err));
      
    setLoginOpen(false);
    if (formData.clientPhone) {
      alert("Profil mis à jour !");
    } else {
      alert("Connecté avec succès ! Vos favoris ont été chargés.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lekkrek_client_profile');
    setFormData(prev => ({ ...prev, clientPhone: '', clientName: '' }));
    setRecommendations([]);
    setLoginOpen(false);
    alert("Vous êtes déconnecté.");
  };

  
    
  const handleWhatsappClick = (e) => {
    e.preventDefault();

    let message = platformSettings?.whatsappMessageGreeting || "Bonjour l'équipe LekkRek 👋, ";
    if (formData.clientName && formData.clientName.trim() !== '') {
      message += "je suis " + formData.clientName + ". ";
    }
    
    if (trackOrderNumber && trackOrderNumber.trim() !== '') {
      const orderTpl = platformSettings?.whatsappMessageOrder || "Je vous contacte concernant ma commande N° {orderNumber}.";
      message += orderTpl.replace('{orderNumber}', trackOrderNumber) + " ";
    } else if (cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const cartTpl = platformSettings?.whatsappMessageCart || "J'ai actuellement {count} plat(s) dans mon panier pour un total de {total} FCFA et j'aimerais avoir de l'aide pour finaliser ma commande.";
      message += cartTpl.replace('{count}', cart.length).replace('{total}', total) + " ";
    } else {
      const defTpl = platformSettings?.whatsappMessageDefault || "j'aimerais avoir de plus amples informations s'il vous plaît.";
      message += defTpl;
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/221781161910?text=${encodedMessage}`;

    fetch('http://192.168.1.6:8080/api/v1/public/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'click_whatsapp', entityId: '781161910', context: 'floating_button' })
    }).catch(err => console.error(err)).finally(() => {
      window.open(waUrl, '_blank');
    });
  };

  


  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch ALL plats once to build the full category list (independent of filters)
  useEffect(() => {
    fetch('http://192.168.1.6:8080/api/v1/public/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllPlats(data);
          const cats = [...new Set(data.map(p => p.moment).filter(Boolean))].sort();
          setAllCategories(cats);
          localStorage.setItem('lekkrek_cache_cats', JSON.stringify(cats));
        }
      })
      .catch(err => {
        console.error('Erreur categories:', err);
        const cachedCats = localStorage.getItem('lekkrek_cache_cats');
        if (cachedCats) setAllCategories(JSON.parse(cachedCats));
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('lekkrek_client_profile');
    let phone = '';
    if (saved) {
      try { phone = JSON.parse(saved).phone || ''; } catch (e) {}
    }
    fetch(`http://192.168.1.6:8080/api/v1/public/menu/recommendations?phone=${phone}`)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error(err));
  }, []);

  // Recharge les plats dès qu'un filtre change
  useEffect(() => {
    // 1. Fetch settings
    fetch('http://192.168.1.6:8080/api/v1/settings')
      .then(res => res.json())
      .then(data => setPlatformSettings(data))
      .catch(err => console.error("Erreur Settings:", err));

    // 2. Fetch plats
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (resto) params.append('resto', resto);
    if (budgetMax) params.append('budgetMax', budgetMax);
    if (quartier) params.append('quartier', quartier);
    if (momentFilter) params.append('moment', momentFilter);

    fetch(`http://192.168.1.6:8080/api/v1/public/menu?${params.toString()}`)
      .then(res => res.json())
      .then(data => setPlats(data))
      .catch(err => console.error("Erreur API:", err));
  }, [keyword, resto, budgetMax, quartier, momentFilter]);

  // Analytics logging (debounced)
  useEffect(() => {
    if (!keyword || keyword.length < 3) return;
    const timeoutId = setTimeout(() => {
      fetch('http://192.168.1.6:8080/api/v1/public/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'search', entityId: keyword, context: 'search_bar' })
      }).catch(console.error);
    }, 1500); // Wait 1.5 seconds after typing stops before logging
    return () => clearTimeout(timeoutId);
  }, [keyword]);

  const addToCart = (plat) => setCart([...cart, plat]);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Panier vide !");
    
    // Contrôles de saisie (Validation)
    const phoneRegex = /^(77|78|76|75|70|33)\d{7}$/;
    if (!formData.clientName || formData.clientName.trim().length < 2) {
      return alert("Veuillez saisir un nom valide.");
    }
    if (!phoneRegex.test(formData.clientPhone.replace(/\s/g, ''))) {
      return alert("Numéro de téléphone invalide. Ex: 771234567");
    }
    if (formData.type === 'LIVRAISON' && (!formData.clientAddress || formData.clientAddress.trim().length < 5)) {
      return alert("Veuillez saisir une adresse de livraison plus précise.");
    }

    const processOrder = () => {
      const orderRequest = {
        ...formData,
        clientPhone: formData.clientPhone.replace(/\s/g, ''),
        platIds: cart.map(p => p.id)
      };

      fetch('http://192.168.1.6:8080/api/v1/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest)
      })
      .then(res => {
        if (!res.ok) throw new Error("Erreur serveur lors de la commande.");
        return res.json();
      })
      .then(data => {
        localStorage.setItem('lekkrek_client_profile', JSON.stringify({ 
          name: formData.clientName, 
          phone: formData.clientPhone, 
          address: formData.clientAddress 
        }));
        setOrderInfo(data);
        setCart([]);
        setCheckoutOpen(false);
        setIsProcessingPayment(false);
        setSuccessOpen(true);
      })
      .catch(err => {
        alert(err.message);
        setIsProcessingPayment(false);
      });
    };

    // Simulation de paiement fictif
    if (formData.paymentMethod === 'WAVE' || formData.paymentMethod === 'ORANGE_MONEY' || formData.paymentMethod === 'SAMIR_PAY') {
      setIsProcessingPayment(true);
      // Faux délai pour simuler l'API de paiement
      setTimeout(() => {
        processOrder();
      }, 2000);
    } else {
      processOrder();
    }
  };

  // PARTNER REQUEST MODAL
  const [isPartnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ nomRestaurant: '', nomContact: '', telephone: '', ville: '' });
  const [partnerStatus, setPartnerStatus] = useState('');

  const handlePartnerSubmit = (e) => {
    e.preventDefault();

    const phoneRegex = /^(77|78|76|75|70|33)\d{7}$/;
    if (!partnerForm.nomRestaurant || partnerForm.nomRestaurant.trim().length < 2) {
      return alert("Le nom du restaurant doit contenir au moins 2 caractères.");
    }
    if (!partnerForm.nomContact || partnerForm.nomContact.trim().length < 2) {
      return alert("Votre nom doit contenir au moins 2 caractères.");
    }
    if (!phoneRegex.test(partnerForm.telephone.replace(/\s/g, ''))) {
      return alert("Numéro de téléphone invalide. Ex: 771234567");
    }
    if (!partnerForm.ville || partnerForm.ville.trim().length < 3) {
      return alert("La ville/quartier doit contenir au moins 3 caractères.");
    }

    setPartnerStatus('loading');
    fetch('http://192.168.1.6:8080/api/v1/public/partner-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnerForm)
    })
    .then(res => {
      if (res.ok) {
        setPartnerStatus('success');
        setTimeout(() => {
          setPartnerModalOpen(false);
          setPartnerStatus('');
          setPartnerForm({ nomRestaurant: '', nomContact: '', telephone: '', ville: '' });
        }, 3000);
      } else {
        setPartnerStatus('error');
      }
    })
    .catch(() => setPartnerStatus('error'));
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackResult(null);

    fetch(`http://192.168.1.6:8080/api/v1/public/orders/track/${trackOrderNumber}`)
      .then(res => {
        if (res.status === 404) throw new Error("Commande introuvable.");
        if (!res.ok) throw new Error("Erreur lors de la recherche.");
        return res.json();
      })
      .then(data => setTrackResult(data))
      .catch(err => setTrackError(err.message));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="w-full px-2 sm:px-4 lg:px-6 mx-auto">
          <div className="flex justify-between h-20 items-center gap-2">
            
            <img src="/logo.png" alt="LekkRek Logo" className="h-14 sm:h-16 w-auto object-contain shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            
            {/* BIG SEARCH BAR IN NAVBAR */}
            <div className="flex w-full max-w-[50rem] mx-2 lg:mx-6 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md items-center divide-x divide-gray-100 transition-all h-14 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              
              <div className="flex-[1.5] flex items-center pl-4 lg:pl-6 pr-3 h-full cursor-text hover:bg-gray-50 transition-colors shrink-0">
                <span className="text-gray-400 mr-2 text-sm lg:text-base shrink-0">🔍</span>
                <div className="flex flex-col w-full text-left justify-center overflow-hidden">
                  <span className="text-[10px] lg:text-[11px] uppercase tracking-wider font-bold text-gray-800 leading-tight">Quoi ?</span>
                  <input type="text" placeholder="Plat, ingrédient..." className="bg-transparent border-none outline-none w-full text-gray-500 font-medium text-xs lg:text-sm placeholder-gray-400 truncate leading-tight min-w-[70px]" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>
              </div>

              <div className="flex-1 flex items-center px-3 lg:px-5 h-full cursor-pointer hover:bg-gray-50 transition-colors shrink-0">
                <div className="flex flex-col w-full text-left justify-center overflow-hidden">
                  <span className="text-[10px] lg:text-[11px] uppercase tracking-wider font-bold text-gray-800 leading-tight">Restaurant</span>
                  <select className="bg-transparent border-none outline-none w-full text-gray-500 font-medium text-xs lg:text-sm appearance-none cursor-pointer truncate leading-tight min-w-[80px]" value={resto} onChange={(e) => setResto(e.target.value)}>
                    <option value="">Tous les restos</option>
                    {[...new Set(plats.map(p => p.restaurant?.name).filter(Boolean))].sort().map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 flex items-center px-3 lg:px-5 h-full cursor-text hover:bg-gray-50 transition-colors shrink-0">
                <div className="flex flex-col w-full text-left justify-center overflow-hidden">
                  <span className="text-[10px] lg:text-[11px] uppercase tracking-wider font-bold text-gray-800 leading-tight">Quartier</span>
                  <input type="text" placeholder="Où livrer ?" className="bg-transparent border-none outline-none w-full text-gray-500 font-medium text-xs lg:text-sm placeholder-gray-400 truncate leading-tight min-w-[60px]" value={quartier} onChange={(e) => setQuartier(e.target.value)} />
                </div>
              </div>

              <div className="flex-1 flex items-center px-3 lg:px-5 h-full cursor-text hover:bg-gray-50 transition-colors shrink-0">
                <div className="flex flex-col w-full text-left justify-center overflow-hidden">
                  <span className="text-[10px] lg:text-[11px] uppercase tracking-wider font-bold text-gray-800 leading-tight">Budget Max</span>
                  <input type="number" placeholder="ex: 2000" className="bg-transparent border-none outline-none w-full text-gray-500 font-medium text-xs lg:text-sm placeholder-gray-400 truncate leading-tight min-w-[60px]" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
                </div>
              </div>

            </div>

            <div className="flex gap-2 lg:gap-4 shrink-0 ml-auto">
              {localStorage.getItem('token') && (
                <button onClick={() => window.location.href='/dashboard'} className="hidden lg:flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-3 rounded-full font-bold transition-all border border-red-100 text-sm">
                  ⚙️ Dash
                </button>
              )}
              {formData.clientPhone ? (
                <button onClick={openLoginModal} className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold transition-all text-xs sm:text-sm" title="Mon Profil">
                  <span className="truncate max-w-[100px]">👋 {formData.clientName || 'Client'}</span>
                </button>
              ) : (
                <button onClick={openLoginModal} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold transition-all text-xs sm:text-sm shadow-sm">
                  👤 Se connecter
                </button>
              )}
              <button onClick={() => setTrackModalOpen(true)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold transition-all text-xs sm:text-sm">
                📍 Suivi
              </button>
              <button onClick={() => setCheckoutOpen(true)} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold transition-all shadow-md text-xs sm:text-sm">
                🛒 Panier <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">{cart.length}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      
      {/* OFFLINE BANNER */}
      {isOffline && (
        <div className="fixed top-20 left-0 w-full bg-red-600 text-white text-center py-2 text-sm font-bold z-40 shadow-md">
          ⚠️ Mode hors ligne : Vous consultez les données en cache. Ces offres peuvent être obsolètes.
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative bg-orange-50 overflow-hidden pt-20 group">
        <div className="absolute inset-0 bg-black">
          {heroImages.map((src, index) => (
            <img 
              key={src}
              src={src} 
              alt="Food Delivery" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-90' : 'opacity-0'}`} 
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>

        {/* Carousel Controls (Always Visible) */}
        <button 
          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-800 rounded-full p-2 lg:p-3 shadow-md transition-all z-20"
          aria-label="Image précédente"
        >
          <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button 
          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-800 rounded-full p-2 lg:p-3 shadow-md transition-all z-20"
          aria-label="Image suivante"
        >
          <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
        </button>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-start text-left pointer-events-none z-10">
          <span className="bg-red-600 text-white font-bold tracking-wider uppercase text-sm px-4 py-1.5 rounded-full mb-6 shadow-lg">Livraison partout à Ziguinchor</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight max-w-2xl whitespace-pre-line" dangerouslySetInnerHTML={{ __html: platformSettings?.heroTitle || 'Les menus du jour<br/>à Ziguinchor.' }}></h2>
          <p className="text-xl text-gray-200 max-w-xl mb-10 font-medium leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: platformSettings?.heroSubtitle || 'Qui a cuisiné quoi, à quel prix, où le trouver.<br/>Publié du lundi au samedi à 10h30.<br/>Ce qu\'il reste à 13h30.' }}></p>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentImageIndex ? 'bg-red-600 w-6' : 'bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>
      </div>
      
      {/* MENU GRID & FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* MOMENTS FILTER (Pills) */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 hide-scrollbar border-b border-gray-100">
          {/* Dynamic categories from ALL plats - never disappear when filtering */
          [{value:'', label:'🍴 Tout voir'}, ...(allCategories.map(cat => {
            const labels = { dejeuner: '🍽️ Déjeuner', gouter: '☕ Goûter', diner: '🍷 Dîner', 'fast food': '🍔 Fast food', boisson: '🍹 Cocktails & Jus', dessert: '🍰 Desserts' };
            return { value: cat, label: labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1) };
          }))].map(({ value, label }) => (
            <button 
              key={value}
              onClick={() => setMomentFilter(value)}
              className={`whitespace-nowrap px-6 py-2.5 mb-2 rounded-full font-bold shadow-sm border border-gray-200 transition-all transform hover:scale-105 ${momentFilter === value ? 'bg-red-600 text-white border-red-600 shadow-md scale-105' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-8">Au menu aujourd'hui</h3>
        
        {/* RECOMMENDATIONS SECTION */}
        {recommendations.length > 0 && !keyword && !resto && !quartier && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span>🌟</span> Recommandé pour vous
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {recommendations.map(plat => (
                <div key={`rec-${plat.id}`} className="bg-orange-50/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-100 group flex flex-col relative">
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">Favori</div>
                  <div className="relative h-40 overflow-hidden bg-gray-100 shrink-0">
                    <img src={plat.image?.replace('localhost', '192.168.1.6')} alt={plat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'; }} />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 truncate">{plat.name}</h3>
                    <p className="text-gray-500 text-xs mb-3 truncate">{plat.restaurant?.name}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-black text-red-600 text-lg">{plat.price} {platformSettings?.defaultCurrency || 'FCFA'}</span>
                      <button onClick={() => addToCart(plat)} disabled={plat.status !== 'DISPO'} className="w-10 h-10 bg-gray-900 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shadow-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-gray-200"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
          {Array.isArray(plats) && plats.length > 0 ? plats.map(plat => (
            <div key={plat.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
              <div className="relative h-56 overflow-hidden bg-gray-100 shrink-0">
                <img src={plat.image?.replace('localhost', '192.168.1.6')} alt={plat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'; }} />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full shadow-md backdrop-blur-md ${plat.status === 'DISPO' ? 'bg-white/90 text-green-600' : 'bg-red-600/90 text-white'}`}>
                    {plat.status === 'DISPO' ? 'Disponible' : 'Épuisé'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">🏪</span>
                  <span className="text-sm font-bold text-gray-500">{plat.restaurant?.name || 'Restaurant Partenaire'}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{plat.name}</h3>
                <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">{plat.description || 'Un délicieux plat préparé avec soin.'}</p>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-50">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prix</span>
                    <span className="text-2xl font-black text-gray-900">{plat.price.toLocaleString()} <span className="text-base text-gray-500">FCFA</span></span>
                  </div>
                  {plat.status === 'DISPO' ? (
                    <button onClick={() => addToCart(plat)} className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-light hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-1">
                      +
                    </button>
                  ) : (
                     <button disabled className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xl font-light cursor-not-allowed">
                      —
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12">
              <div className="text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 py-12 mb-12">
                <span className="text-5xl block mb-4">🍽️</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun plat trouvé avec ces filtres.</h3>
                <p className="text-gray-500">Mais ne vous inquiétez pas, voici quelques autres plats qui pourraient vous plaire :</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {allPlats.slice(0, 3).map(plat => (
                  <div key={plat.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
                    <div className="relative h-56 overflow-hidden bg-gray-100 shrink-0">
                      <img src={plat.image?.replace('localhost', '192.168.1.6')} alt={plat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'; }} />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full shadow-md backdrop-blur-md ${plat.status === 'DISPO' ? 'bg-white/90 text-green-600' : 'bg-red-600/90 text-white'}`}>
                          {plat.status === 'DISPO' ? 'Disponible' : 'Épuisé'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">🏪</span>
                        <span className="text-sm font-bold text-gray-500">{plat.restaurant?.name || 'Restaurant Partenaire'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{plat.name}</h3>
                      <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">{plat.description || 'Un délicieux plat préparé avec soin.'}</p>
                      
                      <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-50">
                        <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prix</span>
                          <span className="text-2xl font-black text-gray-900">{plat.price.toLocaleString()} <span className="text-base text-gray-500">FCFA</span></span>
                        </div>
                        {plat.status === 'DISPO' ? (
                          <button onClick={() => addToCart(plat)} className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-light hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-1">
                            +
                          </button>
                        ) : (
                           <button disabled className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xl font-light cursor-not-allowed">
                            —
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PANIER MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">Votre Panier <span className="text-red-600">({cart.length})</span></h2>
              <button onClick={() => setCheckoutOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <span className="text-6xl mb-4">🛒</span>
                  <p className="font-medium text-lg">Votre panier est vide</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-4">
                        <img src={item.image?.replace('localhost', '192.168.1.6')} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-red-600 font-bold text-sm">{item.price} FCFA</p>
                        </div>
                      </div>
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-600 p-2 text-sm">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-bold">Total à payer</span>
                  <span className="text-2xl font-black text-gray-900">{total} FCFA</span>
                </div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>
                    <div className="flex gap-2 mb-4">
                      {['LIVRAISON', 'EMPORTER', 'SUR_PLACE'].map(type => (
                        <button 
                          key={type} 
                          type="button"
                          onClick={() => setFormData({...formData, type})}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border ${formData.type === type ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                          {type === 'SUR_PLACE' ? 'Sur place' : type === 'EMPORTER' ? 'À emporter' : 'Livraison'}
                        </button>
                      ))}
                    </div>

                    <input type="text" placeholder="Votre Nom Complet" required className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                    <input type="tel" placeholder="Numéro de Téléphone" required className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} />
                    
                    {formData.type === 'LIVRAISON' && (
                      <textarea placeholder="Adresse de livraison complète (Quartier, Repère)" required className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600" value={formData.clientAddress} onChange={e => setFormData({...formData, clientAddress: e.target.value})} />
                    )}
                    
                    <select className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                      <option value="WAVE">Payer par Wave</option>
                      <option value="ORANGE_MONEY">Payer par Orange Money</option>
                      <option value="SAMIR_PAY">Payer par Samir Pay</option>
                      <option value="ESPECES">Paiement en Espèces (À la réception)</option>
                    </select>
                    
                    <button type="submit" disabled={isProcessingPayment} className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-colors mt-4 ${isProcessingPayment ? "bg-gray-400 shadow-none cursor-not-allowed" : "bg-red-600 shadow-red-600/30 hover:bg-red-700"}`}>
                      {isProcessingPayment ? "Paiement en cours..." : "Confirmer la Commande"}
                    </button>
                  </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUCCÈS MODAL */}
      {isSuccessOpen && orderInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Commande Réussie !</h2>
            <p className="text-gray-500 mb-8">Votre commande a été envoyée au restaurant. Merci pour votre confiance.</p>
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Numéro de Suivi</p>
                <p className="text-3xl font-black text-red-600 tracking-wider">{orderInfo.orderNumber}</p>
                <p className="text-xs text-gray-500 mt-4 bg-white p-2 rounded-lg border border-gray-200">Conservez ce numéro pour suivre votre commande !</p>
            </div>
            <button onClick={() => setSuccessOpen(false)} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* LOGIN/PROFILE MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full relative animate-fade-in-up border border-gray-100">
            <button onClick={() => setLoginOpen(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                {formData.clientPhone ? "Mon Profil" : "Bon retour !"}
              </h2>
              <p className="text-gray-500 text-sm px-4">
                {formData.clientPhone ? "Vérifiez ou modifiez vos informations personnelles." : "Connectez-vous pour retrouver vos favoris et commander en un clic."}
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 mb-2 uppercase tracking-widest pl-1">Votre Nom <span className="text-gray-400 font-normal capitalize">(Optionnel)</span></label>
                <input type="text" placeholder="Ex: Jean Dupont" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:font-medium placeholder:text-gray-400" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 mb-2 uppercase tracking-widest pl-1">Numéro de téléphone <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold border-r border-gray-200 pr-3">+221</span>
                  </div>
                  <input type="tel" placeholder="77 123 45 67" required className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-20 pr-5 py-4 font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:font-medium placeholder:text-gray-400" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-lg mt-4 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(220,38,38,0.6)] hover:-translate-y-0.5 transition-all">
                {formData.clientPhone ? "Mettre à jour" : "Me connecter"}
              </button>
            </form>
            
            {formData.clientPhone && (
              <div className="mt-6 text-center">
                <button type="button" onClick={handleLogout} className="text-red-500 hover:text-red-700 font-bold text-sm underline decoration-red-500/30 hover:decoration-red-500 underline-offset-4 transition-all">
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUIVI MODAL */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative">
            <button onClick={() => setTrackModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold transition-colors">✕</button>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Suivre une commande</h2>
            <form onSubmit={handleTrackOrder} className="flex gap-2 mb-6">
              <input type="text" placeholder="Ex: CMD-123456" required className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-900 focus:outline-none focus:border-red-600" value={trackOrderNumber} onChange={(e) => setTrackOrderNumber(e.target.value)} />
              <button type="submit" className="bg-red-600 text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-colors">OK</button>
            </form>
            
            {trackError && <p className="text-red-600 font-medium text-center bg-red-50 p-4 rounded-xl">{trackError}</p>}
            
            {trackResult && (
              <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Statut Actuel</p>
                        <h3 className={`text-xl font-black ${
                            trackResult.status === 'LIVREE' ? 'text-green-600' :
                            trackResult.status === 'PRETE' ? 'text-blue-600' :
                            trackResult.status === 'EN_PREPARATION' ? 'text-orange-500' :
                            'text-gray-900'
                        }`}>
                          {trackResult.status === 'NOUVELLE' && 'En attente ⏳'}
                          {trackResult.status === 'EN_PREPARATION' && 'En préparation 🍳'}
                          {trackResult.status === 'PRETE' && 'Prête (Livreur en route) 🛵'}
                          {trackResult.status === 'LIVREE' && 'Livrée ✅'}
                          {trackResult.status === 'ANNULEE' && 'Annulée ❌'}
                        </h3>
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-bold text-gray-900 mb-1">Détails</p>
                    <p className="text-gray-500 text-sm">Client : {trackResult.clientName}</p>
                    <p className="text-gray-500 text-sm">Total : <span className="font-bold text-gray-900">{trackResult.totalAmount} FCFA</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <h2 className="text-3xl font-black tracking-tighter text-red-600 mb-4">
                {platformSettings?.platformName || 'LekkRek'}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                La plateforme n°1 de livraison partout à Ziguinchor. Vos plats préférés, livrés rapidement et encore chauds.
              </p>
              <div className="text-gray-400 text-sm">
                <p>📞 {platformSettings?.supportPhone || '+221 77 000 00 00'}</p>
                <p>✉️ {platformSettings?.supportEmail || 'support@lekkrek.com'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/pages/about" className="hover:text-red-500 transition-colors">À propos</Link></li>
                <li><Link to="/pages/team" className="hover:text-red-500 transition-colors">Notre équipe</Link></li>
                <li><Link to="/pages/blog" className="hover:text-red-500 transition-colors">Blog</Link></li>
                <li><Link to="/login" className="hover:text-red-500 transition-colors font-bold text-gray-300">Connexion Équipe</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Mentions Légales</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/pages/terms" className="hover:text-red-500 transition-colors">Conditions Générales (CGU)</Link></li>
                <li><Link to="/pages/privacy" className="hover:text-red-500 transition-colors">Confidentialité</Link></li>
                <li><Link to="/pages/cookies" className="hover:text-red-500 transition-colors">Politique des Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Nous rejoindre</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPartnerModalOpen(true); }} className="hover:text-red-500 transition-colors font-bold text-red-500">Devenir Partenaire</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} {platformSettings?.platformName || 'LekkRek'}. Tous droits réservés.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {platformSettings?.facebookUrl && (
                <a href={`https://facebook.com/${platformSettings.facebookUrl}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
              )}
              {platformSettings?.instagramUrl && (
                <a href={`https://instagram.com/${platformSettings.instagramUrl}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              )}
              {platformSettings?.tiktokUrl && (
                <a href={`https://tiktok.com/@${platformSettings.tiktokUrl.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
              )}
            </div>
          </div>
        </div>
      </footer>


      {/* PARTNER MODAL */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-slide-in-right">
            <button onClick={() => setPartnerModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
              ✕
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Devenir Partenaire</h2>
            <p className="text-gray-500 text-sm mb-6">Remplissez ce formulaire. Notre équipe vous contactera rapidement pour finaliser votre inscription.</p>
            
            {partnerStatus === 'success' ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-center border border-green-200">
                <span className="text-4xl mb-2 block">✅</span>
                <p className="font-bold">Demande envoyée !</p>
                <p className="text-sm mt-1">Nous vous appelons très vite.</p>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nom du Restaurant</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-red-500" value={partnerForm.nomRestaurant} onChange={(e) => setPartnerForm({...partnerForm, nomRestaurant: e.target.value})} placeholder="Ex: Chez Fatou" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nom du Gérant</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-red-500" value={partnerForm.nomContact} onChange={(e) => setPartnerForm({...partnerForm, nomContact: e.target.value})} placeholder="Votre nom complet" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-red-500" value={partnerForm.telephone} onChange={(e) => setPartnerForm({...partnerForm, telephone: e.target.value})} placeholder="Ex: 77 123 45 67" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ville / Quartier</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-red-500" value={partnerForm.ville} onChange={(e) => setPartnerForm({...partnerForm, ville: e.target.value})} placeholder="Ex: Ziguinchor, Escale" />
                </div>
                {partnerStatus === 'error' && <p className="text-red-500 text-sm">Une erreur est survenue, veuillez réessayer.</p>}
                <button type="submit" disabled={partnerStatus === 'loading'} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-red-200 mt-2">
                  {partnerStatus === 'loading' ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    
      {/* BOUTON WHATSAPP FLOTTANT */}
      <a 
        onClick={handleWhatsappClick} href="#" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all z-50 flex items-center justify-center group"
        title="Nous contacter sur WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="absolute right-16 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Besoin d'aide ?
        </span>
      </a>
    </div>
  );
}

