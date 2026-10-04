const fs = require('fs');
const files = [
  'frontend/src/pages/client/ClientView.jsx',
  'frontend/src/pages/client/MobileClientView.jsx'
];

const newHandler = \  const handleWhatsappClick = (e) => {
    e.preventDefault();
    
    let message = "Bonjour l'équipe LekkRek 👋, ";
    if (formData.clientName && formData.clientName.trim() !== '') {
      message += "je suis " + formData.clientName + ". ";
    }
    
    if (trackOrderNumber && trackOrderNumber.trim() !== '') {
      message += "Je vous contacte concernant ma commande N° " + trackOrderNumber + ". ";
    } else if (cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      message += "J'ai actuellement " + cart.length + " plat(s) dans mon panier pour un total de " + total + " FCFA et j'aimerais avoir de l'aide pour finaliser ma commande.";
    } else {
      message += "j'aimerais avoir de plus amples informations s'il vous plaît.";
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = \https://wa.me/221781161910?text=\\;

    fetch('http://192.168.1.6:8080/api/v1/public/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'click_whatsapp', entityId: '781161910', context: 'floating_button' })
    }).catch(err => console.error(err)).finally(() => {
      window.open(waUrl, '_blank');
    });
  };\;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match old handler
  content = content.replace(/const handleWhatsappClick = \(e\) => \{[\s\S]*?window\.open\('https:\/\/wa\.me\/221781161910', '_blank'\);\s*\}\);\s*\};/m, newHandler);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed ' + file);
});
