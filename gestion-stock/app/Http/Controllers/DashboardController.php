<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use App\Models\Categorie;
use App\Models\Produit;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get comprehensive dashboard statistics.
     */
    public function stats(Request $request)
    {
        try {
            $now = now();
            $today = $now->toDateString();
            $monthStart = $now->copy()->startOfMonth()->toDateString();

            // 1. Total produits
            $total_produits = Produit::count();

            // 2. Total ventes today
            $total_ventes_today = Vente::whereDate('date_vente', $today)->sum('prix_total');

            // 3. Total ventes this month
            $total_ventes_month = Vente::whereDate('date_vente', '>=', $monthStart)->sum('prix_total');

            // 4. Chiffre d'affaires total
            $chiffre_affaires_total = Vente::sum('prix_total');

            // 5. Total alertes non lues
            $total_alertes = Alerte::where('is_read', false)->count();

            // 6. Total utilisateurs
            $total_users = User::count();

            // 7. Ventes du dernier mois (30 jours)
            $ventes_last_7_days = Vente::selectRaw('DATE(date_vente) as date, SUM(prix_total) as total')
                ->whereDate('date_vente', '>=', $now->copy()->subDays(29)->toDateString())
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'date'  => $item->date,
                        'total' => (float) $item->total,
                    ];
                });

            // 8. Top 5 produits les plus vendus
            $top_products = Vente::selectRaw('
                    produits.nom as product_name,
                    categories.nom as category_name,
                    SUM(ventes.quantite) as total_quantity,
                    SUM(ventes.prix_total) as total_revenue
                ')
                ->join('produits', 'ventes.produit_id', '=', 'produits.id')
                ->join('categories', 'produits.categorie_id', '=', 'categories.id')
                ->groupBy('produits.id', 'produits.nom', 'categories.nom')
                ->orderBy('total_quantity', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'product_name'  => $item->product_name,
                        'category_name' => $item->category_name,
                        'total_quantity' => (int) $item->total_quantity,
                        'total_revenue'  => (float) $item->total_revenue,
                    ];
                });

            // 9. Produits à faible stock
            $low_stock_products = Produit::selectRaw('
                    produits.nom as product_name,
                    produits.quantite_stock as current_stock,
                    produits.seuil_alerte,
                    categories.nom as category
                ')
                ->join('categories', 'produits.categorie_id', '=', 'categories.id')
                ->whereRaw('produits.quantite_stock <= produits.seuil_alerte')
                ->orderBy('produits.quantite_stock', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'product_name'  => $item->product_name,
                        'current_stock' => (int) $item->current_stock,
                        'seuil_alerte'  => (int) $item->seuil_alerte,
                        'category'      => $item->category,
                    ];
                });

            // 10. ✅ FIX: Alertes récentes non lues — limit 10 (machi 5), sort newest first
            $recent_alertes = Alerte::with('produit:id,nom')
                ->where('is_read', false)
                ->orderBy('created_at', 'desc')   // les plus récentes d'abord
                ->limit(10)                        // ✅ 10 au lieu de 5
                ->get()
                ->map(function ($alerte) {
                    return [
                        'id'           => $alerte->id,
                        'message'      => $alerte->message,
                        'type'         => $alerte->type,
                        'priority'     => $alerte->priority,   // ✅ inclure priority pour le frontend
                        'product_name' => $alerte->produit->nom ?? 'N/A',
                        'created_at'   => $alerte->created_at->toISOString(),
                    ];
                });

            // 11. Statistiques par catégorie
            $categories_stats = Categorie::selectRaw('
                    categories.nom as category_name,
                    COUNT(produits.id) as product_count,
                    SUM(produits.prix * produits.quantite_stock) as total_stock_value
                ')
                ->leftJoin('produits', 'categories.id', '=', 'produits.categorie_id')
                ->groupBy('categories.id', 'categories.nom')
                ->orderBy('category_name', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'category_name'    => $item->category_name,
                        'product_count'    => (int) $item->product_count,
                        'total_stock_value' => (float) ($item->total_stock_value ?? 0),
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => [
                    'total_produits'         => $total_produits,
                    'total_ventes_today'     => (float) $total_ventes_today,
                    'total_ventes_month'     => (float) $total_ventes_month,
                    'chiffre_affaires_total' => (float) $chiffre_affaires_total,
                    'total_alertes'          => $total_alertes,
                    'total_users'            => $total_users,
                    'ventes_last_7_days'     => $ventes_last_7_days,
                    'top_products'           => $top_products,
                    'low_stock_products'     => $low_stock_products,
                    'recent_alertes'         => $recent_alertes,
                    'categories_stats'       => $categories_stats,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}