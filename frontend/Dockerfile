FROM node:18-alpine

WORKDIR /app

# On copie seulement package.json et package-lock.json au début
COPY package*.json ./

RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port par défaut de Vite
EXPOSE 5173

# Lancer le serveur de développement Vite accessible depuis l'extérieur
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
