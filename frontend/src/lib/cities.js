export const CITY_GROUPS = [
  { parent: 'Casablanca-Settât', options: ['Casablanca', 'Mohammedia', 'Settat', 'Berrechid', 'El Jadida', 'Sidi Bennour', 'Benslimane', 'Moulay Abdellah'] },
  { parent: 'Rabat-Salé-Kénitra', options: ['Rabat', 'Salé', 'Kénitra', 'Témara', 'Skhirat', 'Sidi Kacem', 'Sidi Slimane', 'Khémisset'] },
  { parent: 'Marrakech-Safi', options: ['Marrakech', 'Safi', 'Essaouira', 'El Kelâa des Sraghna', 'Chichaoua', 'Al Haouz', 'Youssoufia'] },
  { parent: 'Fès-Meknès', options: ['Fès', 'Meknès', 'Taza', 'Ifrane', 'Sefrou', 'El Hajeb', 'Boulemane', 'Taounate'] },
  { parent: 'Tanger-Tétouan-Al Hoceïma', options: ['Tanger', 'Tétouan', 'Al Hoceïma', 'Larache', 'Ksar El Kébir', 'Chefchaouen', 'Ouezzane'] },
  { parent: 'Souss-Massa', options: ['Agadir', 'Inezgane', 'Tiznit', 'Taroudant', 'Ouarzazate', 'Chtouka', 'Aït Melloul'] },
  { parent: 'Béni Mellal-Khénifra', options: ['Béni Mellal', 'Khénifra', 'Khouribga', 'Fquih Ben Salah', 'Azilal'] },
  { parent: 'Oriental', options: ['Oujda', 'Nador', 'Berkane', 'Taourirt', 'Jerada', 'Figuig', 'Driouch', 'Guercif'] },
  { parent: 'Draâ-Tafilalet', options: ['Errachidia', 'Ouarzazate', 'Zagora', 'Midelt', 'Tinghir', 'Erfoud'] },
  { parent: 'Guelmim-Oued Noun', options: ['Guelmim', 'Tan-Tan', 'Assa-Zag', 'Sidi Ifni', 'Taghjijt'] },
  { parent: 'Laâyoune-Sakia El Hamra', options: ['Laâyoune', 'Boujdour', 'Tarfaya', 'Es-Semara'] },
  { parent: 'Dakhla-Oued Ed-Dahab', options: ['Dakhla', 'Aousserd', 'Bir Gandouz'] },
]

export const VILLES = CITY_GROUPS.flatMap((g) => g.options)
