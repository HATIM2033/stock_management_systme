<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
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
        'icon',
    ];

    /**
     * Get the produits for the categorie.
     */
    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    /**
     * Count the number of products in this category.
     *
     * @return int
     */
    public function countProducts()
    {
        return $this->produits()->count();
    }
}
