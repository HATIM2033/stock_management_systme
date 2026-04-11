<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategorieController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $categories = Categorie::withCount('produits')->get();
        return response()->json($categories);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255|unique:categories,nom',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categorie = Categorie::create($request->all());
        return response()->json($categorie, 201);
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        $categorie = Categorie::with('produits')->findOrFail($id);
        return response()->json($categorie);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, $id)
    {
        $categorie = Categorie::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255|unique:categories,nom,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categorie->update($request->all());
        return response()->json($categorie);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy($id)
    {
        $categorie = Categorie::findOrFail($id);

        if ($categorie->produits()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with associated products'
            ], 400);
        }

        $categorie->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
