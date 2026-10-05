const fs = require('fs');
const file = 'backend/src/main/java/com/lekkrek/entity/Utilisateur.java';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('java.time.LocalDateTime;\\nimport', 'java.time.LocalDateTime;\nimport');
content = content.replace('@JsonIgnore\\n    private String', '@JsonIgnore\n    private String');
fs.writeFileSync(file, content);
