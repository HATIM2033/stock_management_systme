<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VenteController extends Controller
{
    /**
     * Display a listing of the ventes.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Vente::with('user', 'produit');

        // Filter by user role
        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }

        // Filter by produit_id if provided
        if ($request->has('produit_id')) {
            $query->where('produit_id', $request->produit_id);
        }

        // ✅ Order by newest first
        $ventes = $query->orderBy('date_vente', 'desc')
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json($ventes);
    }

    /**
     * Store a newly created vente in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1',
            'prix_unitaire' => 'required|numeric|min:0',
            'remise' => 'nullable|numeric|min:0|max:99999',
            'numero_facture' => 'nullable|string|max:255|unique:ventes,numero_facture',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $produit = Produit::findOrFail($request->produit_id);

        // Check stock availability
        if ($produit->quantite_stock < $request->quantite) {
            return response()->json([
                'message' => 'Stock insuffisant',
                'available_stock' => $produit->quantite_stock,
                'requested_quantity' => $request->quantite
            ], 400);
        }

        // Calculate total
        $remise = $request->remise ?? 0;
        $prix_total = ($request->prix_unitaire * $request->quantite) - $remise;

        // Create vente
        $vente = Vente::create([
            'user_id' => $request->user()->id,
            'produit_id' => $request->produit_id,
            'quantite' => $request->quantite,
            'prix_unitaire' => $request->prix_unitaire,
            'prix_total' => $prix_total,
            'remise' => $remise,
            'date_vente' => now(),
            'numero_facture' => $request->numero_facture,
        ]);

        // Decrement stock
        $produit->decrementStock($request->quantite);
        $produit->refresh();

        // Create alert if low stock
        if ($produit->isLowStock()) {
            $type = $produit->quantite_stock <= 2 ? 'critique' : 'attention';
            
            Alerte::create([
                'produit_id' => $produit->id,
                'message' => "Stock faible pour {$produit->nom}. Restant: {$produit->quantite_stock} unités",
                'type' => $type,
                'lu' => 0,
            ]);
        }

        // Load relationships
        $vente->load('user', 'produit');
        $vente->remaining_stock = $produit->quantite_stock;

        return response()->json($vente, 201);
    }

    /**
     * Display the specified vente.
     */
    public function show($id)
    {
        $vente = Vente::with('user', 'produit')->findOrFail($id);
        return response()->json($vente);
    }

    /**
     * Remove the specified vente from storage.
     */
    public function destroy($id)
    {
        $vente = Vente::findOrFail($id);
        $produit = $vente->produit;

        // Restore stock
        $produit->incrementStock($vente->quantite);
        
        // Delete vente
        $vente->delete();

        return response()->json([
            'message' => 'Vente supprimée et stock restauré',
            'restored_quantity' => $vente->quantite
        ]);
    }
}