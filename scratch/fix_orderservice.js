const fs = require('fs');

const file = 'backend/src/main/java/com/lekkrek/service/impl/OrderServiceImpl.java';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('double total = 0;', 'java.math.BigDecimal total = java.math.BigDecimal.ZERO;');
content = content.replace('total += plat.getPrice();', 'total = total.add(plat.getPrice());');

fs.writeFileSync(file, content);
