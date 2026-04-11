<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\VenteController;
use App\Http\Controllers\AlerteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\Auth\RegisterController;

// ==================== PUBLIC ROUTES ====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes (outside auth:sanctum middleware)
Route::post('/auth/register', [RegisterController::class, 'register']);
Route::post('/auth/check-email', [RegisterController::class, 'checkEmail']);

// ==================== PROTECTED ROUTES ====================
Route::middleware('auth:sanctum')->group(function () {
    
    // ✅ User-specific dashboard
    Route::get('/dashboard/user/stats', [UserDashboardController::class, 'stats']);
    
    // Auth Routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard Route
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    // Categories Routes (Admin only for CUD)
    Route::get('/categories', [CategorieController::class, 'index']);
    Route::get('/categories/{id}', [CategorieController::class, 'show']);
    Route::post('/categories', [CategorieController::class, 'store'])->middleware('admin');
    Route::put('/categories/{id}', [CategorieController::class, 'update'])->middleware('admin');
    Route::delete('/categories/{id}', [CategorieController::class, 'destroy'])->middleware('admin');
    
    // Fournisseurs Routes (Admin only for CUD)
    Route::get('/fournisseurs', [FournisseurController::class, 'index']);
    Route::get('/fournisseurs/{id}', [FournisseurController::class, 'show']);
    Route::post('/fournisseurs', [FournisseurController::class, 'store'])->middleware('admin');
    Route::put('/fournisseurs/{id}', [FournisseurController::class, 'update'])->middleware('admin');
    Route::delete('/fournisseurs/{id}', [FournisseurController::class, 'destroy'])->middleware('admin');
    
    // Produits Routes (Admin only for CUD)
    Route::get('/produits', [ProduitController::class, 'index']);
    Route::get('/produits/search', [ProduitController::class, 'search']);
    Route::get('/produits/{id}', [ProduitController::class, 'show']);
    Route::post('/produits', [ProduitController::class, 'store'])->middleware('admin');
    Route::put('/produits/{id}', [ProduitController::class, 'update'])->middleware('admin');
    Route::post('/produits/{id}', [ProduitController::class, 'update'])->middleware('admin'); // For form-data with _method
    Route::delete('/produits/{id}', [ProduitController::class, 'destroy'])->middleware('admin');
    
    // Ventes Routes
    Route::get('/ventes', [VenteController::class, 'index']);
    Route::post('/ventes', [VenteController::class, 'store']);
    Route::get('/ventes/{id}', [VenteController::class, 'show']);
    Route::delete('/ventes/{id}', [VenteController::class, 'destroy'])->middleware('admin');
    
    // Alertes Routes (Admin only)
    Route::get('/alertes', [AlerteController::class, 'index'])->middleware('admin');
    Route::get('/alertes/{id}', [AlerteController::class, 'show'])->middleware('admin');
    Route::put('/alertes/{id}/read', [AlerteController::class, 'markAsRead'])->middleware('admin');
    Route::put('/alertes/read-all', [AlerteController::class, 'markAllAsRead'])->middleware('admin');
    Route::delete('/alertes/{id}', [AlerteController::class, 'destroy'])->middleware('admin');

        // Users routes (admin only)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});