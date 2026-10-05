const fs = require('fs');

function replaceInFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (file.includes('DataLoader.java')) {
        content = content.replace('Double price', 'java.math.BigDecimal price');
        // We need to change all double literals in createPlat to new BigDecimal
        // e.g. createPlat(..., 3500.0, ...) -> createPlat(..., new java.math.BigDecimal("3500.0"), ...)
        content = content.replace(/createPlat\(([^,]+),\s*([^,]+),\s*([0-9.]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/g, 'createPlat($1, $2, new java.math.BigDecimal("$3"), $4, $5, $6)');
    }
    
    if (file.includes('MenuController.java') || file.includes('PlatRepository.java')) {
        content = content.replace('Double budgetMax', 'java.math.BigDecimal budgetMax');
    }
    
    fs.writeFileSync(file, content);
}

const files = [
    'backend/src/main/java/com/lekkrek/config/DataLoader.java',
    'backend/src/main/java/com/lekkrek/controller/MenuController.java',
    'backend/src/main/java/com/lekkrek/repository/PlatRepository.java'
];

files.forEach(replaceInFile);
