const fs = require('fs');

function replaceDoubleWithBigDecimal(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace all occurrences of Double with BigDecimal, except in some context if needed
    if (content.includes('Double')) {
        content = content.replace(/Double/g, 'BigDecimal');
        if (!content.includes('import java.math.BigDecimal;')) {
            content = content.replace('import', 'import java.math.BigDecimal;\nimport');
        }
        
        // Fix commissionRate specifically in Restaurant.java if it became BigDecimal
        if (file.includes('Restaurant.java')) {
            content = content.replace('BigDecimal commissionRate = 10.0;', 'BigDecimal commissionRate = new BigDecimal("10.0");');
            content = content.replace('columnDefinition = "double default 10.0"', 'columnDefinition = "DECIMAL(5,2) default 10.0"');
        }
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
}

const files = [
    'backend/src/main/java/com/lekkrek/entity/Commande.java',
    'backend/src/main/java/com/lekkrek/entity/CommandeItem.java',
    'backend/src/main/java/com/lekkrek/entity/Plat.java',
    'backend/src/main/java/com/lekkrek/entity/Restaurant.java',
    'backend/src/main/java/com/lekkrek/dto/OrderResponseDTO.java',
    'backend/src/main/java/com/lekkrek/dto/OrderTrackingDTO.java',
    'backend/src/main/java/com/lekkrek/dto/PlatRequestDTO.java'
];

files.forEach(replaceDoubleWithBigDecimal);

// Fix OrderServiceImpl where new BigDecimal calculation might be needed
// Wait, the calculation in OrderServiceImpl usually sums up Double. We need to check it.
