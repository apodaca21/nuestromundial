import type { DraftPosition } from './types'

export const POSITIONS: DraftPosition[] = [
  {
    id: 'GK',
    name: 'Portero',
    players: [
      { name: 'Thibaut Courtois', stars: 4 },
      { name: 'Alisson Becker', stars: 4 },
      { name: 'Emiliano Martínez', stars: 4 },
      { name: 'Gianluigi Donnarumma', stars: 3 },
      { name: 'Mike Maignan', stars: 3 },
      { name: 'Ederson Moraes', stars: 3 },
      { name: 'Jan Oblak', stars: 3 },
      { name: 'Giorgi Mamardashvili', stars: 2 },
      { name: 'Unai Simón', stars: 2 },
      { name: 'Guillermo Ochoa', stars: 3 },
    ],
  },
  {
    id: 'RB',
    name: 'Lateral Derecho',
    players: [
      { name: 'Achraf Hakimi', stars: 4 },
      { name: 'Trent Alexander-Arnold', stars: 4 },
      { name: 'Jeremie Frimpong', stars: 3 },
      { name: 'Jules Koundé', stars: 3 },
      { name: 'Diogo Dalot', stars: 2 },
      { name: 'Josip Stanišić', stars: 2 },
      { name: 'Jorge Sánchez', stars: 2 },
    ],
  },
  {
    id: 'CB1',
    name: 'Defensa Central 1',
    players: [
      { name: 'Rúben Dias', stars: 4 },
      { name: 'William Saliba', stars: 4 },
      { name: 'Antonio Rüdiger', stars: 4 },
      { name: 'Ronald Araújo', stars: 2 },
      { name: 'Johan Vásquez', stars: 3 },
    ],
  },
  {
    id: 'CB2',
    name: 'Defensa Central 2',
    players: [
      { name: 'Éder Militão', stars: 4 },
      { name: 'Joško Gvardiol', stars: 4 },
      { name: 'Matthijs de Ligt', stars: 3 },
      { name: 'Cristian Romero', stars: 3 },
      { name: 'Gleison Bremer', stars: 2 },
      { name: 'Gonçalo Inácio', stars: 2 },
      { name: 'César Montes', stars: 2 },
    ],
  },
  {
    id: 'LB',
    name: 'Lateral Izquierdo',
    players: [
      { name: 'Theo Hernández', stars: 4 },
      { name: 'Alphonso Davies', stars: 4 },
      { name: 'Alejandro Grimaldo', stars: 3 },
      { name: 'Nuno Mendes', stars: 2 },
      { name: 'Mateo Chávez', stars: 1 },
    ],
  },
  {
    id: 'CDM',
    name: 'Mediocentro Defensivo',
    players: [
      { name: 'Rodri Hernández', stars: 4 },
      { name: 'Declan Rice', stars: 4 },
      { name: 'Aurélien Tchouaméni', stars: 3 },
      { name: 'Eduardo Camavinga', stars: 3 },
      { name: 'Bruno Guimarães', stars: 3 },
      { name: 'Manuel Ugarte', stars: 2 },
      { name: 'Edson Álvarez', stars: 3 },
    ],
  },
  {
    id: 'CM',
    name: 'Mediocampista Central',
    players: [
      { name: 'Jude Bellingham', stars: 4 },
      { name: 'Federico Valverde', stars: 4 },
      { name: 'Pedri', stars: 3 },
      { name: 'Enzo Fernández', stars: 2 },
      { name: 'Vitinha', stars: 2 },
      { name: 'Luis Chávez', stars: 2 },
    ],
  },
  {
    id: 'CAM',
    name: 'Mediocampista Ofensivo',
    players: [
      { name: 'Florian Wirtz', stars: 4 },
      { name: 'Jamal Musiala', stars: 4 },
      { name: 'Martin Ødegaard', stars: 3 },
      { name: 'Gilberto Mora', stars: 3 },
    ],
  },
  {
    id: 'RW',
    name: 'Extremo Derecho',
    players: [
      { name: 'Lionel Messi', stars: 4 },
      { name: 'Lamine Yamal', stars: 4 },
      { name: 'Bukayo Saka', stars: 3 },
      { name: 'Ousmane Dembélé', stars: 3 },
      { name: 'Johan Bakayoko', stars: 2 },
      { name: 'Roberto Alvarado', stars: 2 },
    ],
  },
  {
    id: 'ST',
    name: 'Delantero Centro',
    players: [
      { name: 'Erling Haaland', stars: 4 },
      { name: 'Kylian Mbappé', stars: 4 },
      { name: 'Harry Kane', stars: 3 },
      { name: 'Cristiano Ronaldo', stars: 3 },
      { name: 'Armando González', stars: 2 },
    ],
  },
  {
    id: 'LW',
    name: 'Extremo Izquierdo',
    players: [
      { name: 'Vinícius Júnior', stars: 4 },
      { name: 'Neymar Jr.', stars: 4 },
      { name: 'Rafael Leão', stars: 3 },
      { name: 'Luis Díaz', stars: 3 },
      { name: 'Nico Williams', stars: 2 },
      { name: 'César Huerta', stars: 2 },
    ],
  },
]

export const POSITION_IDS = POSITIONS.map((p) => p.id)
