let pieceTypes = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight',
  PAWN: 'pawn',
};

/**
 * Piece object
 * @param {Number} col
 * @param {Number} row
 * @param {String} type
 * @param {String} player
 */
function Piece(col, row, type, player) {
  this.col = col;
  this.row = row;
  this.type = type;
  this.weight = getPieceWeight(type);
  this.player = player;
  this.animations = [];
}

/**
 * The weight specify the significance of a piece
 * @param {String} type - The type of the piece to get the weight
 */
function getPieceWeight(type) {
  switch (type) {
    case pieceTypes.KING:
      return 30;
    case pieceTypes.QUEEN:
      return 20;
    case pieceTypes.BISHOP:
      return 10;
    case pieceTypes.KNIGHT:
      return 10;
    case pieceTypes.ROOK:
      return 10;
    case pieceTypes.PAWN:
      return 5;
    default:
      console.error("Invalid type given to get the piece's weight");
      return 0;
  }
}

/**
 * Get the pattern of the available moves for the piece
 * @param {Piece} piece - The piece to get the pattern moves
 */
function getPatternMoves(piece) {
  switch (piece.type) {
    case pieceTypes.KING:
      return [
        { col: -1, row: -1 },
        { col: 0, row: -1 },
        { col: 1, row: -1 },
        { col: -1, row: 0 },
        { col: 1, row: 0 },
        { col: -1, row: 1 },
        { col: 0, row: 1 },
        { col: 1, row: 1 },
      ];
    case pieceTypes.QUEEN:
      return [
        { col: -Infinity, row: -Infinity },
        { col: 0, row: -Infinity },
        { col: Infinity, row: -Infinity },
        { col: -Infinity, row: 0 },
        { col: Infinity, row: 0 },
        { col: -Infinity, row: Infinity },
        { col: 0, row: Infinity },
        { col: Infinity, row: Infinity },
      ];
    case pieceTypes.ROOK:
      return [
        { col: 0, row: -Infinity },
        { col: -Infinity, row: 0 },
        { col: Infinity, row: 0 },
        { col: 0, row: Infinity },
      ];
    case pieceTypes.BISHOP:
      return [
        { col: -Infinity, row: -Infinity },
        { col: Infinity, row: -Infinity },
        { col: -Infinity, row: Infinity },
        { col: Infinity, row: Infinity },
      ];
    case pieceTypes.KNIGHT:
      return [
        { col: -2, row: -1 },
        { col: -1, row: -2 },
        { col: 1, row: -2 },
        { col: 2, row: -1 },
        { col: 2, row: 1 },
        { col: 1, row: 2 },
        { col: -1, row: 2 },
        { col: -2, row: 1 },
      ];
    case pieceTypes.PAWN:
      if (piece.player === players.AI) {
        return [
          { col: 0, row: 1 },
          { col: 0, row: 2 },
        ];
      }
      if (piece.player === players.HUMAN) {
        return [
          { col: 0, row: -1 },
          { col: 0, row: -2 },
        ];
      }
    default:
      console.error('Invalid type given to get the pattern moves of the piece');
      return [];
  }
}

/**
 * Draw a piece on the board
 * @param {Piece} piece
 */
function drawPiece(piece) {
  let dim = BOARD_SQUARE_DIM;
  let color = piece.player === players.AI ? 'Black' : 'White';
  let img = assets[piece.type + color];

  if (piece === pieceInAnimation) {
    let currentPosition = piece.animations[0];
    image(img, currentPosition.x, currentPosition.y, dim, dim);
    piece.animations.shift();
    if (piece.animations.length === 0) {
      pieceInAnimation = null;
    }
  } else {
    image(img, piece.col * dim, piece.row * dim, dim, dim);
  }

  if (piece === pieceSelected) {
    // Show that the piece is selected
    noFill();
    stroke(PIECE_SELECTED_COLOR);
    strokeWeight(2);
    rect(piece.col * dim, piece.row * dim, dim, dim);

    if (SHOW_MOVE) {
      let moves = getAvailableMoves(piece);
      for (let move of moves) {
        stroke(DARK_SQUARE_COLOR);
        fill(SHOW_COLOR);
        rect(move.to.col * dim, move.to.row * dim, dim, dim);

        if (SHOW_MOVES_WEIGHT) {
          fill('white');
          textFont('Roboto');
          textSize(18);
          textAlign(CENTER);
          text(move.weight, move.to.col * dim + dim / 2, move.to.row * dim + dim / 2);
        }
      }
    }
  }
}

/**
 * Create the animation for a piece that moves
 * @param {Piece} piece - A piece to animate
 * @param {Move} move - The destination column
 */
function createPieceAnimation(piece, move) {
  let frameCount = 15;
  let dim = BOARD_SQUARE_DIM;
  pieceInAnimation = piece;

  let initialMoveX = move.from.col * dim;
  let initialMoveY = move.from.row * dim;
  let dx = (move.to.col - move.from.col) * dim;
  let dy = (move.to.row - move.from.row) * dim;
  let stepX = dx / frameCount;
  let stepY = dy / frameCount;

  for (let a = 0; a <= frameCount; a++) {
    let x = initialMoveX + a * stepX;
    let y = initialMoveY + a * stepY;
    piece.animations.push({ x, y });
  }
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
