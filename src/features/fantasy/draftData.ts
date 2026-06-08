import type { DraftPosition } from './types'

export const POSITIONS: DraftPosition[] = [
  {
    id: 'GK',
    name: 'Portero',
    players: [
      { name: 'Thibaut Courtois', stars: 4 },
      { name: 'Alisson Becker', stars: 3 },
      { name: 'Emiliano Martínez', stars: 3 },
      { name: 'Gianluigi Donnarumma', stars: 2 },
      { name: 'Mike Maignan', stars: 2 },
      { name: 'Ederson Moraes', stars: 2 },
      { name: 'Jan Oblak', stars: 2 },
      { name: 'Giorgi Mamardashvili', stars: 1 },
      { name: 'Unai Simón', stars: 1 },
      { name: 'Guillermo Ochoa', stars: 3 },
    ],
  },
  {
    id: 'RB',
    name: 'Lateral Derecho',
    players: [
      { name: 'Achraf Hakimi', stars: 3 },
      { name: 'Trent Alexander-Arnold', stars: 3 },
      { name: 'Jeremie Frimpong', stars: 2 },
      { name: 'Jules Koundé', stars: 2 },
      { name: 'Diogo Dalot', stars: 2 },
      { name: 'Josip Stanišić', stars: 1 },
      { name: 'Jorge Sánchez', stars: 2 },
    ],
  },
  {
    id: 'CB1',
    name: 'Defensa Central 1',
    players: [
      { name: 'Rúben Dias', stars: 3 },
      { name: 'William Saliba', stars: 3 },
      { name: 'Antonio Rüdiger', stars: 3 },
      { name: 'Ronald Araújo', stars: 2 },
      { name: 'Johan Vásquez', stars: 3 },
    ],
  },
  {
    id: 'CB2',
    name: 'Defensa Central 2',
    players: [
      { name: 'Éder Militão', stars: 3 },
      { name: 'Joško Gvardiol', stars: 3 },
      { name: 'Matthijs de Ligt', stars: 2 },
      { name: 'Cristian Romero', stars: 2 },
      { name: 'Gleison Bremer', stars: 2 },
      { name: 'Gonçalo Inácio', stars: 1 },
      { name: 'César Montes', stars: 2 },
    ],
  },
  {
    id: 'LB',
    name: 'Lateral Izquierdo',
    players: [
      { name: 'Theo Hernández', stars: 3 },
      { name: 'Alphonso Davies', stars: 3 },
      { name: 'Alejandro Grimaldo', stars: 2 },
      { name: 'Nuno Mendes', stars: 4 },
      { name: 'Mateo Chávez', stars: 1 },
    ],
  },
  {
    id: 'CDM',
    name: 'Mediocentro Defensivo',
    players: [
      { name: 'Rodri Hernández', stars: 3 },
      { name: 'Declan Rice', stars: 3 },
      { name: 'Aurélien Tchouaméni', stars: 2 },
      { name: 'Eduardo Camavinga', stars: 2 },
      { name: 'Bruno Guimarães', stars: 2 },
      { name: 'Manuel Ugarte', stars: 1 },
      { name: 'Edson Álvarez', stars: 3 },
    ],
  },
  {
    id: 'CM',
    name: 'Mediocampista Central',
    players: [
      { name: 'Jude Bellingham', stars: 3 },
      { name: 'Federico Valverde', stars: 3 },
      { name: 'Pedri', stars: 2 },
      { name: 'Enzo Fernández', stars: 2 },
      { name: 'Vitinha', stars: 4 },
      { name: 'Luis Chávez', stars: 2 },
    ],
  },
  {
    id: 'CAM',
    name: 'Mediocampista Ofensivo',
    players: [
      { name: 'Florian Wirtz', stars: 3 },
      { name: 'Jamal Musiala', stars: 3 },
      { name: 'Martin Ødegaard', stars: 2 },
      { name: 'Gilberto Mora', stars: 3 },
    ],
  },
  {
    id: 'RW',
    name: 'Extremo Derecho',
    players: [
      { name: 'Lionel Messi', stars: 4 },
      { name: 'Lamine Yamal', stars: 5 },
      { name: 'Bukayo Saka', stars: 2 },
      { name: 'Ousmane Dembélé', stars: 5 },
      { name: 'Johan Bakayoko', stars: 1 },
      { name: 'Roberto Alvarado', stars: 2 },
    ],
  },
  {
    id: 'ST',
    name: 'Delantero Centro',
    players: [
      { name: 'Erling Haaland', stars: 3 },
      { name: 'Kylian Mbappé', stars: 4 },
      { name: 'Harry Kane', stars: 4 },
      { name: 'Cristiano Ronaldo', stars: 3 },
      { name: 'Armando González', stars: 2 },
    ],
  },
  {
    id: 'LW',
    name: 'Extremo Izquierdo',
    players: [
      { name: 'Vinícius Júnior', stars: 5 },
      { name: 'Neymar Jr.', stars: 4 },
      { name: 'Rafael Leão', stars: 2 },
      { name: 'Luis Díaz', stars: 3 },
      { name: 'Nico Williams', stars: 3 },
      { name: 'César Huerta', stars: 2 },
    ],
  },
]

export const POSITION_IDS = POSITIONS.map((p) => p.id)
