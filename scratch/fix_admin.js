const fs = require('fs');

const file = 'backend/src/main/java/com/lekkrek/controller/AdminController.java';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<<<<<<< HEAD[\s\S]*?@CrossOrigin\(origins = "\*"\)[\s\S]*?=======[\s\S]*?>>>>>>> develop/, '');

fs.writeFileSync(file, content);
