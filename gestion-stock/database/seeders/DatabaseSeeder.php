<?php

namespace Database\Seeders;

use App\Models\Alerte;
use App\Models\Categorie;
use App\Models\Fournisseur;
use App\Models\Produit;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::beginTransaction();
        
        try {
            // 1. USERS
            $this->seedUsers();
            
            // 2. CATEGORIES
            $categories = $this->seedCategories();
            
            // 3. FOURNISSEURS
            $fournisseurs = $this->seedFournisseurs();
            
            // 4. PRODUITS
            $produits = $this->seedProduits($categories, $fournisseurs);
            
            // 5. VENTES
            $this->seedVentes($produits);
            
            // 6. ALERTES
            $this->seedAlertes($produits);
            
            DB::commit();
            $this->command->info('Database seeded successfully!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Seeding failed: ' . $e->getMessage());
        }
    }

    private function seedUsers(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@stock.ma',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'User Test',
            'email' => 'user@stock.ma',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);
    }

    private function seedCategories(): array
    {
        $categoriesData = [
            ['nom' => 'Électronique', 'description' => 'Produits électroniques et informatiques', 'icon' => 'laptop'],
            ['nom' => 'Alimentation', 'description' => 'Produits alimentaires', 'icon' => 'food'],
            ['nom' => 'Vêtements', 'description' => 'Habits et accessoires', 'icon' => 'shirt'],
            ['nom' => 'Mobilier', 'description' => 'Meubles et décoration', 'icon' => 'chair'],
            ['nom' => 'Informatique', 'description' => 'Matériel informatique', 'icon' => 'computer'],
        ];

        $categories = [];
        foreach ($categoriesData as $data) {
            $categories[$data['nom']] = Categorie::create($data);
        }

        return $categories;
    }

    private function seedFournisseurs(): array
    {
        $fournisseursData = [
            ['nom' => 'Tech Store Maroc', 'email' => 'contact@techstore.ma', 'telephone' => '0522123456', 'ville' => 'Casablanca'],
            ['nom' => 'Dell Maroc', 'email' => 'info@dell.ma', 'telephone' => '0522987654', 'ville' => 'Casablanca'],
            ['nom' => 'Apple Store Morocco', 'email' => 'support@apple.ma', 'telephone' => '0522555777', 'ville' => 'Casablanca'],
            ['nom' => 'Samsung Electronics', 'email' => 'contact@samsung.ma', 'telephone' => '0522444888', 'ville' => 'Casablanca'],
        ];

        $fournisseurs = [];
        foreach ($fournisseursData as $data) {
            $fournisseurs[$data['nom']] = Fournisseur::create($data);
        }

        return $fournisseurs;
    }

    private function seedProduits(array $categories, array $fournisseurs): array
    {
        $produitsData = [
            // Good stock products (10)
            ['nom' => 'Laptop Dell XPS 15', 'description' => 'Ordinateur portable haute performance', 'prix' => 15000, 'quantite_stock' => 25, 'seuil_alerte' => 5, 'categorie' => 'Informatique', 'fournisseur' => 'Dell Maroc'],
            ['nom' => 'iPhone 15 Pro', 'description' => 'Smartphone dernière génération', 'prix' => 12000, 'quantite_stock' => 30, 'seuil_alerte' => 8, 'categorie' => 'Électronique', 'fournisseur' => 'Apple Store Morocco'],
            ['nom' => 'Samsung Galaxy S24', 'description' => 'Smartphone Android premium', 'prix' => 9500, 'quantite_stock' => 20, 'seuil_alerte' => 6, 'categorie' => 'Électronique', 'fournisseur' => 'Samsung Electronics'],
            ['nom' => 'Monitor 4K 27"', 'description' => 'Écran haute résolution', 'prix' => 3500, 'quantite_stock' => 15, 'seuil_alerte' => 4, 'categorie' => 'Informatique', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Clavier mécanique RGB', 'description' => 'Clavier gaming rétroéclairé', 'prix' => 850, 'quantite_stock' => 40, 'seuil_alerte' => 10, 'categorie' => 'Informatique', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'T-shirt Premium', 'description' => 'T-shirt coton bio', 'prix' => 250, 'quantite_stock' => 100, 'seuil_alerte' => 20, 'categorie' => 'Vêtements', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Jean Slim Fit', 'description' => 'Jean moderne confortable', 'prix' => 450, 'quantite_stock' => 60, 'seuil_alerte' => 15, 'categorie' => 'Vêtements', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Chaise de bureau ergonomique', 'description' => 'Chaise confortable pour travail', 'prix' => 1200, 'quantite_stock' => 18, 'seuil_alerte' => 5, 'categorie' => 'Mobilier', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Table en bois massif', 'description' => 'Table de salle à manger', 'prix' => 3500, 'quantite_stock' => 8, 'seuil_alerte' => 3, 'categorie' => 'Mobilier', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Pack d\'eau minérale 6x1.5L', 'description' => 'Eau de source naturelle', 'prix' => 35, 'quantite_stock' => 200, 'seuil_alerte' => 50, 'categorie' => 'Alimentation', 'fournisseur' => 'Tech Store Maroc'],
            
            // Low stock products (5)
            ['nom' => 'iPad Air', 'description' => 'Tablette Apple performante', 'prix' => 6500, 'quantite_stock' => 8, 'seuil_alerte' => 8, 'categorie' => 'Électronique', 'fournisseur' => 'Apple Store Morocco'],
            ['nom' => 'Souris gaming wireless', 'description' => 'Souris sans fil haute précision', 'prix' => 450, 'quantite_stock' => 6, 'seuil_alerte' => 6, 'categorie' => 'Informatique', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Robe d\'été', 'description' => 'Robe légère et élégante', 'prix' => 650, 'quantite_stock' => 10, 'seuil_alerte' => 10, 'categorie' => 'Vêtements', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Lampe de bureau LED', 'description' => 'Lampe ajustable moderne', 'prix' => 280, 'quantite_stock' => 5, 'seuil_alerte' => 5, 'categorie' => 'Mobilier', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Café en grains 1kg', 'description' => 'Café arabica bio', 'prix' => 120, 'quantite_stock' => 15, 'seuil_alerte' => 15, 'categorie' => 'Alimentation', 'fournisseur' => 'Tech Store Maroc'],
            
            // Very low stock products (5)
            ['nom' => 'MacBook Pro 16"', 'description' => 'Ordinateur portable professionnel', 'prix' => 18000, 'quantite_stock' => 2, 'seuil_alerte' => 5, 'categorie' => 'Informatique', 'fournisseur' => 'Apple Store Morocco'],
            ['nom' => 'Apple Watch Ultra', 'description' => 'Montre connectée sport', 'prix' => 5500, 'quantite_stock' => 1, 'seuil_alerte' => 3, 'categorie' => 'Électronique', 'fournisseur' => 'Apple Store Morocco'],
            ['nom' => 'Casque audio Bluetooth', 'description' => 'Casque sans fil premium', 'prix' => 1200, 'quantite_stock' => 2, 'seuil_alerte' => 4, 'categorie' => 'Électronique', 'fournisseur' => 'Samsung Electronics'],
            ['nom' => 'Chemise blanche', 'description' => 'Chemise classique', 'prix' => 350, 'quantite_stock' => 1, 'seuil_alerte' => 5, 'categorie' => 'Vêtements', 'fournisseur' => 'Tech Store Maroc'],
            ['nom' => 'Bureau moderne', 'description' => 'Bureau avec rangements', 'prix' => 2200, 'quantite_stock' => 2, 'seuil_alerte' => 3, 'categorie' => 'Mobilier', 'fournisseur' => 'Tech Store Maroc'],
        ];

        $produits = [];
        foreach ($produitsData as $index => $data) {
            $produit = Produit::create([
                'nom' => $data['nom'],
                'description' => $data['description'],
                'prix' => $data['prix'],
                'quantite_stock' => $data['quantite_stock'],
                'seuil_alerte' => $data['seuil_alerte'],
                'categorie_id' => $categories[$data['categorie']]->id,
                'fournisseur_id' => $fournisseurs[$data['fournisseur']]->id,
                'code_barre' => 'PROD' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
            ]);
            $produits[] = $produit;
        }

        return $produits;
    }

    private function seedVentes(array $produits): void
    {
        $users = User::all();
        $ventesData = [];
        
        for ($i = 1; $i <= 15; $i++) {
            $produit = $produits[array_rand($produits)];
            $quantite = rand(1, min(5, $produit->quantite_stock));
            $remise = rand(0, 5) * 50; // Remise de 0, 50, 100, 150, 200, 250 DH
            $prix_total = ($produit->prix * $quantite) - $remise;
            
            $ventesData[] = [
                'user_id' => $users->random()->id,
                'produit_id' => $produit->id,
                'quantite' => $quantite,
                'prix_unitaire' => $produit->prix,
                'prix_total' => $prix_total,
                'remise' => $remise,
                'date_vente' => now()->subDays(rand(0, 7))->subHours(rand(0, 23))->subMinutes(rand(0, 59)),
                'numero_facture' => 'FACT-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Vente::insert($ventesData);
    }

    private function seedAlertes(array $produits): void
    {
        $alertesData = [];
        $lowStockProducts = array_filter($produits, fn($p) => $p->quantite_stock <= $p->seuil_alerte);
        
        $alertIndex = 0;
        foreach ($lowStockProducts as $produit) {
            if ($alertIndex >= 8) break;
            
            $isCritique = $produit->quantite_stock <= 2;
            $type = $isCritique ? 'critique' : 'attention';
            $priority = $isCritique ? 1 : 2;
            $isRead = $alertIndex < 3; // 3 first alerts as read
            
            $alertesData[] = [
                'produit_id' => $produit->id,
                'message' => "Stock faible pour {$produit->nom}. Restant: {$produit->quantite_stock} unités (Seuil: {$produit->seuil_alerte})",
                'type' => $type,
                'priority' => $priority,
                'is_read' => $isRead,
                'created_at' => now()->subHours(rand(1, 72)),
                'updated_at' => now(),
            ];
            
            $alertIndex++;
        }

        Alerte::insert($alertesData);
    }
}
