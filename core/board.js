class Board {
  constructor(pixelDim) {
    this._pixelDim = pixelDim;
    this._numCol = 8;
    this._squareDim = pixelDim / 8;
    this._tab = [];
    this._pieces = [];
    this.reset();
  }

  reset() {
    this._tab = new Array(this._numCol);
    for (let i = 0; i < this._numCol; i++) {
      this._tab[i] = new Array(this._numCol);
    }

    // Place the pawns
    for (let i = 0; i < this._numCol; i++) {
      this.addPiece(i, 1, pieceTypes.PAWN, players.AI);
      this.addPiece(i, 6, pieceTypes.PAWN, players.HUMAN);
    }

    // Place the other pieces
    for (let i = 0; i < this._numCol; i++) {
      switch (i) {
        case 0:
        case 7:
          this.addPiece(i, 0, pieceTypes.ROOK, players.AI);
          this.addPiece(i, 7, pieceTypes.ROOK, players.HUMAN);
          break;
        case 1:
        case 6:
          this.addPiece(i, 0, pieceTypes.KNIGHT, players.AI);
          this.addPiece(i, 7, pieceTypes.KNIGHT, players.HUMAN);
          break;
        case 2:
        case 5:
          this.addPiece(i, 0, pieceTypes.BISHOP, players.AI);
          this.addPiece(i, 7, pieceTypes.BISHOP, players.HUMAN);
          break;
        case 3:
          this.addPiece(i, 0, pieceTypes.KING, players.AI);
          this.addPiece(i, 7, pieceTypes.QUEEN, players.HUMAN);
          break;
        case 4:
          this.addPiece(i, 0, pieceTypes.QUEEN, players.AI);
          this.addPiece(i, 7, pieceTypes.KING, players.HUMAN);
          break;
        default:
          console.error('Unknown type for the piece');
          break;
      }
    }
  }

  draw() {
    // Draw the board
    let dim = this._squareDim;
    for (let j = 0; j < this._numCol; j++) {
      for (let i = 0; i < this._numCol; i++) {
        stroke(0);
        strokeWeight(1);
        fill((i + 1) % 2 === j % 2 ? DARK_SQUARE_COLOR : LIGHT_SQUARE_COLOR);
        rect(i * dim, j * dim, dim, dim);
      }
    }

    // Draw the pieces
    for (let p of this._pieces) {
      p.draw();
    }
  }

  /**
   * Get the number of pieces
   * @param {String} player - The player to count the pieces
   */
  getNumberOfPieces(player) {
    let result = 0;
    for (let piece of this._pieces) {
      if (!player) {
        result++;
      } else {
        if (piece.player === player) result++;
      }
    }
    return result;
  }

  /**
   * Check if there is a piece on a square
   * @param {Number} col - The column of the square to check
   * @param {Number} row - The row of the square to check
   */
  hasPiece(col, row) {
    if (this.contains(col, row)) {
      return this._tab[col][row] !== null && this._tab[col][row] !== undefined;
    } else {
      return false;
    }
  }

  /**
   * Move a piece to a new position
   * @param {Piece} piece - The piece to move
   * @param {Number} toCol - The destination column
   * @param {Number} toRow - The destination row
   */
  movePiece(piece, toCol, toRow) {
    let moves = piece.getAvailableMoves();
    for (let move of moves) {
      if (move.to.col === toCol && move.to.row === toRow) {
        if (move.isCapturingMove()) {
          let capturedPiece = move.capturedPiece;
          this.removePiece(capturedPiece);
        }
        // Update the tab
        this._tab[piece.col][piece.row] = null;
        this._tab[toCol][toRow] = piece;

        // Animation
        piece.animate(move);

        // Update the piece
        piece.col = toCol;
        piece.row = toRow;

        // If the piece moved is a pawn and arrives at the opponent
        // base row, it becomes queen
        if (
          piece.type === pieceTypes.PAWN &&
          (toRow === 0 || toRow === board.numCol - 1)
        ) {
          piece.type = pieceTypes.QUEEN;
        }
      }
    }
  }

  /**
   * Get a piece on the board
   * @param {Number} col - The column to get the piece
   * @param {Number} row - The row to get the piece
   */
  getPiece(col, row) {
    if (this.contains(col, row)) {
      return this._tab[col][row];
    }
  }

  /**
   * Add a new piece on the board
   * @param {Number} col - The column to place the piece
   * @param {Number} row - The row to place the piece
   * @param {String} type - The type of the piece to add
   * @param {String} player - The player of the piece
   */
  addPiece(col, row, type, player) {
    let p = new Piece(col, row, type, player);
    this._tab[col][row] = p;
    this._pieces.push(p);
  }

  /**
   * Remove a piece on the board
   * @param {Piece} piece - The piece to remove
   */
  removePiece(piece) {
    for (let i = 0; i < this._pieces.length; i++) {
      if (this._pieces[i].col === piece.col && this._pieces[i].row === piece.row) {
        this._pieces.splice(i, 1);
        break;
      }
    }
    this._tab[piece.col][piece.row] = null;
    piece = null;
  }

  contains(col, row) {
    return col >= 0 && col < this._numCol && row >= 0 && row < this._numCol;
  }

  get pixelDim() {
    return this._pixelDim;
  }

  set pixelDim(pixelDim) {
    this._pixelDim = pixelDim;
  }

  get numCol() {
    return this._numCol;
  }

  set numCol(numCol) {
    this._numCol = numCol;
  }

  get squareDim() {
    return this._squareDim;
  }

  set squareDim(squareDim) {
    this._squareDim = squareDim;
  }
}
