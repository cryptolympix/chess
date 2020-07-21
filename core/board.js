/**
 * Init a board
 * @returns a board
 */
function initBoard() {
  let b;
  b = new Array(BOARD_NUM_COL);
  for (let i = 0; i < BOARD_NUM_COL; i++) {
    b[i] = new Array(BOARD_NUM_COL);
  }

  // Place the pawns
  for (let i = 0; i < BOARD_NUM_COL; i++) {
    b[i][1] = new Piece(i, 1, pieceTypes.PAWN, players.AI);
    b[i][6] = new Piece(i, 6, pieceTypes.PAWN, players.HUMAN);
  }

  // Place the other pieces
  for (let i = 0; i < BOARD_NUM_COL; i++) {
    switch (i) {
      case 0:
      case 7:
        b[i][0] = new Piece(i, 0, pieceTypes.ROOK, players.AI);
        b[i][7] = new Piece(i, 7, pieceTypes.ROOK, players.HUMAN);
        break;
      case 1:
      case 6:
        b[i][0] = new Piece(i, 0, pieceTypes.KNIGHT, players.AI);
        b[i][7] = new Piece(i, 7, pieceTypes.KNIGHT, players.HUMAN);
        break;
      case 2:
      case 5:
        b[i][0] = new Piece(i, 0, pieceTypes.BISHOP, players.AI);
        b[i][7] = new Piece(i, 7, pieceTypes.BISHOP, players.HUMAN);
        break;
      case 3:
        b[i][0] = new Piece(i, 0, pieceTypes.KING, players.AI);
        b[i][7] = new Piece(i, 7, pieceTypes.QUEEN, players.HUMAN);
        break;
      case 4:
        b[i][0] = new Piece(i, 0, pieceTypes.QUEEN, players.AI);
        b[i][7] = new Piece(i, 7, pieceTypes.KING, players.HUMAN);
        break;
      default:
        console.error('Unknown type for the piece');
        break;
    }
  }

  return b;
}

/**
 * Draw the board
 */
function drawBoard() {
  let dim = BOARD_SQUARE_DIM;

  // Draw the board
  for (let j = 0; j < BOARD_NUM_COL; j++) {
    for (let i = 0; i < BOARD_NUM_COL; i++) {
      stroke(0);
      strokeWeight(1);
      fill((i + 1) % 2 === j % 2 ? DARK_SQUARE_COLOR : LIGHT_SQUARE_COLOR);
      rect(i * dim, j * dim, dim, dim);
    }
  }

  // Draw the pieces
  for (let j = 0; j < BOARD_NUM_COL; j++) {
    for (let i = 0; i < BOARD_NUM_COL; i++) {
      if (board[i][j]) {
        drawPiece(board[i][j]);
      }
    }
  }
}

/**
 * Get all the pieces on the board. If a player is specifying, return all
 * the pieces of this player.
 * @param {String} player - One of the player (human or ai)
 * @param {Array<Array>} b - A board (by default the displayed board)
 */
function getAllPieces(player, b = board) {
  let result = [];
  for (let j = 0; j < BOARD_NUM_COL; j++) {
    for (let i = 0; i < BOARD_NUM_COL; i++) {
      if (b[i][j]) {
        if (player && b[i][j].player !== player) {
          continue;
        }
        result.push(b[i][j]);
      }
    }
  }
  return result;
}

/**
 * Get the king piece of a player
 * @param {String} player
 * @param {Array<Array>} b - A board (by default the displayed board)
 */
function getKingPiece(player, b = board) {
  let pieces = getAllPieces(player, b);
  for (let piece of pieces) {
    if (piece.type === pieceTypes.KING) {
      return piece;
    }
  }
}

/**
 * Get the number of pieces
 * @param {String} player - The player to count the pieces
 * @param {Array<Array>} b - A board (by default the displayed board)
 */
function getNumberOfPieces(player, b = board) {
  return getAllPieces(player, b).length;
}

/**
 * Return if the board contains the col and row specified
 * @param {Number} col - A column
 * @param {Number} row - A row
 * @param {Array<Array>} b - A board (by default the displayed board)
 */
function contains(col, row) {
  return col >= 0 && col < BOARD_NUM_COL && row >= 0 && row < BOARD_NUM_COL;
}
