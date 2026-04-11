<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the fournisseurs.
     */
    public function index()
    {
        $fournisseurs = Fournisseur::withCount('produits')->get();
        return response()->json($fournisseurs);
    }

    /**
     * Store a newly created fournisseur in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:fournisseurs,email',
            'adresse' => 'nullable|string|max:500',
            'ville' => 'nullable|string|max:255',
            'pays' => 'nullable|string|max:255',
            'code_postal' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $fournisseur = Fournisseur::create($request->all());
        return response()->json($fournisseur, 201);
    }

    /**
     * Display the specified fournisseur.
     */
    public function show($id)
    {
        $fournisseur = Fournisseur::with('produits')->findOrFail($id);
        return response()->json($fournisseur);
    }

    /**
     * Update the specified fournisseur in storage.
     */
    public function update(Request $request, $id)
    {
        $fournisseur = Fournisseur::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:fournisseurs,email,' . $id,
            'adresse' => 'nullable|string|max:500',
            'ville' => 'nullable|string|max:255',
            'pays' => 'nullable|string|max:255',
            'code_postal' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $fournisseur->update($request->all());
        return response()->json($fournisseur);
    }

    /**
     * Remove the specified fournisseur from storage.
     */
    public function destroy($id)
    {
        $fournisseur = Fournisseur::findOrFail($id);

        if ($fournisseur->produits()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete supplier with associated products'
            ], 400);
        }

        $fournisseur->delete();
        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}
