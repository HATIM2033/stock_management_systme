<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'telephone',
        'email',
        'adresse',
        'ville',
        'pays',
        'code_postal',
    ];

    /**
     * Get the produits for the fournisseur.
     */
    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    /**
     * Count the number of products from this supplier.
     *
     * @return int
     */
    public function countProducts()
    {
        return $this->produits()->count();
    }
}
