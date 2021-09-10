import {
  CELLS,
  PIECES,
  PIECES_ARRAY,
  CELL_COLORS,
  getRandomPiece,
  getRandomDirection,
} from "./pieces.js";

$(function () {
  // HTML elements
  const board = document.getElementById("board");
  const boardContext = board.getContext("2d");
  const bgBoard = document.getElementById("board-bg");
  const bgBoardContext = bgBoard.getContext("2d");

  // Constants
  const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
  const DIRECTIONS = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
  const CELL_SIZE = 24;
  const NUM_CELLS_HORIZONTAL = 10;
  const NUM_CELLS_VERTICAL = 20;
  const HORIZONTAL_CENTER = Math.floor(NUM_CELLS_HORIZONTAL / 2.0) - 1;

  // Game variables
  let grid = [];
  let activePiece;
  let steps = 0;

  function createEmptyBoard() {
    grid = Array(NUM_CELLS_HORIZONTAL)
      .fill()
      .map(() => Array(NUM_CELLS_VERTICAL).fill(CELLS.EMPTY));
  }

  function doForEachPieceCell(piece, x, y, direction, fn) {
    let row = 0;
    let col = 0;
    let cells = piece.cells[direction];
    for (let byte = 0x8000; byte > 0; byte = byte >> 1) {
      if (cells & byte) fn(x + col, y + row);
      if (++col === 4) {
        col = 0;
        ++row;
      }
    }
  }

  function addPieceToGrid(piece, x, y, direction) {
    doForEachPieceCell(piece, x, y, direction, function (x, y) {
      grid[x][y] = piece.value;
    });
  }

  function addActivePiece() {
    addPieceToGrid(
      activePiece.piece,
      activePiece.x,
      activePiece.y,
      activePiece.direction
    );
  }

  function removePieceFromGrid(piece, x, y, direction) {
    doForEachPieceCell(piece, x, y, direction, function (x, y) {
      grid[x][y] = CELLS.EMPTY;
    });
  }

  function removeActivePiece() {
    removePieceFromGrid(
      activePiece.piece,
      activePiece.x,
      activePiece.y,
      activePiece.direction
    );
  }

  function moveActivePiece(direction) {
    if (!activePiece) return false;
    let targetX = activePiece.x;
    let targetY = activePiece.y;
    switch (direction) {
      case DIRECTIONS.RIGHT:
        targetX = activePiece.x + 1;
        break;
      case DIRECTIONS.DOWN:
        targetY = activePiece.y + 1;
        break;
      case DIRECTIONS.LEFT:
        targetX = activePiece.x - 1;
        break;
      default:
        return false;
    }
    removeActivePiece();
    if (
      isSpaceOccupied(
        activePiece.piece,
        targetX,
        targetY,
        activePiece.direction
      )
    ) {
      addActivePiece();
      return false;
    }
    activePiece.x = targetX;
    activePiece.y = targetY;
    addActivePiece();
    return true;
  }

  function isCellEmpty(x, y) {
    return grid[x][y] == CELLS.EMPTY;
  }

  function isSpaceOccupied(piece, x, y, direction) {
    var result = false;
    doForEachPieceCell(piece, x, y, direction, function (x, y) {
      if (
        x < 0 ||
        x >= NUM_CELLS_HORIZONTAL ||
        y < 0 ||
        y >= NUM_CELLS_VERTICAL ||
        !isCellEmpty(x, y)
      )
        result = true;
    });
    return result;
  }

  function drawBackgroundBoard() {
    // Background grid
    bgBoardContext.fillStyle = "#202020";
    bgBoardContext.fillRect(
      0,
      0,
      NUM_CELLS_HORIZONTAL * CELL_SIZE,
      NUM_CELLS_VERTICAL * CELL_SIZE
    );
    // Empty cells
    for (var i = 0; i < NUM_CELLS_HORIZONTAL; ++i) {
      for (var j = 0; j < NUM_CELLS_VERTICAL; ++j) {
        bgBoardContext.fillStyle = CELL_COLORS[CELLS.EMPTY];
        bgBoardContext.fillRect(
          0 + i * CELL_SIZE + 1,
          0 + j * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        );
      }
    }
  }

  function drawBoard() {
    // Clear all pieces
    boardContext.clearRect(
      0,
      0,
      NUM_CELLS_HORIZONTAL * CELL_SIZE,
      NUM_CELLS_VERTICAL * CELL_SIZE
    );

    // Redraw all pieces
    for (var i = 0; i < NUM_CELLS_HORIZONTAL; ++i) {
      for (var j = 0; j < NUM_CELLS_VERTICAL; ++j) {
        if (grid[i][j] == CELLS.EMPTY) continue;
        boardContext.fillStyle = CELL_COLORS[grid[i][j]];
        boardContext.fillRect(
          0 + i * CELL_SIZE,
          0 + j * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  }

  function keyDownHandler(e) {
    let direction;
    switch (e.keyCode) {
      case KEYS.LEFT:
        direction = DIRECTIONS.LEFT;
        break;
      case KEYS.RIGHT:
        direction = DIRECTIONS.RIGHT;
        break;
      case KEYS.DOWN:
        direction = DIRECTIONS.DOWN;
        break;
    }
    if (direction) if (moveActivePiece(direction)) drawBoard();
  }

  createEmptyBoard();
  activePiece = {
    piece: getRandomPiece(),
    x: HORIZONTAL_CENTER,
    y: 0,
    direction: getRandomDirection(),
  };
  addPieceToGrid(
    activePiece.piece,
    activePiece.x,
    activePiece.y,
    activePiece.direction
  );
  document.onkeydown = keyDownHandler;
  drawBackgroundBoard();
  drawBoard();
});
