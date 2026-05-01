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
                    'Développement Digital',
                    'Infrastructure Digitale option Systèmes et Réseaux',
                    'Développement Digital option Web Full Stack',
                    'Infrastructure Digitale option Cyber sécurité',
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
                Filiere::firstOrCreate(
                    ['name' => $option],
                    ['category' => $group['parent']]
                );
            }
        }
    }
}
