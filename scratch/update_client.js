const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/client/ClientView.jsx', 'utf8');

content = content.replace(/const \[allPlats, setAllPlats\] = useState\(\[\]\);/, "const [allPlats, setAllPlats] = useState([]);\n  const [recommendations, setRecommendations] = useState([]);");

const effect = 
  useEffect(() => {
    const saved = localStorage.getItem('lekkrek_client_profile');
    let phone = '';
    if (saved) {
      try { phone = JSON.parse(saved).phone || ''; } catch (e) {}
    }
    fetch(\http://192.168.1.6:8080/api/v1/public/menu/recommendations?phone=\\)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error(err));
  }, []);
;

// append effect after const cats = [...new Set(data.map block... wait, let's just insert it before // Recharge les plats dès qu'un filtre change
content = content.replace(/\/\/ Recharge les plats/, effect + "\n  // Recharge les plats");

fs.writeFileSync('frontend/src/pages/client/ClientView.jsx', content, 'utf8');
