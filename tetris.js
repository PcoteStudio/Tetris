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
  const KEYS = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    Q: 81,
    W: 87,
    E: 69,
    SPACE: 32,
  };
  const DIRECTIONS = { NONE: -1, UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
  const CELL_SIZE = 24;
  const NUM_CELLS_HORIZONTAL = 10;
  const NUM_CELLS_VERTICAL = 20;
  const HORIZONTAL_CENTER = Math.floor(NUM_CELLS_HORIZONTAL / 2.0) - 1;

  // Game variables
  let grid = [];
  let shadowGrid = [];
  let activePiece;
  let steps = 0;

  function createEmptyGrid() {
    return Array(NUM_CELLS_HORIZONTAL)
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
    checkForTetris(y);
  }

  function addPieceToShadowGrid(piece, x, y, direction) {
    doForEachPieceCell(piece, x, y, direction, function (x, y) {
      shadowGrid[x][y] = piece.value;
    });
  }

  function addActivePiece() {
    removeActiveShadow();
    addActiveShadow();
    addPieceToGrid(
      activePiece.piece,
      activePiece.x,
      activePiece.y,
      activePiece.direction
    );
  }

  function addActiveShadow() {
    if (!activePiece) return false;
    let y = findLowestPosition(
      activePiece.piece,
      activePiece.x,
      activePiece.y,
      activePiece.direction
    );
    if (!y) return false;
    addPieceToShadowGrid(
      activePiece.piece,
      activePiece.x,
      y,
      activePiece.direction
    );
    return true;
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

  function sanitizeDirection(direction) {
    direction = ((direction + 1) % 4) - 1;
    if (direction < 0) direction = 3;
    return direction;
  }

  function rotateActivePiece(difference) {
    removeActivePiece();
    activePiece.direction = sanitizeDirection(
      activePiece.direction + difference
    );
    if (
      isSpaceOccupied(
        activePiece.piece,
        activePiece.x,
        activePiece.y,
        activePiece.direction
      )
    ) {
      activePiece.direction = sanitizeDirection(
        activePiece.direction + 4 - difference
      );
      addActivePiece();
      return false;
    } else {
      addActivePiece();
      return true;
    }
  }

  function moveActivePiece(direction) {
    if (!activePiece) return false;
    let targetX = activePiece.x;
    let targetY = activePiece.y;
    switch (direction) {
      case DIRECTIONS.NONE:
        break;
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

  function removeActiveShadow() {
    shadowGrid = createEmptyGrid();
  }

  function findLowestPosition(piece, x, y, direction) {
    let lowest = undefined;
    for (let c_y = y; c_y < NUM_CELLS_VERTICAL; c_y++) {
      if (!isSpaceOccupied(piece, x, c_y, direction)) lowest = c_y;
      else return lowest;
    }
    return lowest;
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

  function dropActivePiece() {
    removeActivePiece();
    let y = findLowestPosition(
      activePiece.piece,
      activePiece.x,
      activePiece.y,
      activePiece.direction
    );
    if (!y) return false;
    addPieceToGrid(activePiece.piece, activePiece.x, y, activePiece.direction);
    activePiece = undefined;
    return true;
  }

  function clearLine(y) {
    if (y < 0 || y >= NUM_CELLS_VERTICAL) return false;
    for (var x = 0; x < NUM_CELLS_HORIZONTAL; ++x) {
      grid[x].splice(y, 1);
      grid[x].splice(0, 0, CELLS.EMPTY);
    }
    return true;
  }

  function checkForTetris(posY) {
    let initialY = Math.min(posY + 4, NUM_CELLS_VERTICAL - 1);
    for (var y = initialY; y >= 0; --y) {
      let cellCount = NUM_CELLS_HORIZONTAL;
      for (var x = 0; x < NUM_CELLS_HORIZONTAL; ++x) {
        if (grid[x][y] == CELLS.EMPTY || grid[x][y] == CELLS.DEFINITIVE) break;
        cellCount--;
      }
      if (cellCount == 0) {
        clearLine(y);
      }
    }
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

    // Redraw all pieces and shadows
    for (var i = 0; i < NUM_CELLS_HORIZONTAL; ++i) {
      for (var j = 0; j < NUM_CELLS_VERTICAL; ++j) {
        if (grid[i][j] == CELLS.EMPTY) {
          if (shadowGrid[i][j] == CELLS.EMPTY) continue;
          boardContext.fillStyle = CELL_COLORS[shadowGrid[i][j]];
          boardContext.globalAlpha = 0.3;
        } else {
          boardContext.fillStyle = CELL_COLORS[grid[i][j]];
          boardContext.globalAlpha = 1;
        }
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
    let rotation;
    // console.log(e.keyCode);
    switch (e.keyCode) {
      case KEYS.SPACE:
        if (dropActivePiece()) {
          // TODO Get next piece from queue
          activePiece = {
            piece: getRandomPiece(),
            x: HORIZONTAL_CENTER,
            y: 0,
            direction: getRandomDirection(),
          };
          addActivePiece();
          drawBoard();
        }
        return;
      case KEYS.LEFT:
        direction = DIRECTIONS.LEFT;
        break;
      case KEYS.RIGHT:
        direction = DIRECTIONS.RIGHT;
        break;
      case KEYS.DOWN:
        direction = DIRECTIONS.DOWN;
        break;
      case KEYS.Q:
        rotation = 3;
        break;
      case KEYS.W:
        rotation = 2;
        break;
      case KEYS.E:
        rotation = 1;
        break;
    }
    if (direction) {
      if (moveActivePiece(direction)) drawBoard();
    } else if (rotation) {
      if (rotateActivePiece(rotation)) drawBoard();
    }
  }

  grid = createEmptyGrid();
  shadowGrid = createEmptyGrid();
  activePiece = {
    piece: getRandomPiece(),
    x: HORIZONTAL_CENTER,
    y: 0,
    direction: getRandomDirection(),
  };
  addActivePiece();
  document.onkeydown = keyDownHandler;
  drawBackgroundBoard();
  drawBoard();
});
