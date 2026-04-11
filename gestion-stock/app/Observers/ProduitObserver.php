<?php

namespace App\Observers;

use App\Models\Alerte;
use App\Models\Produit;

class ProduitObserver
{
    /**
     * Mli produit kaytweld — check stock daba
     */
    public function created(Produit $produit): void
    {
        $this->checkAndCreateAlerte($produit);
    }

    /**
     * Mli produit ytweddet (quantite_stock tbeddel) — check
     */
    public function updated(Produit $produit): void
    {
        // Gha ila quantite_stock tbeddel — machi kol update
        if ($produit->wasChanged('quantite_stock')) {
            $this->checkAndCreateAlerte($produit);
        }
    }

    /**
     * Logic dyal check w création alerte
     */
    private function checkAndCreateAlerte(Produit $produit): void
    {
        // Ma3ndoch seuil_alerte — mashi
        if (is_null($produit->seuil_alerte)) {
            return;
        }

        // Stock mzal fo9 l-seuil — mashi
        if ($produit->quantite_stock > $produit->seuil_alerte) {
            return;
        }

        // Determiner type w priority
        if ($produit->quantite_stock <= 0) {
            $type     = 'critique';
            $priority = 1;
            $message  = "Rupture de stock pour {$produit->nom}. Stock actuel: 0 unité";
        } elseif ($produit->quantite_stock <= 2) {
            $type     = 'critique';
            $priority = 1;
            $message  = "Stock critique pour {$produit->nom}. Restant: {$produit->quantite_stock} unité(s)";
        } else {
            $type     = 'attention';
            $priority = 2;
            $message  = "Stock faible pour {$produit->nom}. Restant: {$produit->quantite_stock} unités (seuil: {$produit->seuil_alerte})";
        }

        // Vérifier si alerte non lue identique existe déjà — éviter les doublons
        $existingAlerte = Alerte::where('produit_id', $produit->id)
            ->where('type', $type)
            ->where('is_read', false)
            ->exists();

        if ($existingAlerte) {
            return; // Doublon — mashi
        }

        // Créer l'alerte
        Alerte::create([
            'produit_id' => $produit->id,
            'message'    => $message,
            'type'       => $type,
            'priority'   => $priority,
            'is_read'    => false,
        ]);
    }
}