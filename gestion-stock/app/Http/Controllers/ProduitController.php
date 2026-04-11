<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProduitController extends Controller
{
    /**
     * Display a listing of the produits.
     * ✅ Get ALL products without pagination
     */
    public function index()
    {
        $produits = Produit::with('categorie', 'fournisseur')
            ->orderBy('created_at', 'desc')
            ->get(); // ← Changed from paginate(20) to get()
        
        return response()->json($produits);
    }

    /**
     * Store a newly created produit in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'quantite_stock' => 'required|integer|min:0',
            'categorie_id' => 'required|exists:categories,id',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'seuil_alerte' => 'required|integer|min:1',
            'code_barre' => 'nullable|string|max:255|unique:produits,code_barre',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('produits', 'public');
            $data['image'] = $imagePath;
        }

        $produit = Produit::create($data);
        $produit->load('categorie', 'fournisseur');

        return response()->json($produit, 201);
    }

    /**
     * Display the specified produit.
     */
    public function show($id)
    {
        $produit = Produit::with('categorie', 'fournisseur')
            ->findOrFail($id);

        $produit->is_low_stock = $produit->isLowStock();

        return response()->json($produit);
    }

    /**
     * Update the specified produit in storage.
     */
    public function update(Request $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'prix' => 'sometimes|required|numeric|min:0',
            'quantite_stock' => 'sometimes|required|integer|min:0',
            'categorie_id' => 'sometimes|required|exists:categories,id',
            'fournisseur_id' => 'sometimes|required|exists:fournisseurs,id',
            'seuil_alerte' => 'sometimes|required|integer|min:1',
            'code_barre' => 'nullable|string|max:255|unique:produits,code_barre,' . $id,
            'image' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        if ($request->hasFile('image')) {
            if ($produit->image) {
                Storage::disk('public')->delete($produit->image);
            }
            $imagePath = $request->file('image')->store('produits', 'public');
            $data['image'] = $imagePath;
        }

        $produit->update($data);
        $produit->load('categorie', 'fournisseur');

        return response()->json($produit);
    }

    /**
     * Remove the specified produit from storage.
     */
    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);

        if ($produit->image) {
            Storage::disk('public')->delete($produit->image);
        }

        $produit->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Search products by name and filter by category or supplier.
     * ✅ Get ALL matching products
     */
    public function search(Request $request)
    {
        $query = Produit::with('categorie', 'fournisseur');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('nom', 'like', '%' . $search . '%');
        }

        if ($request->has('categorie_id')) {
            $query->where('categorie_id', $request->input('categorie_id'));
        }

        if ($request->has('fournisseur_id')) {
            $query->where('fournisseur_id', $request->input('fournisseur_id'));
        }

        $produits = $query->orderBy('created_at', 'desc')
            ->get(); // ← Changed from paginate(20) to get()
        
        return response()->json($produits);
    }
}