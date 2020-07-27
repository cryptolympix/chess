/**
 * Search the best move with alpha beta pruning algorithm
 * @param {Number} depth - The maximum depth of tree
 * @returns a promise
 */
async function getBestMove(depth = MINIMAX_MAX_DEPTH) {
  let bestScore = -Infinity;
  let bestMoves = [];
  let promises = [];
  let aiPieces = getAllPieces(players.AI);

  if (isKingInCheck(players.AI)) {
    for (let piece of aiPieces) {
      let moves = getAvailableMoves(piece);
      for (let move of moves) {
        promises.push(testMove(piece, move));
      }
    }
  } else {
    for (let piece of aiPieces) {
      let moves = getAvailableMoves(piece);
      for (let move of moves) {
        promises.push(testMove(piece, move));
      }
    }
  }

  await Promise.all(promises).then((resolves) => {
    for (let resolve of resolves) {
      let { isSafe, piece, move, board } = resolve;
      let boardClone = clone(board);
      let pieceClone = clone(piece);
      if (isSafe) {
        movePiece(pieceClone, move, boardClone);
        let score =
          alphabeta(boardClone, depth, -Infinity, Infinity, false) + move.weight;
        boardClone = null;
        pieceClone = null;
        if (score > bestScore) {
          bestMoves = [];
          bestScore = score;
        }
        if (score == bestScore) {
          bestMoves.push(move);
        }
      }
    }
  });

  return new Promise((resolve, reject) => {
    if (bestMoves.length > 0) {
      if (bestMoves.length == 1) {
        resolve(bestMoves[0]);
      } else {
        let rand = floor(random() * bestMoves.length);
        resolve(bestMoves[rand]);
      }
    } else {
      reject('No move has been found');
    }
  });
}

function alphabeta(board, depth, alpha, beta, isMaximizingPlayer) {
  let player = isMaximizingPlayer ? players.AI : players.HUMAN;

  // We don't consider the sub tree when the king has been captured
  if (!getKingPiece(player, board)) {
    return isMaximizingPlayer ? -Infinity : Infinity;
  }

  // Conditions to get a leaf in the tree
  if (isInCheckmate(player, board)) return isMaximizingPlayer ? -50 : 50;
  if (depth == 0) return 0;

  if (isMaximizingPlayer) {
    let bestScore = -Infinity;
    let aiPieces = getAllPieces(players.AI, board);
    for (let piece of aiPieces) {
      let moves = getAvailableMoves(piece, board);
      for (let move of moves) {
        let boardClone = clone(board);
        let pieceClone = clone(piece);
        movePiece(pieceClone, move, boardClone);
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
    let humanPieces = getAllPieces(players.HUMAN, board);
    for (let piece of humanPieces) {
      let moves = getAvailableMoves(piece, board);
      for (let move of moves) {
        let boardClone = clone(board);
        let pieceClone = clone(piece);
        movePiece(pieceClone, move, boardClone);
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
