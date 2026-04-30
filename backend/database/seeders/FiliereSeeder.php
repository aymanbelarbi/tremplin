<?php

namespace Database\Seeders;

use App\Models\Filiere;
use Illuminate\Database\Seeder;

class FiliereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            [
                'parent' => 'Technicien Spécialisé',
                'options' => [
                    'Infrastructure Digitale',
                    'Infrastructure Digitale option Systèmes et Réseaux',
                    'Infrastructure Digitale option Cyber sécurité',
                    'Développement Digital',
                    'Développement Digital option Web Full Stack',
                    'Electromécanique des Systèmes Automatisées',
                    'Génie électrique option Electromécanique des Systèmes Automatisés',
                    'Gestion des Entreprises',
                    'Gestion des Entreprises option Comptabilité et Finance',
                    'Gestion des Entreprises option Office Manager',
                    'Gestion des Entreprises option Commerce et Marketing',
                    '(CDS) Technicien Spécialisé en Gestion des Entreprises',
                ],
            ],
            [
                'parent' => 'Technicien',
                'options' => [
                    'Assistant Administratif',
                    'Assistant Administratif option Commerce',
                    'Assistant Administratif option Gestion',
                    'Arts culinaires',
                ],
            ],
            [
                'parent' => 'Qualifié',
                'options' => [
                    "Electricité d'Entretien Industriel",
                ],
            ],
        ];

        foreach ($groups as $group) {
            foreach ($group['options'] as $option) {
                // The frontend previously used "{parent} — {option}"
                $name = $group['parent'] . ' — ' . $option;
                Filiere::firstOrCreate(
                    ['name' => $name],
                    ['category' => $group['parent']]
                );
            }
        }
    }
}
