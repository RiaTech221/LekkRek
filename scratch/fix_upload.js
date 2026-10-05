const fs = require('fs');
const file = 'backend/src/main/java/com/lekkrek/controller/FileUploadController.java';
let content = fs.readFileSync(file, 'utf8');

const validationCode = `
            // Génération d'un nom de fichier unique sécurisé
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".") 
                               ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() 
                               : "";

            // Validation de l'extension
            if (!extension.equals(".jpg") && !extension.equals(".jpeg") && !extension.equals(".png") && !extension.equals(".webp")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Seules les images (.jpg, .png, .webp) sont autorisées."));
            }

            // Validation de la taille (5 Mo = 5 * 1024 * 1024 octets)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le fichier dépasse la taille maximale autorisée (5 Mo)."));
            }

            String uniqueName = UUID.randomUUID().toString() + extension;
`;

content = content.replace(/\/\/ G[Ǹ\w]+ration d'un nom de fichier[\s\S]*?String uniqueName = UUID.randomUUID\(\).toString\(\) \+ extension;/, validationCode.trim());
fs.writeFileSync(file, content);
