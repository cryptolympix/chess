let pieceTypes = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight',
  PAWN: 'pawn',
};

/**
 * The weight specify the significance of a piece
 * @param {String} type - The type of the piece to get the weight
 */
function getPieceWeight(type) {
  switch (type) {
    case pieceTypes.KING:
      return 10;
    case pieceTypes.QUEEN:
      return 5;
    case pieceTypes.BISHOP:
      return 4;
    case pieceTypes.KNIGHT:
      return 3;
    case pieceTypes.ROOK:
      return 2;
    case pieceTypes.PAWN:
      return 1;
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

class Piece {
  /**
   * @param {Number} col - The column of the piece on the board
   * @param {Number} row - The row of the piece on the board
   * @param {String} type - The type of the piece
   * @param {String} player - The player of the piece
   */
  constructor(col, row, type, player) {
    this._col = col;
    this._row = row;
    this._type = type;
    this._weight = getPieceWeight(type);
    this._player = player;
    this._color = player === players.AI ? AI_PIECES_COLOR : HUMAN_PIECES_COLOR;
    this._animations = [];
  }

  draw() {
    let dim = board.squareDim;
    let color = this.player === players.AI ? 'Black' : 'White';
    let img = assets[this._type + color];

    if (this === pieceInAnimation) {
      let currentPosition = this._animations[0];
      image(img, currentPosition.x, currentPosition.y, dim, dim);
      this._animations.shift();
      if (this._animations.length === 0) {
        pieceInAnimation = null;
      }
    } else {
      image(img, this._col * dim, this._row * dim, dim, dim);
    }

    if (this === pieceSelected) {
      // Show that the piece is selected
      noFill();
      stroke(PIECE_SELECTED_COLOR);
      strokeWeight(2);
      rect(this._col * dim, this._row * dim, dim, dim);

      if (SHOW_MOVE) {
        let moves = this.getAvailableMoves();
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
   * @param {Move} move - The destination column
   */
  animate(move) {
    let frameCount = 15;
    let dim = board.pixelDim / board.numCol;

    pieceInAnimation = this;
    let initialMoveX = move.from.col * dim;
    let initialMoveY = move.from.row * dim;
    let dx = (move.to.col - move.from.col) * dim;
    let dy = (move.to.row - move.from.row) * dim;
    let stepX = dx / frameCount;
    let stepY = dy / frameCount;

    for (let a = 0; a <= frameCount; a++) {
      let x = initialMoveX + a * stepX;
      let y = initialMoveY + a * stepY;
      this._animations.push({ x, y });
    }
  }

  /**
   * Get all the available moves of the piece
   * @param {Board} b - A board (by default the displayed board)
   */
  getAvailableMoves(b = board) {
    let moves = [];
    let directions = getPatternMoves(this);
    let opponent = this._player === players.AI ? players.HUMAN : players.AI;
    let from = { col: this._col, row: this._row };

    /**
     * Return true if a move is available to the position (col, row)
     * @param {Number} col - The column to check the move
     * @param {Number} row - The row to check the move
     */
    function canMove(col, row) {
      return b.contains(col, row) && !b.hasPiece(col, row);
    }

    /**
     * Return true if a captured move is available to the position (col, row)
     * @param {Number} col - The column to check the move
     * @param {Number} row - The row to check the move
     */
    function canCapturePiece(col, row) {
      return (
        b.contains(col, row) &&
        b.hasPiece(col, row) &&
        b.getPiece(col, row).player === opponent
      );
    }

    if (this._type === pieceTypes.PAWN) {
      // At the first move, we can move the pawn with 1 or 2 squares
      if (this._row === 1 || this._row === 6) {
        // The pawn cannot jump over a piece front of it
        if (canMove(this._col + directions[0].col, this._row + directions[0].row)) {
          for (let d of directions) {
            let to = { col: from.col + d.col, row: from.row + d.row };
            if (canMove(to.col, to.row)) {
              moves.push(new Move(from, to, 0, null));
            }
          }
        }
        // Check if it can capture a piece on the diagonal
        let drow = this._player === players.AI ? 1 : -1;
        for (let i = -1; i <= 1; i += 2) {
          if (canCapturePiece(from.col + i, from.row + drow)) {
            let to = { col: from.col + i, row: from.row + drow };
            let capturedPiece = b.getPiece(from.col + i, from.row + drow);
            moves.push(new Move(from, to, capturedPiece.weight, capturedPiece));
          }
        }
      } else {
        // Move just to one square
        let to = { col: from.col + directions[0].col, row: from.row + directions[0].row };
        if (canMove(to.col, to.row)) {
          moves.push(new Move(from, to, 0, null));
        }
        // Check if it can capturing a piece on the diagonal
        let drow = this._player === players.AI ? 1 : -1;
        for (let i = -1; i <= 1; i += 2) {
          if (canCapturePiece(from.col + i, from.row + drow)) {
            let to = { col: from.col + i, row: from.row + drow };
            let capturedPiece = b.getPiece(from.col + i, from.row + drow);
            moves.push(new Move(from, to, capturedPiece.weight, capturedPiece));
          }
        }
      }
    } else if (this._type === pieceTypes.KING) {
      for (let d of directions) {
        let to = { col: from.col + d.col, row: from.row + d.row };
        // Add the available moves
        if (canMove(to.col, to.row)) {
          moves.push(new Move(from, to, 0, null));
        }
        if (canCapturePiece(to.col, to.row)) {
          let capturedPiece = b.getPiece(to.col, to.row);
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
            let capturedPiece = b.getPiece(to.col, to.row);
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
            let capturedPiece = b.getPiece(to.col, to.row);
            moves.push(new Move(from, to, capturedPiece.weight, capturedPiece));
          }
        }
      }
    }

    return moves;
  }

  isInAnimation() {
    return this._animations.length > 0;
  }

  get col() {
    return this._col;
  }

  set col(col) {
    this._col = col;
  }

  get row() {
    return this._row;
  }

  set row(row) {
    this._row = row;
  }

  get type() {
    return this._type;
  }

  set type(type) {
    this._type = type;
  }

  get weight() {
    return this._weight;
  }

  set weight(weight) {
    this._weight = weight;
  }

  get player() {
    return this._player;
  }

  set player(player) {
    this._player = player;
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color = color;
  }

  get isSelected() {
    return this._isSelected;
  }

  set isSelected(isSelected) {
    this._isSelected = isSelected;
  }
}
