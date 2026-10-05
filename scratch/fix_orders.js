const fs = require('fs');
const file = 'backend/src/main/java/com/lekkrek/controller/OperatorController.java';
let content = fs.readFileSync(file, 'utf8');

const imports = `import java.security.Principal;
import java.util.stream.Collectors;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.UtilisateurRepository;
`;

if (!content.includes('import java.security.Principal;')) {
    content = content.replace('import java.util.List;', 'import java.util.List;\n' + imports);
}

// Add UtilisateurRepository injection
if (!content.includes('UtilisateurRepository utilisateurRepository;')) {
    content = content.replace('private final PlatService platService;', 'private final PlatService platService;\n    private final UtilisateurRepository utilisateurRepository;');
    content = content.replace('OrderService orderService, PlatService platService)', 'OrderService orderService, PlatService platService, UtilisateurRepository utilisateurRepository)');
    content = content.replace('this.platService = platService;', 'this.platService = platService;\n        this.utilisateurRepository = utilisateurRepository;');
}

// Replace getAllOrders
const newGetAllOrders = `
    @GetMapping("/orders")
    public List<Commande> getAllOrders(Principal principal) {
        Utilisateur user = utilisateurRepository.findByEmail(principal.getName()).orElseThrow();
        List<Commande> allOrders = orderService.getAllOrders();
        
        if (user.getRole() == Utilisateur.Role.ADMIN) {
            return allOrders;
        }
        
        return allOrders.stream()
                .filter(c -> c.getRestaurant() != null && c.getRestaurant().getName().equals(user.getRestaurantAssigne()))
                .collect(Collectors.toList());
    }
`;

content = content.replace(/@GetMapping\("\/orders"\)[\s\S]*?public List<Commande> getAllOrders\(\) \{[\s\S]*?return orderService\.getAllOrders\(\);[\s\S]*?\}/, newGetAllOrders.trim());

fs.writeFileSync(file, content);
