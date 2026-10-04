const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/client/ClientView.jsx', 'utf8');

const validationLogic = \    const handlePartnerSubmit = (e) => {
      e.preventDefault();
      
      const phoneRegex = /^(77|78|76|75|70|33)\\\\d{7}$/;
      if (!partnerForm.nomRestaurant || partnerForm.nomRestaurant.trim().length < 2) {
        return alert("Le nom du restaurant doit contenir au moins 2 caractres.");
      }
      if (!partnerForm.nomContact || partnerForm.nomContact.trim().length < 2) {
        return alert("Votre nom doit contenir au moins 2 caractres.");
      }
      if (!phoneRegex.test(partnerForm.telephone.replace(/\\\\s/g, ''))) {
        return alert("Numro de tlphone invalide. Ex: 77 123 45 67");
      }
      if (!partnerForm.ville || partnerForm.ville.trim().length < 3) {
        return alert("La ville/quartier doit contenir au moins 3 caractres.");
      }

      setPartnerStatus('loading');\;

content = content.replace(/const handlePartnerSubmit = \\(e\\) => \\{\\s*e\\.preventDefault\\(\\);\\s*setPartnerStatus\\('loading'\\);/, validationLogic);
fs.writeFileSync('frontend/src/pages/client/ClientView.jsx', content, 'utf8');
console.log('Fixed ClientView.jsx');
