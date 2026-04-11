<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    /**
     * Display a listing of the alertes.
     */
    public function index(Request $request)
    {
        $query = Alerte::with('produit');

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        $alertes = $query->orderBy('priority', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($alertes);
    }

    /**
     * Display the specified alerte.
     */
    public function show($id)
    {
        $alerte = Alerte::with('produit')->findOrFail($id);
        return response()->json($alerte);
    }

    /**
     * Mark the specified alerte as read.
     */
    public function markAsRead($id)
    {
        $alerte = Alerte::findOrFail($id);
        $alerte->markAsRead();
        
        return response()->json(['message' => 'Alert marked as read']);
    }

    /**
     * Mark all unread alertes as read.
     */
    public function markAllAsRead()
    {
        Alerte::where('is_read', false)->update(['is_read' => true]);
        
        return response()->json(['message' => 'All alerts marked as read']);
    }

    /**
     * Remove the specified alerte from storage.
     */
    public function destroy($id)
    {
        $alerte = Alerte::findOrFail($id);
        $alerte->delete();
        
        return response()->json(['message' => 'Alert deleted successfully']);
    }
}
