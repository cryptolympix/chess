class Move {
  /**
   * @param {{col: Number, row: Number}} from - The initial position of the piece before the move
   * @param {{col: Number, row: Number}} to - The destination of the piece after the move
   * @param {Number} weight - The weight of the move
   * @param {Piece} capturedPiece - The captured piece if it's a captured move
   */
  constructor(from, to, weight, capturedPiece) {
    this._from = from; // { col, row }
    this._to = to; // { col, row }
    this._weight = weight;
    this._capturedPiece = capturedPiece;
  }

  isCapturingMove() {
    return this._capturedPiece !== null && this._weight > 0;
  }

  get from() {
    return this._from;
  }

  set from(from) {
    this._from = from;
  }

  get to() {
    return this._to;
  }

  set to(to) {
    this._to = to;
  }

  get weight() {
    return this._weight;
  }

  set weight(weight) {
    this._weight = weight;
  }

  get capturedPiece() {
    return this._capturedPiece;
  }

  set capturedPiece(capturedPiece) {
    this._capturedPiece = capturedPiece;
  }
}
