const fs = require('fs');

const files = [
    'backend/src/main/java/com/lekkrek/dto/OrderResponseDTO.java',
    'backend/src/main/java/com/lekkrek/dto/OrderTrackingDTO.java',
    'backend/src/main/java/com/lekkrek/dto/PlatRequestDTO.java'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('import java.math.BigDecimal;')) {
        content = content.replace(/^package com\.lekkrek\.dto;(\r?\n)/m, 'package com.lekkrek.dto;$1$1import java.math.BigDecimal;$1');
        fs.writeFileSync(file, content);
        console.log("Fixed " + file);
    }
});
