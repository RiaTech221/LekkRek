package com.lekkrek.config;

import com.lekkrek.entity.*;
import com.lekkrek.repository.CommandeRepository;
import com.lekkrek.repository.PartnerRequestRepository;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import com.lekkrek.repository.PartnerRequestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    @Transactional
    CommandLineRunner initDatabase(RestaurantRepository restoRepo, 
                                   PlatRepository platRepo, 
                                   UtilisateurRepository userRepo, 
                                   CommandeRepository commandeRepo,
                                   PartnerRequestRepository partnerRepo,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            
            if (userRepo.count() > 0 && restoRepo.count() >= 19) {
                System.out.println("Base de données déjà complète.");
                return;
            }

            // If users exist but not enough restaurants, add extras
            if (userRepo.count() > 0) {
                System.out.println("Ajout de données supplémentaires...");
                addExtraData(restoRepo, platRepo);
                return;
            }

            System.out.println("Initialisation du jeu de données...");
            
            // Nettoyage complet pour avoir un environnement de test parfait
            commandeRepo.deleteAll();
            platRepo.deleteAll();
            restoRepo.deleteAll();
            userRepo.deleteAll();
            partnerRepo.deleteAll();

            // 1. Administrateurs
            Utilisateur admin = new Utilisateur();
            admin.setNomComplet("Admin Principal");
            admin.setEmail("admin@lekkrek.com");
            admin.setMotDePasse(passwordEncoder.encode("password123"));
            admin.setRole(Utilisateur.Role.ADMIN);
            
            // 2. Opérateurs (Gérants de restaurants)
            Utilisateur op1 = new Utilisateur();
            op1.setNomComplet("Awa Ndiaye");
            op1.setEmail("awa@lekkrek.com");
            op1.setMotDePasse(passwordEncoder.encode("password123"));
            op1.setRole(Utilisateur.Role.OPERATEUR);

            Utilisateur op2 = new Utilisateur();
            op2.setNomComplet("Modou Fall");
            op2.setEmail("modou@lekkrek.com");
            op2.setMotDePasse(passwordEncoder.encode("password123"));
            op2.setRole(Utilisateur.Role.OPERATEUR);

            Utilisateur op3 = new Utilisateur();
            op3.setNomComplet("Fatou Diop");
            op3.setEmail("fatou@lekkrek.com");
            op3.setMotDePasse(passwordEncoder.encode("password123"));
            op3.setRole(Utilisateur.Role.OPERATEUR);

            userRepo.saveAll(Arrays.asList(admin, op1, op2, op3));

            // 3. Restaurants
            Restaurant r1 = new Restaurant(null, "La Fourchette", "Dakar - Almadies", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800", op1.getNomComplet(), true, 10.0, "Basic", null, null);
            Restaurant r2 = new Restaurant(null, "Saveurs de Ziguinchor", "Ziguinchor - Escale", "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800", op2.getNomComplet(), true, 10.0, "Basic", null, null);
            Restaurant r3 = new Restaurant(null, "Le Kassa Plage", "Cap Skirring", "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=800", op3.getNomComplet(), true, 10.0, "Basic", null, null);
            Restaurant r4 = new Restaurant(null, "Chez Loutcha", "Dakar - Plateau", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", op1.getNomComplet(), true, 10.0, "Basic", null, null);
            
            r1 = restoRepo.save(r1);
            r2 = restoRepo.save(r2);
            r3 = restoRepo.save(r3);
            r4 = restoRepo.save(r4);

            // 4. Plats
            // La Fourchette (R1)
            Plat p1 = createPlat("Thieboudienne Penda Mbaye", "Le plat national revisité avec du poisson frais et des légumes.", 3500.0, "https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&q=80&w=800", "dejeuner", r1);
            Plat p2 = createPlat("Yassa Poulet", "Poulet mariné au citron et oignons, servi avec du riz blanc.", 3000.0, "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800", "dejeuner", r1);
            Plat p3 = createPlat("Pastels au Poisson", "Beignets farcis au poisson avec sauce tomate épicée.", 1500.0, "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800", "gouter", r1);
            Plat p4 = createPlat("Burger Maison & Frites", "Burger de boeuf savoureux avec frites maison croustillantes.", 4000.0, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800", "fast food", r1);

            // Saveurs de Ziguinchor (R2)
            Plat p5 = createPlat("C'est Bon (Caldou)", "Poisson braisé sauce citronnée avec du riz.", 2500.0, "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800", "dejeuner", r2);
            Plat p6 = createPlat("Soupe Kandia", "Riz blanc accompagné d'une sauce onctueuse aux gombos et fruits de mer.", 3500.0, "https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&q=80&w=800", "dejeuner", r2);
            Plat p7 = createPlat("Thiéboudienne Diaga", "Riz au poisson avec boulettes de poisson.", 3000.0, "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800", "dejeuner", r2);

            // Le Kassa Plage (R3)
            Plat p8 = createPlat("Grillades de Fruits de Mer", "Assortiment de crevettes, calamars et poisson grillés.", 6000.0, "https://images.unsplash.com/photo-1599084942896-673ec90d0a5a?auto=format&fit=crop&q=80&w=800", "diner", r3);
            Plat p9 = createPlat("Jus de Bissap", "Boisson rafraîchissante à la fleur d'hibiscus.", 500.0, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800", "gouter", r3);
            Plat p10 = createPlat("Brochettes de Lotte", "Lotte marinée et grillée, accompagnée d'attiéké.", 4500.0, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800", "diner", r3);

            // Chez Loutcha (R4)
            Plat p11 = createPlat("Mafé Viande", "Sauce à la pâte d'arachide avec viande de bœuf tendre et légumes.", 2800.0, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800", "dejeuner", r4);
            Plat p12 = createPlat("Thiéré (Couscous Sénégalais)", "Couscous de mil avec sauce à la viande et aux légumes.", 3000.0, "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=800", "diner", r4);
            Plat p13 = createPlat("Nems au Poulet", "Nems croustillants servis avec une sauce aigre-douce.", 2000.0, "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=800", "gouter", r4);

            platRepo.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13));

            // 5. Commandes
            Commande c1 = new Commande();
            c1.setOrderNumber("CMD-1001");
            c1.setClientName("Cheikh Fall");
            c1.setClientPhone("771234567");
            c1.setClientAddress("Sicap Baobab");
            c1.setType(Commande.OrderType.LIVRAISON);
            c1.setStatus(Commande.OrderStatus.NOUVELLE);
            c1.setPaymentMethod(Commande.PaymentMethod.WAVE);
            c1.setPaymentStatus(Commande.PaymentStatus.PAYE);
            c1.setRestaurant(r1);
            CommandeItem ci1 = new CommandeItem();
            ci1.setCommande(c1);
            ci1.setPlat(p1);
            ci1.setQuantity(2);
            ci1.setUnitPrice(p1.getPrice());
            c1.getItems().add(ci1);
            c1.setTotalAmount(p1.getPrice() * 2);
            commandeRepo.save(c1);

            Commande c2 = new Commande();
            c2.setOrderNumber("CMD-1002");
            c2.setClientName("Aminata Sow");
            c2.setClientPhone("762345678");
            c2.setClientAddress("Point E");
            c2.setType(Commande.OrderType.LIVRAISON);
            c2.setStatus(Commande.OrderStatus.PRETE);
            c2.setPaymentMethod(Commande.PaymentMethod.ORANGE_MONEY);
            c2.setPaymentStatus(Commande.PaymentStatus.PAYE);
            c2.setRestaurant(r1);
            CommandeItem ci2 = new CommandeItem();
            ci2.setCommande(c2);
            ci2.setPlat(p2);
            ci2.setQuantity(1);
            ci2.setUnitPrice(p2.getPrice());
            c2.getItems().add(ci2);
            c2.setTotalAmount(p2.getPrice());
            commandeRepo.save(c2);

            Commande c3 = new Commande();
            c3.setOrderNumber("CMD-1003");
            c3.setClientName("Moussa Diagne");
            c3.setClientPhone("783456789");
            c3.setClientAddress("Plateau");
            c3.setType(Commande.OrderType.EMPORTER);
            c3.setStatus(Commande.OrderStatus.LIVREE);
            c3.setPaymentMethod(Commande.PaymentMethod.SUR_PLACE);
            c3.setPaymentStatus(Commande.PaymentStatus.PAYE);
            c3.setRestaurant(r4);
            CommandeItem ci3 = new CommandeItem();
            ci3.setCommande(c3);
            ci3.setPlat(p7);
            ci3.setQuantity(3);
            ci3.setUnitPrice(p7.getPrice());
            c3.getItems().add(ci3);
            c3.setTotalAmount(p7.getPrice() * 3);
            commandeRepo.save(c3);

            // 6. Demandes de Partenariat (Partner Requests)
            PartnerRequest pr1 = new PartnerRequest();
            pr1.setNomRestaurant("Le Ndiambour");
            pr1.setNomContact("Saliou Diop");
            pr1.setTelephone("778889900");
            pr1.setVille("Dakar");
            pr1.setStatus("PENDING");
            
            PartnerRequest pr2 = new PartnerRequest();
            pr2.setNomRestaurant("Bignona Fast Food");
            pr2.setNomContact("Mariama Bâ");
            pr2.setTelephone("769998877");
            pr2.setVille("Bignona");
            pr2.setStatus("PENDING");

            partnerRepo.saveAll(Arrays.asList(pr1, pr2));
        };
    }

    private Plat createPlat(String name, String desc, Double price, String img, String moment, Restaurant r) {
        Plat p = new Plat();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setImage(img);
        p.setMoment(moment);
        p.setStatus(Plat.DishStatus.DISPO);
        p.setRestaurant(r);
        return p;
    }

    private void addExtraData(com.lekkrek.repository.RestaurantRepository restoRepo, com.lekkrek.repository.PlatRepository platRepo) {
        // 5 nouveaux restaurants
        Restaurant r5 = restoRepo.save(new Restaurant(null, "Teranga Palace", "Dakar - Mermoz", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800", "Ibrahima Seck", true, 12.0, "Premium", null, null));
        Restaurant r6 = restoRepo.save(new Restaurant(null, "Le Baobab d'Or", "Thiès - Centre", "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=800", "Rokhaya Gueye", true, 8.0, "Basic", null, null));
        Restaurant r7 = restoRepo.save(new Restaurant(null, "Savana Lounge", "Saint-Louis - Nord", "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800", "Omar Sarr", true, 10.0, "Basic", null, null));
        Restaurant r8 = restoRepo.save(new Restaurant(null, "Océan Bleu", "Mbour - Plage", "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&q=80&w=800", "Ndéye Mbaye", true, 15.0, "Premium", null, null));
        Restaurant r9 = restoRepo.save(new Restaurant(null, "Keur Mame", "Kaolack - Médina", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", "Pape Diallo", true, 10.0, "Basic", null, null));

        // 10 nouveaux plats répartis dans les nouveaux restaurants
        platRepo.saveAll(java.util.Arrays.asList(
            createPlat("Poulet DG", "Poulet sauté avec plantains frits, carottes et champignons.", 4500.0, "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800", "dejeuner", r5),
            createPlat("Ceebu Yapp", "Riz à la viande façon sénégalaise avec légumes frais.", 3200.0, "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800", "dejeuner", r5),
            createPlat("Thiébou Guinar", "Riz au poulet savamment épicé, servi avec des légumes.", 3000.0, "https://images.unsplash.com/photo-1587765387771-e0f6b14a3b81?auto=format&fit=crop&q=80&w=800", "dejeuner", r6),
            createPlat("Domoda Arachide", "Riz gras accompagné d'une riche sauce à l'arachide.", 2800.0, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800", "diner", r6),
            createPlat("Attiéké Poisson Braisé", "Semoule de manioc avec poisson braisé et sauce tomate.", 2500.0, "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800", "dejeuner", r7),
            createPlat("Salade de Fruits Tropicaux", "Mangue, ananas, papaye et goyave fraîchement coupés.", 1200.0, "https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&q=80&w=800", "dessert", r7),
            createPlat("Pizza Africaine", "Base tomate, poulet grillé, poivrons et fromage fondu.", 5000.0, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800", "diner", r8),
            createPlat("Bissap Glacé Spécial", "Infusion d'hibiscus fraîche avec menthe et gingembre.", 600.0, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800", "boisson", r8),
            createPlat("Ndolé Crevettes", "Feuilles de ndolé mijotées avec crevettes et bœuf grillé.", 3800.0, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800", "diner", r9),
            createPlat("Tarte Caramel Beurre Salé", "Tarte maison au caramel salé avec noix de cajou.", 1500.0, "https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&q=80&w=800", "dessert", r9)
        ));

        System.out.println("✅ 5 restaurants et 10 plats supplémentaires ajoutés !");

        // Ajout de 10 restaurants supplémentaires
        if (restoRepo.count() < 19) {
            restoRepo.saveAll(java.util.Arrays.asList(
                new Restaurant(null, "Le Djoloff", "Dakar - Fann", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", "Amadou Sy", true, 10.0, "Basic", null, null),
                new Restaurant(null, "Escale Gourmande", "Saly Portudal", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800", "Fatou Ndiaye", true, 15.0, "Premium", null, null),
                new Restaurant(null, "La Kora", "Ziguinchor - Centre", "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=800", "Moussa Sane", true, 8.0, "Basic", null, null),
                new Restaurant(null, "Au Fil de l'Eau", "Saint-Louis - Île", "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=800", "Ousmane Fall", true, 12.0, "Premium", null, null),
                new Restaurant(null, "Le Ngor Diarama", "Dakar - Ngor", "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&q=80&w=800", "Alioune Diop", true, 10.0, "Basic", null, null),
                new Restaurant(null, "Bistrot Casamançais", "Cap Skirring", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800", "Aïssatou Ba", true, 15.0, "Premium", null, null),
                new Restaurant(null, "Chez Binta", "Touba - Mosquée", "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800", "Binta Diagne", true, 8.0, "Basic", null, null),
                new Restaurant(null, "Le Phare des Mamelles", "Dakar - Ouakam", "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800", "Cheikh Lo", true, 12.0, "Premium", null, null),
                new Restaurant(null, "Oasis de Lompoul", "Désert de Lompoul", "https://images.unsplash.com/photo-1520209268518-aec60b8bb5ca?auto=format&fit=crop&q=80&w=800", "Mamadou Thiam", true, 10.0, "Basic", null, null),
                new Restaurant(null, "La Calebasse", "Tambacounda - Escale", "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&q=80&w=800", "Sokhna Faye", true, 15.0, "Premium", null, null)
            ));
            System.out.println("✅ 10 restaurants additionnels ajoutés !");
        }
    }
}
