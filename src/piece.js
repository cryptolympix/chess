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
