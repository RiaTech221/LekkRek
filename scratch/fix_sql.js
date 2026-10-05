const fs = require('fs');

const file = 'database_schema.sql';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/DOUBLE/g, 'DECIMAL(10,2)');

fs.writeFileSync(file, content);
