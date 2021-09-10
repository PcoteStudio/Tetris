export const CELLS = {
  EMPTY: 0,
  DEFINITIVE: 1,
  CLEARABLE: 2,
  I: 3,
  J: 4,
  L: 5,
  O: 6,
  S: 7,
  T: 8,
  Z: 9,
};

export const PIECES = {
  I: { cells: [0x0f00, 0x2222, 0x00f0, 0x4444], value: CELLS.I },
  J: { cells: [0x44c0, 0x8e00, 0x6440, 0x0e20], value: CELLS.J },
  L: { cells: [0x4460, 0x0e80, 0xc440, 0x2e00], value: CELLS.L },
  O: { cells: [0xcc00, 0xcc00, 0xcc00, 0xcc00], value: CELLS.O },
  S: { cells: [0x06c0, 0x8c40, 0x6c00, 0x4620], value: CELLS.S },
  T: { cells: [0x0e40, 0x4c40, 0x4e00, 0x4640], value: CELLS.T },
  Z: { cells: [0x0c60, 0x4c80, 0xc600, 0x2640], value: CELLS.Z },
};

export const PIECES_ARRAY = [
  PIECES.I,
  PIECES.J,
  PIECES.L,
  PIECES.O,
  PIECES.S,
  PIECES.T,
  PIECES.Z,
];

export const CELL_COLORS = [
  "#000000", // Empty
  "#6a6a6a", // Definitive
  "#999999", // Clearable
  "#0f9bd7", // I
  "#2141c6", // J
  "#e35b02", // L
  "#e39f02", // O
  "#59b101", // S
  "#af298a", // T
  "#d70f37", // Z
];

export function getRandomPiece() {
  // Make it less random (e.g. Can't get more than 4 of a piece before seeing 4 of each other piece)
  return PIECES_ARRAY[Math.floor(Math.random() * PIECES_ARRAY.length)];
}

export function getRandomDirection() {
  return Math.floor(Math.random() * 4);
}