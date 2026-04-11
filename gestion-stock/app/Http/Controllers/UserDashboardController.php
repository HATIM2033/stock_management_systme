<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserDashboardController extends Controller
{
    /**
     * Get user-specific dashboard stats
     */
    public function stats(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $now = Carbon::now();
            $today = $now->toDateString();
            $weekStart = $now->copy()->startOfWeek()->toDateString();
            $monthStart = $now->copy()->startOfMonth()->toDateString();
            
            // ✅ MY SALES - Today
            $ventes_today = Vente::where('user_id', $user->id)
                ->whereDate('date_vente', $today)
                ->count();
            
            $ca_today = Vente::where('user_id', $user->id)
                ->whereDate('date_vente', $today)
                ->sum('prix_total');
            
            // ✅ MY SALES - This Week
            $ventes_week = Vente::where('user_id', $user->id)
                ->whereBetween('date_vente', [$weekStart, $today])
                ->count();
            
            $ca_week = Vente::where('user_id', $user->id)
                ->whereBetween('date_vente', [$weekStart, $today])
                ->sum('prix_total');
            
            // ✅ MY SALES - This Month
            $ventes_month = Vente::where('user_id', $user->id)
                ->whereBetween('date_vente', [$monthStart, $today])
                ->count();
            
            $ca_month = Vente::where('user_id', $user->id)
                ->whereBetween('date_vente', [$monthStart, $today])
                ->sum('prix_total');
            
            // ✅ TOTAL SALES - All time
            $total_ventes = Vente::where('user_id', $user->id)->count();
            $total_ca = Vente::where('user_id', $user->id)->sum('prix_total');
            
            // ✅ AVERAGE SALE
            $average_sale = $total_ventes > 0 ? $total_ca / $total_ventes : 0;
            
            // ✅ MY BEST SELLING PRODUCTS
            $my_top_products = DB::table('ventes')
                ->select(
                    'produits.id',
                    'produits.nom',
                    'produits.image',
                    DB::raw('SUM(ventes.quantite) as total_quantite'),
                    DB::raw('SUM(ventes.prix_total) as total_revenue'),
                    DB::raw('COUNT(ventes.id) as nombre_ventes')
                )
                ->join('produits', 'ventes.produit_id', '=', 'produits.id')
                ->where('ventes.user_id', $user->id)
                ->groupBy('produits.id', 'produits.nom', 'produits.image')
                ->orderBy('total_quantite', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->id,
                        'nom' => $item->nom,
                        'image' => $item->image,
                        'total_quantite' => (int) $item->total_quantite,
                        'total_revenue' => (float) $item->total_revenue,
                        'nombre_ventes' => (int) $item->nombre_ventes,
                    ];
                });
            
            // ✅ MY RECENT SALES
            $my_recent_sales = Vente::with(['produit:id,nom,image'])
                ->where('user_id', $user->id)
                ->orderBy('date_vente', 'desc')
                ->limit(10)
                ->get()
                ->map(function($vente) {
                    return [
                        'id' => $vente->id,
                        'produit_nom' => $vente->produit->nom ?? 'N/A',
                        'produit_image' => $vente->produit->image ?? null,
                        'quantite' => $vente->quantite,
                        'prix_unitaire' => $vente->prix_unitaire,
                        'prix_total' => $vente->prix_total,
                        'remise' => $vente->remise,
                        'date_vente' => $vente->date_vente,
                    ];
                });
            
            // ✅ SALES CHART - Last 30 days
            $sales_chart = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = $now->copy()->subDays($i);
                $dateStr = $date->toDateString();
                
                $dailySales = Vente::where('user_id', $user->id)
                    ->whereDate('date_vente', $dateStr)
                    ->sum('prix_total');
                
                $dailyCount = Vente::where('user_id', $user->id)
                    ->whereDate('date_vente', $dateStr)
                    ->count();
                
                $sales_chart[] = [
                    'date' => $date->format('d M'),
                    'full_date' => $dateStr,
                    'revenue' => (float) $dailySales,
                    'count' => $dailyCount,
                ];
            }
            
            // ✅ PERFORMANCE COMPARISON - This month vs last month
            $lastMonthStart = $now->copy()->subMonth()->startOfMonth()->toDateString();
            $lastMonthEnd = $now->copy()->subMonth()->endOfMonth()->toDateString();
            
            $last_month_ventes = Vente::where('user_id', $user->id)
                ->whereBetween('date_vente', [$lastMonthStart, $lastMonthEnd])
                ->count();
            
            $last_month_ca = Vente::where('user_id', $user->id)
                ->whereBetween('date_vente', [$lastMonthStart, $lastMonthEnd])
                ->sum('prix_total');
            
            // Calculate percentage change
            $ventes_change = $last_month_ventes > 0 
                ? (($ventes_month - $last_month_ventes) / $last_month_ventes) * 100 
                : 0;
            
            $ca_change = $last_month_ca > 0 
                ? (($ca_month - $last_month_ca) / $last_month_ca) * 100 
                : 0;
            
            // ✅ AVAILABLE PRODUCTS COUNT (for reference)
            $total_produits = Produit::count();
            $low_stock_count = Produit::where(function($query) {
                $query->whereColumn('quantite_stock', '<=', 'seuil_alerte')
                      ->orWhere('quantite_stock', '<=', 5);
            })->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    // User info
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    
                    // Quick stats
                    'ventes_today' => $ventes_today,
                    'ca_today' => (float) $ca_today,
                    'ventes_week' => $ventes_week,
                    'ca_week' => (float) $ca_week,
                    'ventes_month' => $ventes_month,
                    'ca_month' => (float) $ca_month,
                    
                    // All-time stats
                    'total_ventes' => $total_ventes,
                    'total_ca' => (float) $total_ca,
                    'average_sale' => (float) $average_sale,
                    
                    // Performance
                    'last_month_ventes' => $last_month_ventes,
                    'last_month_ca' => (float) $last_month_ca,
                    'ventes_change_percent' => round($ventes_change, 1),
                    'ca_change_percent' => round($ca_change, 1),
                    
                    // Lists
                    'my_top_products' => $my_top_products,
                    'my_recent_sales' => $my_recent_sales,
                    
                    // Chart
                    'sales_chart_30_days' => $sales_chart,
                    
                    // Product info (for reference)
                    'total_produits_available' => $total_produits,
                    'low_stock_products' => $low_stock_count,
                ],
            ]);
            
        } catch (\Exception $e) {
            \Log::error('User Dashboard Error: ' . $e->getMessage());
            \Log::error('Line: ' . $e->getLine());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}