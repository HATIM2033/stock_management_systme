<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerte extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'produit_id',
        'message',
        'type',
        'is_read',
        'priority',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Get the produit that owns the alerte.
     */
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Mark the alert as read.
     *
     * @return void
     */
    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    /**
     * Mark the alert as unread.
     *
     * @return void
     */
    public function markAsUnread()
    {
        $this->update(['is_read' => false]);
    }
}
