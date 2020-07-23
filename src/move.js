/**
 * Move object
 * @param {{ col: Number, row: Number }} from - The initial position of the move
 * @param {{ col: Number, row: Number }} to - The destination position of the move
 * @param {Number} weight - The weight of the move
 * @param {Piece} capturedPiece - The captured piece of the move
 */
function Move(from, to, weight, capturedPiece) {
  this.from = from; // { col, row }
  this.to = to; // { col, row }
  this.weight = weight;
  this.capturedPiece = capturedPiece;
}

/**
 * Do a move virtually to test if a king is not in check after
 * @param {Piece} piece - The piece to move
 * @param {Number} move - The move to test
 * @param {Array<Array>} b - A board (by default the displayed board)
 * @returns is the king is safe after the move
 */
function testMove(piece, move, b = board) {
  return new Promise((resolve) => {
    // Clone the piece and the board
    let boardClone = clone(b);
    let pieceClone = clone(piece);
    movePiece(pieceClone, move, boardClone);

    // Verify if the king is always safe after the moves
    let isSafe = !isKingInCheck(piece.player, boardClone);
    resolve({ isSafe, piece, move, board: b });
  });
}

/**
 * Move a piece to a new position
 * @param {Piece} piece - The piece to move
 * @param {Number} move - The move to do
 * @param {Array<Array>} b - A board (by default the displayed board)
 */
function movePiece(piece, move, b = board) {
  if (piece.col !== move.from.col && piece.row !== move.from.row) {
    return;
  }

  let toCol = move.to.col;
  let toRow = move.to.row;
  let moves = getAvailableMoves(piece, b);

  for (let move of moves) {
    if (move.to.col === toCol && move.to.row === toRow) {
      if (move.capturedPiece) {
        let capturedPiece = move.capturedPiece;
        b[capturedPiece.col][capturedPiece.row] = null;
        capturedPiece = null;
      }
      // Update the tab
      b[piece.col][piece.row] = null;
      b[toCol][toRow] = piece;

      // Animation only on the displayed board
      if (SHOW_ANIMATION && b === board) {
        createPieceAnimation(piece, move);
      }

      // Update the piece in the parameters
      piece.col = toCol;
      piece.row = toRow;

      // If the piece moved is a pawn and arrives at the opponent base row, it becomes queen
      if (piece.type === pieceTypes.PAWN && toRow === getOpponentBaseRow(piece.player)) {
        piece.type = pieceTypes.QUEEN;
      }
    }
  }
}

/**
 * Check if a player can play a move
 * @param {String} player - A player
 * @param {Array<Array>} b - A board (by default the displayed board)
 */
function hasAvailableMoves(player, b = board) {
  let pieces = getAllPieces(player, b);
  for (let piece of pieces) {
    if (getAvailableMoves(piece, b).length > 0) return true;
  }
  return false;
}
