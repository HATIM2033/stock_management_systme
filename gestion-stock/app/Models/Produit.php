<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'description',
        'prix',
        'quantite_stock',
        'image',
        'categorie_id',
        'fournisseur_id',
        'seuil_alerte',
        'code_barre',
    ];

    /**
     * Get the categorie that owns the produit.
     */
    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    /**
     * Get the fournisseur that owns the produit.
     */
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    /**
     * Get the ventes for the produit.
     */
    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }

    /**
     * Get the alertes for the produit.
     */
    public function alertes()
    {
        return $this->hasMany(Alerte::class);
    }

    /**
     * Check if the product is low in stock.
     *
     * @return bool
     */
    public function isLowStock()
    {
        return $this->quantite_stock <= $this->seuil_alerte;
    }

    /**
     * Decrease the stock quantity.
     *
     * @param int $quantity
     * @return void
     */
    public function decrementStock($quantity)
    {
        $this->decrement('quantite_stock', $quantity);
    }

    /**
     * Increase the stock quantity.
     *
     * @param int $quantity
     * @return void
     */
    public function incrementStock($quantity)
    {
        $this->increment('quantite_stock', $quantity);
    }
}
