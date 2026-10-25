import { API_URL, formatImageUrl } from '../../config';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { validateSenegalPhone, normalizeSenegalPhone } from '../../utils/phoneUtils';
import DishCard, { DishCardImage } from '../../components/client/DishCard';
import SuccessModal from '../../components/client/SuccessModal';
import OrderTrackingModal from '../../components/client/OrderTrackingModal';

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
  const [todayPlats, setTodayPlats] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // All categories loaded once
  const [allPlats, setAllPlats] = useState(() => {
    try {
      const cached = localStorage.getItem('lekkrek_cache_all_plats');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  }); // All plats for fallbacks and filter options
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

  // Options de filtres calculées à partir de la liste COMPLÈTE non filtrée (indépendantes des filtres)
  const restaurantOptions = useMemo(() => {
    const source = (Array.isArray(allPlats) && allPlats.length > 0)
      ? allPlats
      : (Array.isArray(todayPlats) ? todayPlats : []);
    const names = [...new Set(source.map(p => p.restaurant?.name?.trim()).filter(Boolean))];
    return names.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }, [allPlats, todayPlats]);

  const quartierOptions = useMemo(() => {
    const source = (Array.isArray(allPlats) && allPlats.length > 0)
      ? allPlats
      : (Array.isArray(todayPlats) ? todayPlats : []);
    const locations = [...new Set(source.map(p => p.restaurant?.location?.trim()).filter(Boolean))];
    return locations.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }, [allPlats, todayPlats]);

  const momentOptions = useMemo(() => {
    const source = (Array.isArray(allPlats) && allPlats.length > 0)
      ? allPlats
      : (Array.isArray(todayPlats) ? todayPlats : []);
    const moments = [...new Set(source.map(p => p.moment?.trim()).filter(Boolean))];
    return moments.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }, [allPlats, todayPlats]);
  
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
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // States pour le suivi
  const [isTrackModalOpen, setTrackModalOpen] = useState(false);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  
  
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

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [isLoginOpen, setLoginOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginError, setLoginError] = useState('');

  const openLoginModal = () => {
    setLoginPhone(formData.clientPhone || '');
    setLoginName(formData.clientName || '');
    setLoginError('');
    setLoginOpen(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validateSenegalPhone(loginPhone)) {
      setLoginError("Numéro de téléphone sénégalais invalide (ex: 771234567 ou +221 77 123 45 67).");
      return;
    }
    setLoginError('');
    const cleanPhone = normalizeSenegalPhone(loginPhone);
    localStorage.setItem('lekkrek_client_profile', JSON.stringify({ 
      name: loginName || formData.clientName, 
      phone: cleanPhone, 
      address: formData.clientAddress 
    }));
    setFormData(prev => ({ ...prev, clientPhone: cleanPhone, clientName: loginName || prev.clientName }));
    
    // Refresh recommendations
    fetch(`${API_URL}/api/v1/public/menu/recommendations?phone=${cleanPhone}`)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error(err));
      
    setLoginOpen(false);
    if (formData.clientPhone) {
      showToast("Profil mis à jour !", "success");
    } else {
      showToast("Connecté avec succès ! Vos favoris ont été chargés.", "success");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lekkrek_client_profile');
    setFormData(prev => ({ ...prev, clientPhone: '', clientName: '' }));
    setRecommendations([]);
    setLoginOpen(false);
    showToast("Vous êtes déconnecté.", "info");
  };

  
    
  const handleWhatsappClick = (e) => {
    e.preventDefault();
    if (!platformSettings?.supportPhone || !platformSettings.supportPhone.trim()) {
      return;
    }

    // Sanitise les valeurs potentiellement corrompues (encodage Latin-1 → UTF-8)
    const sanitize = (str) => {
      if (!str) return str;
      return str
        .replace(/\u00C3\u00A9/g, 'é')   // é mal encodé
        .replace(/\u00C3\u00A8/g, 'è')
        .replace(/\u00C3\u00AA/g, 'ê')
        .replace(/\u00C3\u00B4/g, 'ô')
        .replace(/\u00C3\u00B9/g, 'ù')
        .replace(/\u00C3\u00A0/g, 'à')
        .replace(/\u00C3\u00AE/g, 'î')
        .replace(/\u00C2\u00B0/g, '°')   // ° (degré/numéro)
        .replace(/\u00C3\u00AF/g, 'ï')
        .replace(/\uFFFD/g, '');         // caractère de remplacement inconnu
    };

    let message = sanitize(platformSettings?.whatsappMessageGreeting) || "Bonjour l'équipe LekkRek 👋, ";
    if (formData.clientName && formData.clientName.trim() !== '') {
      message += "je suis " + formData.clientName + ". ";
    }
    
    if (trackOrderNumber && trackOrderNumber.trim() !== '') {
      const orderTpl = sanitize(platformSettings?.whatsappMessageOrder) || "Je vous contacte concernant ma commande N° {orderNumber}.";
      message += orderTpl.replace('{orderNumber}', trackOrderNumber) + " ";
    } else if (cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const cartTpl = sanitize(platformSettings?.whatsappMessageCart) || "J'ai actuellement {count} plat(s) dans mon panier pour un total de {total} FCFA et j'aimerais avoir de l'aide pour finaliser ma commande.";
      message += cartTpl.replace('{count}', cart.length).replace('{total}', total) + " ";
    } else {
      const defTpl = sanitize(platformSettings?.whatsappMessageDefault) || "j'aimerais avoir de plus amples informations s'il vous plaît.";
      message += defTpl;
    }

    const cleanDigits = platformSettings.supportPhone.replace(/\D/g, '');
    const phone = cleanDigits.startsWith('221') ? cleanDigits : `221${cleanDigits}`;
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    fetch(`${API_URL}/api/v1/public/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'click_whatsapp', entityId: phone, context: 'floating_button' })
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

  // Fetch ALL plats once to build the full options lists (independent of filters)
  useEffect(() => {
    fetch(`${API_URL}/api/v1/public/menu`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllPlats(data);
          try {
            localStorage.setItem('lekkrek_cache_all_plats', JSON.stringify(data));
          } catch (e) {}
          const cats = [...new Set(data.map(p => p.moment).filter(Boolean))].sort();
          setAllCategories(cats);
          localStorage.setItem('lekkrek_cache_cats', JSON.stringify(cats));
        }
      })
      .catch(err => {
        console.error('Erreur chargement menu complet:', err);
        const cachedCats = localStorage.getItem('lekkrek_cache_cats');
        if (cachedCats) {
          try { setAllCategories(JSON.parse(cachedCats)); } catch (e) {}
        }
        const cachedPlats = localStorage.getItem('lekkrek_cache_all_plats');
        if (cachedPlats) {
          try { setAllPlats(JSON.parse(cachedPlats)); } catch (e) {}
        }
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('lekkrek_client_profile');
    let phone = '';
    if (saved) {
      try { phone = JSON.parse(saved).phone || ''; } catch (e) {}
    }
    fetch(`${API_URL}/api/v1/public/menu/recommendations?phone=${phone}`)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch plats du jour
  useEffect(() => {
    fetch(`${API_URL}/api/v1/public/menu/today`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTodayPlats(data);
        }
      })
      .catch(err => console.error("Erreur chargement plats du jour:", err));
  }, []);

  // Recharge les plats dès qu'un filtre change
  useEffect(() => {
    // 1. Fetch settings
    fetch(`${API_URL}/api/v1/settings`)
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

    fetch(`${API_URL}/api/v1/public/menu?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPlats(data);
        if (!keyword && !resto && !budgetMax && !quartier && !momentFilter && Array.isArray(data)) {
          setAllPlats(prev => (Array.isArray(prev) && prev.length > 0 ? prev : data));
        }
      })
      .catch(err => console.error("Erreur API:", err));
  }, [keyword, resto, budgetMax, quartier, momentFilter]);

  // Analytics logging (debounced)
  useEffect(() => {
    if (!keyword || keyword.length < 3) return;
    const timeoutId = setTimeout(() => {
      fetch(`${API_URL}/api/v1/public/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'search', entityId: keyword, context: 'search_bar' })
      }).catch(console.error);
    }, 1500); // Wait 1.5 seconds after typing stops before logging
    return () => clearTimeout(timeoutId);
  }, [keyword]);

  const addToCart = (plat) => setCart([...cart, plat]);

  // Restaurants uniques concernés par le panier
  const uniqueRestaurants = Array.from(
    new Map(cart.map(item => [item.restaurant?.id, item.restaurant])).values()
  ).filter(Boolean);

  const canLivraison = uniqueRestaurants.length === 0 || !uniqueRestaurants.some(r => r?.livraison === false);
  const canEmporter = uniqueRestaurants.length === 0 || !uniqueRestaurants.some(r => (r?.aEmporter ?? r?.aemporter) === false);
  const canSurPlace = uniqueRestaurants.length === 0 || !uniqueRestaurants.some(r => r?.surPlace === false);

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const deliverySupplement = formData.type === 'LIVRAISON'
    ? uniqueRestaurants.reduce((sum, r) => sum + (Number(r?.supplementLivraison) || 0), 0)
    : 0;
  const total = subtotal + deliverySupplement;

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return showToast("Votre panier est vide !", "error");
    
    // Contrôles de modes de service
    if (formData.type === 'LIVRAISON' && !canLivraison) {
      return showToast("La livraison n'est pas acceptée par au moins un des restaurants de votre panier.", "error");
    }
    if (formData.type === 'EMPORTER' && !canEmporter) {
      return showToast("La vente à emporter n'est pas acceptée par au moins un des restaurants de votre panier.", "error");
    }
    if (formData.type === 'SUR_PLACE' && !canSurPlace) {
      return showToast("Le service sur place n'est pas disponible pour au moins un des restaurants de votre panier.", "error");
    }

    // Contrôles de saisie (Validation)
    if (!formData.clientName || formData.clientName.trim().length < 2) {
      return showToast("Veuillez saisir votre nom complet (au moins 2 caractères).", "error");
    }
    if (!validateSenegalPhone(formData.clientPhone)) {
      return showToast("Numéro de téléphone sénégalais invalide (ex: 771234567 ou +221 77 123 45 67).", "error");
    }
    if (formData.type === 'LIVRAISON' && (!formData.clientAddress || formData.clientAddress.trim().length < 5)) {
      return showToast("Veuillez saisir une adresse de livraison plus précise.", "error");
    }

    const processOrder = () => {
      const orderRequest = {
        ...formData,
        clientPhone: normalizeSenegalPhone(formData.clientPhone),
        platIds: cart.map(p => p.id || p.platId)
      };

      fetch(`${API_URL}/api/v1/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest)
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.message || "Erreur serveur lors de la commande.");
          }).catch(() => {
            throw new Error("Erreur serveur lors de la commande.");
          });
        }
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
        showToast(err.message || "Erreur lors de la commande.", "error");
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

    if (!partnerForm.nomRestaurant || partnerForm.nomRestaurant.trim().length < 2) {
      return showToast("Le nom du restaurant doit contenir au moins 2 caractères.", "error");
    }
    if (!partnerForm.nomContact || partnerForm.nomContact.trim().length < 2) {
      return showToast("Votre nom doit contenir au moins 2 caractères.", "error");
    }
    if (!validateSenegalPhone(partnerForm.telephone)) {
      return showToast("Numéro de téléphone sénégalais invalide (ex: 771234567 ou +221 77 123 45 67).", "error");
    }
    if (!partnerForm.ville || partnerForm.ville.trim().length < 3) {
      return showToast("La ville/quartier doit contenir au moins 3 caractères.", "error");
    }

    setPartnerStatus('loading');
    fetch(`${API_URL}/api/v1/public/partner-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...partnerForm,
        telephone: normalizeSenegalPhone(partnerForm.telephone)
      })
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

  

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="w-full px-2 sm:px-4 lg:px-6 mx-auto">
          <div className="flex justify-between h-20 items-center gap-2">
            
            <img src="/logo_lekkrek.png" alt="LekkRek Logo" className="h-14 sm:h-16 w-auto object-contain shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            
            {/* BIG SEARCH BAR IN NAVBAR */}
            <div className="flex w-full max-w-[50rem] mx-2 lg:mx-6 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md items-center divide-x divide-gray-100 transition-all h-14 overflow-x-auto [&::-webkit-scrollbar]:hidden"
              style={{ flex: '1 1 0%', minWidth: 0, overflowX: 'auto' }}>
              
              {/* Quoi ? */}
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '140px', flexShrink: 0, padding: '0 12px 0 16px', height: '100%', cursor: 'text' }}>
                <span style={{ color: '#9ca3af', marginRight: '8px', flexShrink: 0 }}>🔍</span>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>Quoi ?</span>
                  <input type="text" placeholder="Plat, ingrédient..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#6b7280', fontWeight: 500, fontSize: '12px' }} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>
              </div>

              {/* Séparateur */}
              <div style={{ width: '1px', background: '#f3f4f6', height: '60%', flexShrink: 0 }} />

              {/* Restaurant */}
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '130px', flexShrink: 0, padding: '0 12px', height: '100%', cursor: 'pointer' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>Restaurant</span>
                  <select style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#6b7280', fontWeight: 500, fontSize: '12px', appearance: 'none', cursor: 'pointer' }} value={resto} onChange={(e) => setResto(e.target.value)}>
                    <option value="">Tous les restaurants</option>
                    {resto && !restaurantOptions.includes(resto) && (
                      <option value={resto}>{resto}</option>
                    )}
                    {restaurantOptions.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Séparateur */}
              <div style={{ width: '1px', background: '#f3f4f6', height: '60%', flexShrink: 0 }} />

              {/* Quartier */}
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '130px', flexShrink: 0, padding: '0 12px', height: '100%', cursor: 'pointer' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>Quartier</span>
                  <select style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#6b7280', fontWeight: 500, fontSize: '12px', appearance: 'none', cursor: 'pointer' }} value={quartier} onChange={(e) => setQuartier(e.target.value)}>
                    <option value="">Tous les quartiers</option>
                    {quartier && !quartierOptions.includes(quartier) && (
                      <option value={quartier}>{quartier}</option>
                    )}
                    {quartierOptions.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Séparateur */}
              <div style={{ width: '1px', background: '#f3f4f6', height: '60%', flexShrink: 0 }} />

              {/* Budget Max */}
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '110px', flexShrink: 0, padding: '0 12px', height: '100%', cursor: 'text' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>Budget Max</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="ex: 2000"
                    style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#6b7280', fontWeight: 500, fontSize: '12px' }}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
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

      <main className="flex-1 flex flex-col">

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
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight max-w-2xl whitespace-pre-line" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(platformSettings?.heroTitle || 'Les menus du jour<br/>à Ziguinchor.') }}></h2>
          <p className="text-xl text-gray-200 max-w-xl mb-10 font-medium leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(platformSettings?.heroSubtitle || 'Qui a cuisiné quoi, à quel prix, où le trouver.<br/>Publié du lundi au samedi à 10h30.<br/>Ce qu\'il reste à 13h30.') }}></p>
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
      <div style={{ width: '100%', padding: '0 32px', marginTop: '48px' }}>
        
        {/* MOMENTS FILTER (Pills) */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 hide-scrollbar border-b border-gray-100">
          {/* Dynamic categories from ALL plats - never disappear when filtering */
          [{value:'', label:'🍴 Tout voir'}, ...(((momentOptions.length > 0 ? momentOptions : allCategories)).map(cat => {
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

        {/* SECTION PLATS DU JOUR (API /today) */}
        {Array.isArray(todayPlats) && todayPlats.length > 0 && !keyword && !resto && !quartier && !momentFilter && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  Disponibilités du jour
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-2 flex items-center gap-2">
                  <span>🔥</span> Plats du Jour à Ziguinchor
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                {todayPlats.length} disponible{todayPlats.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {todayPlats.map(plat => (
                <DishCard key={`today-${plat.id || plat.platId}`} plat={plat} onAdd={addToCart} />
              ))}
            </div>
            <div className="mt-10 border-t border-gray-100"></div>
          </div>
        )}

        <h3 className="text-2xl font-black text-gray-900 mb-8">Au menu aujourd'hui</h3>
        
        {/* RECOMMENDATIONS SECTION */}
        {recommendations.length > 0 && !keyword && !resto && !quartier && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span>🌟</span> Recommandé pour vous
            </h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
              {recommendations.map(plat => (
                <div key={`rec-${plat.id}`} className="bg-orange-50/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-100 group flex flex-col relative">
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">Favori</div>
                  <div className="relative h-40 overflow-hidden bg-gray-100 shrink-0">
                    <DishCardImage plat={plat} />
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

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 pb-12">
          {Array.isArray(plats) && plats.length > 0 ? plats.map(plat => (
            <DishCard key={plat.id} plat={plat} onAdd={addToCart} />
          )) : (
            <div className="col-span-full py-12">
              <div className="text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 py-12 mb-12">
                <span className="text-5xl block mb-4">🍽️</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun plat trouvé avec ces filtres.</h3>
                <p className="text-gray-500">Mais ne vous inquiétez pas, voici quelques autres plats qui pourraient vous plaire :</p>
              </div>
              
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                {allPlats.slice(0, 3).map(plat => (
                  <DishCard key={plat.id} plat={plat} onAdd={addToCart} />
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
                        {item.image && formatImageUrl(item.image) ? (
                          <img src={formatImageUrl(item.image)} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-900 to-rose-950 text-rose-400 font-black flex items-center justify-center text-lg shrink-0">
                            {(item.name || 'P').trim().charAt(0).toUpperCase()}
                          </div>
                        )}
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
                <div className="space-y-1.5 mb-5 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Sous-total plats</span>
                    <span className="font-semibold text-gray-800">{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  {formData.type === 'LIVRAISON' && (
                    <div className="flex justify-between items-center text-xs text-emerald-600">
                      <span>Frais de livraison</span>
                      <span className="font-semibold">{deliverySupplement > 0 ? `+${deliverySupplement.toLocaleString()} FCFA` : 'Inclus / 0 FCFA'}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-900 font-bold text-sm">Total à payer</span>
                    <span className="text-xl font-black text-gray-900">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>
                    <div className="flex gap-2 mb-4">
                      {[
                        { type: 'SUR_PLACE', label: 'Sur place', allowed: canSurPlace },
                        { type: 'EMPORTER', label: 'À emporter', allowed: canEmporter },
                        { type: 'LIVRAISON', label: 'Livraison', allowed: canLivraison }
                      ].map(({ type, label, allowed }) => (
                        <button 
                          key={type} 
                          type="button"
                          disabled={!allowed}
                          onClick={() => setFormData({...formData, type})}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                            !allowed 
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50' 
                              : formData.type === type 
                                ? 'bg-red-50 border-red-200 text-red-600 shadow-xs' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          title={!allowed ? "Non proposé par l'un des restaurants de votre panier" : label}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <input type="text" placeholder="Votre Nom Complet" required className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                    <input
                      type="tel"
                      inputMode="tel"
                      maxLength={16}
                      placeholder="Numéro de Téléphone (ex: 771234567 ou +221 77...)"
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600"
                      value={formData.clientPhone}
                      onChange={e => setFormData({...formData, clientPhone: e.target.value.slice(0, 16)})}
                      onKeyDown={e => {
                        if (!/[0-9+\s]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                          e.preventDefault();
                        }
                      }}
                    />
                    
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
        <SuccessModal
          orderInfo={orderInfo}
          onClose={() => setSuccessOpen(false)}
        />
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
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={16}
                    placeholder="771234567"
                    required
                    className={`w-full bg-gray-50 border rounded-2xl pl-20 pr-5 py-4 font-bold text-gray-900 focus:outline-none transition-all placeholder:font-medium placeholder:text-gray-400 ${
                      loginError
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    }`}
                    value={loginPhone}
                    onChange={(e) => {
                      setLoginPhone(e.target.value.slice(0, 16));
                      if (loginError) setLoginError('');
                    }}
                    onKeyDown={(e) => {
                      if (!/[0-9+\s]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                {loginError && (
                  <p className="flex items-center gap-1.5 text-red-500 text-xs font-bold mt-2 pl-1 animate-in fade-in slide-in-from-top-1">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{loginError}</span>
                  </p>
                )}
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
            <OrderTrackingModal
        isOpen={isTrackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        onOrderNumberChange={setTrackOrderNumber}
      />

      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo_lekkrek.png" alt="LekkRek Logo" className="h-10 w-10 object-contain rounded-full bg-white p-1" />
                <h2 className="text-3xl font-black tracking-tighter text-red-600">
                  {platformSettings?.platformName || 'LekkRek'}
                </h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                La plateforme n°1 de livraison partout à Ziguinchor. Vos plats préférés, livrés rapidement et encore chauds.
              </p>
              <div className="text-gray-400 text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {platformSettings?.supportPhone && platformSettings.supportPhone.trim() !== '' && (
                  <a href={`tel:${platformSettings.supportPhone.replace(/\s/g, '')}`}
                     style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseOver={e => e.currentTarget.style.color = '#ffffff'}
                     onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}>
                    📞 {platformSettings.supportPhone}
                  </a>
                )}
                <a href={`mailto:${platformSettings?.supportEmail || 'support@lekkrek.com'}`}
                   style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                   onMouseOver={e => e.currentTarget.style.color = '#ffffff'}
                   onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}>
                  ✉️ {platformSettings?.supportEmail || 'support@lekkrek.com'}
                </a>
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
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={16}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
                    value={partnerForm.telephone}
                    onChange={(e) => setPartnerForm({...partnerForm, telephone: e.target.value.slice(0, 16)})}
                    placeholder="Ex: 771234567 ou +221 77..."
                    onKeyDown={(e) => {
                      if (!/[0-9+\s]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                      }
                    }}
                  />
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
      {platformSettings?.supportPhone && platformSettings.supportPhone.trim() !== '' && (
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
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-24 right-6 z-[9999] flex items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {toast.type === 'success' ? '✓' : '👋'}
          </div>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
