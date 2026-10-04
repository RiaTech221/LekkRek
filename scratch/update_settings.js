const fs = require('fs');
const file = 'backend/src/main/java/com/lekkrek/entity/PlatformSettings.java';
let content = fs.readFileSync(file, 'utf8');

const replacement = `private String whatsappMessageDefault = "j'aimerais avoir de plus amples informations s'il vous pla\\u00EEt.";

    @Column(columnDefinition = "TEXT")
    private String heroTitle = "Les menus du jour à Ziguinchor.";

    @Column(columnDefinition = "TEXT")
    private String heroSubtitle = "Qui cuisine quoi aujourd'hui, à quel prix et où le trouver. Menus publiés du lundi au samedi dès 10H30.";`;

content = content.replace(/private String whatsappMessageDefault = "j'aimerais avoir de plus amples informations s'il vous pla[^\"]+";/, replacement);

fs.writeFileSync(file, content);
