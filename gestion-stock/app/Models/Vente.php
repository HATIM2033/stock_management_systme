<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vente extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'prix_total',
        'remise',
        'date_vente',
        'numero_facture',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_vente' => 'datetime',
    ];

    /**
     * Get the user that owns the vente.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the produit that owns the vente.
     */
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Calculate the total price after discount.
     *
     * @return float
     */
    public function calculateTotal()
    {
        return ($this->prix_unitaire * $this->quantite) - $this->remise;
    }
}
