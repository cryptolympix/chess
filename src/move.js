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
 * Get all the available moves of a piece
 * @param {Piece} piece - A piece
 * @param {Array<Array>} b - A board (by default the displayed board)
 */
function getAvailableMoves(piece, b = board) {
  let moves = [];
  let directions = getPatternMoves(piece);
  let opponent = piece.player === players.AI ? players.HUMAN : players.AI;
  let from = { col: piece.col, row: piece.row };

  /**
   * Return true if a move is available to the position (col, row)
   * @param {Number} col - The column to check the move
   * @param {Number} row - The row to check the move
   */
  function canMove(col, row) {
    return contains(col, row) && !b[col][row];
  }

  /**
   * Return true if a captured move is available to the position (col, row)
   * @param {Number} col - The column to check the move
   * @param {Number} row - The row to check the move
   */
  function canCapturePiece(col, row) {
    return contains(col, row) && b[col][row] && b[col][row].player === opponent;
  }

  if (piece.type === pieceTypes.PAWN) {
    // At the first move, we can move the pawn with 1 or 2 squares
    if (piece.row === 1 || piece.row === 6) {
      // The pawn cannot jump over a piece front of it
      if (canMove(piece.col + directions[0].col, piece.row + directions[0].row)) {
        for (let d of directions) {
          let to = { col: from.col + d.col, row: from.row + d.row };
          if (canMove(to.col, to.row)) {
            moves.push(new Move(from, to, 0, null));
          }
        }
      }
      // Check if it can capture a piece on the diagonal
      let drow = piece.player === players.AI ? 1 : -1;
      for (let i = -1; i <= 1; i += 2) {
        if (canCapturePiece(from.col + i, from.row + drow)) {
          let to = { col: from.col + i, row: from.row + drow };
          let capturedPiece = b[to.col][to.row];
          moves.push(new Move(from, to, capturedPiece.weight, capturedPiece));
        }
      }
    } else {
      // Move just to one square
      let to = { col: from.col + directions[0].col, row: from.row + directions[0].row };
      if (canMove(to.col, to.row)) {
        moves.push(
          new Move(from, to, to.row === getOpponentBaseRow(piece.player) ? 5 : 0, null)
        );
      }
      // Check if it can capturing a piece on the diagonal
      let drow = piece.player === players.AI ? 1 : -1;
      for (let i = -1; i <= 1; i += 2) {
        if (canCapturePiece(from.col + i, from.row + drow)) {
          let to = { col: from.col + i, row: from.row + drow };
          let capturedPiece = b[to.col][to.row];
          let bonusWeight = to.row === getOpponentBaseRow(piece.player) ? 5 : 0;
          moves.push(
            new Move(from, to, capturedPiece.weight + bonusWeight, capturedPiece)
          );
        }
      }
    }
  } else if (piece.type === pieceTypes.KING) {
    for (let d of directions) {
      let to = { col: from.col + d.col, row: from.row + d.row };
      // Add the available moves
      if (canMove(to.col, to.row)) {
        moves.push(new Move(from, to, 0, null));
      }
      if (canCapturePiece(to.col, to.row)) {
        let capturedPiece = b[to.col][to.row];
        moves.push(new Move(from, to, capturedPiece.weight, capturedPiece));
      }
    }
  } else {
    for (let d of directions) {
      // If the piece moves to a next squares
      if (isFinite(from.col + d.col) && isFinite(from.row + d.row)) {
        let to = { col: from.col + d.col, row: from.row + d.row };
        // Move to a free square
        if (canMove(to.col, to.row)) {
          moves.push(new Move(from, to, 0, null));
        }
        // Move and capture a piece
        if (canCapturePiece(to.col, to.row)) {
          let capturedPiece = b[to.col][to.row];
          moves.push(new Move(from, to, capturedPiece.weight, capturedPiece));
        }
      } else {
        // Get the directions with finite values
        let dcol = !isFinite(d.col) ? (d.col === -Infinity ? -1 : 1) : d.col;
        let drow = !isFinite(d.row) ? (d.row === -Infinity ? -1 : 1) : d.row;

        // Add all the available moves on the line (the piece slides)
        let current = from;
        while (canMove(current.col + dcol, current.row + drow)) {
          let to = { col: current.col + dcol, row: current.row + drow };
          moves.push(new Move(from, to, 0, null));
          current = to;
        }

        // Check if we arrived on a opponent piece or out the board
        // If it's on a opponent piece, we add this move as a capturing move
        let to = { col: current.col + dcol, row: current.row + drow };
        if (canCapturePiece(to.col, to.row)) {
          let capturedPiece = b[to.col][to.row];
          moves.push(new Move(from, to, capturedPiece.weight, capturedPiece));
        }
      }
    }
  }

  return moves;
}
