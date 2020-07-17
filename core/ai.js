/**
 * Search the best move with alpha beta pruning algorithm
 * @param {Number} depth - The maximum depth of tree
 */
function getBestMove(depth) {
  let bestScore = -Infinity;
  let bestMoves = [];

  let aiPieces = board.getAllPieces(players.AI);
  for (let piece of aiPieces) {
    let moves = piece.getAvailableMoves();
    for (let move of moves) {
      let boardClone = clone(board);
      let pieceClone = clone(piece);
      boardClone.movePiece(pieceClone, move.to.col, move.to.row);
      let score = alphabeta(boardClone, depth, -Infinity, Infinity, false) + move.weight;
      boardClone = null;
      pieceClone = null;
      if (score > bestScore) {
        bestMoves = [];
        bestScore = score;
      }
      if (score === bestScore) {
        bestMoves.push(move);
      }
    }
  }

  // If we find many moves, we select one of them
  if (bestMoves.length > 1) {
    let rand = floor(random() * bestMoves.length);
    return bestMoves[rand];
  } else {
    return bestMoves[0];
  }
}

function alphabeta(board, depth, alpha, beta, isMaximizingPlayer) {
  if (depth === 0) {
    if (isInCheckmate(players.HUMAN)) return 50;
    if (isInCheckmate(players.AI)) return -50;
    if (isKingInCheck(players.HUMAN)) return 1;
    if (isKingInCheck(players.AI)) return -1;
    return 0;
  }

  if (isMaximizingPlayer) {
    let bestScore = -Infinity;
    let aiPieces = board.getAllPieces(players.AI);
    for (let piece of aiPieces) {
      let moves = piece.getAvailableMoves(board);
      for (let move of moves) {
        let boardClone = clone(board);
        let pieceClone = clone(piece);
        boardClone.movePiece(pieceClone, move.to.col, move.to.row);
        let score = alphabeta(boardClone, depth - 1, alpha, beta, false) + move.weight;
        boardClone = null;
        pieceClone = null;
        bestScore = max(score, bestScore);
        alpha = max(alpha, score);
        if (alpha >= beta) break;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    let humanPieces = board.getAllPieces(players.HUMAN);
    for (let piece of humanPieces) {
      let moves = piece.getAvailableMoves(board);
      for (let move of moves) {
        let boardClone = clone(board);
        let pieceClone = clone(piece);
        boardClone.movePiece(pieceClone, move.to.col, move.to.row);
        let score = alphabeta(boardClone, depth - 1, alpha, beta, true) - move.weight;
        boardClone = null;
        pieceClone = null;
        bestScore = min(score, bestScore);
        beta = min(beta, score);
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  }
}
