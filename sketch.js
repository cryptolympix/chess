let CW = 800;
if (window.innerWidth < 800) {
  CW = (9 * window.innerWidth) / 10;
}

// Icons for the pieces
let assets = [];

// Containers
let infoView;
let gameMsg;
let gameMsgColor;

// Config
let SHOW_MOVE = false;
let SHOW_MOVES_WEIGHT = false;
let SHOW_ANIMATION = true;
let MINIMAX_MAX_DEPTH = 2;

// Colors
let AI_PIECES_COLOR = 'black';
let HUMAN_PIECES_COLOR = 'white';
let PIECE_SELECTED_COLOR = 'red';
let DARK_SQUARE_COLOR = '#232323';
let LIGHT_SQUARE_COLOR = 'white';
let SHOW_COLOR = 'green';
let AI_INFO_COLOR = 'darkgoldenrod';
let HUMAN_INFO_COLOR = 'cornflowerblue';
let ALERT_INFO_COLOR = 'firebrick';

let end;
let board;
let players = { HUMAN: 'human', AI: 'ai' };
let currentPlayer;
let pieceSelected;
let pieceInAnimation;

function preload() {
  assets.bishopBlack = loadImage('./assets/chess_piece_black_bishop.png');
  assets.kingBlack = loadImage('./assets/chess_piece_black_king.png');
  assets.knightBlack = loadImage('./assets/chess_piece_black_knight.png');
  assets.pawnBlack = loadImage('./assets/chess_piece_black_pawn.png');
  assets.queenBlack = loadImage('./assets/chess_piece_black_queen.png');
  assets.rookBlack = loadImage('./assets/chess_piece_black_rook.png');
  assets.bishopWhite = loadImage('./assets/chess_piece_white_bishop.png');
  assets.kingWhite = loadImage('./assets/chess_piece_white_king.png');
  assets.knightWhite = loadImage('./assets/chess_piece_white_knight.png');
  assets.pawnWhite = loadImage('./assets/chess_piece_white_pawn.png');
  assets.queenWhite = loadImage('./assets/chess_piece_white_queen.png');
  assets.rookWhite = loadImage('./assets/chess_piece_white_rook.png');
}

function setup() {
  infoView = createDiv();
  createCanvas(CW, CW);
  reset();
}

function reset() {
  end = false;
  currentPlayer = players.HUMAN;
  board = new Board(CW);
  gameMsg = "It's your turn";
  gameMsgColor = HUMAN_INFO_COLOR;
}

function draw() {
  background(255);
  drawGameInfo();
  board.draw();

  if (currentPlayer === players.AI && !pieceInAnimation) {
    setTimeout(() => {
      AI();
    }, 500);
  }
}

function drawGameInfo() {
  infoView.html(
    `<div class="info-block">
      <p class="game-msg" style="color: ${gameMsgColor}">${gameMsg}</p>
    </div>`
  );
  infoView.id('info');
}

function mouseReleased() {
  if (
    end ||
    mouseX < 0 ||
    mouseX > board.pixelDim ||
    mouseY < 0 ||
    mouseY > board.pixelDim
  )
    return;

  /**
   * Find a mose specifying a destination
   * @param {Number} toCol - The column of the destination
   * @param {Number} toRow - The row of the destination
   * @param {Number} moves - An array of moves
   */
  function findMove(toCol, toRow, moves) {
    for (let move of moves) {
      if (move.to.col === toCol && move.to.row === toRow) {
        return move;
      }
    }
  }

  if (currentPlayer === players.HUMAN) {
    let col = floor(mouseX / board.squareDim);
    let row = floor(mouseY / board.squareDim);

    if (board.hasPiece(col, row)) {
      let piece = board.getPiece(col, row);
      if (!pieceSelected) {
        if (piece.player === players.HUMAN) {
          pieceSelected = piece;
        }
      } else {
        let piece = board.getPiece(col, row);
        if (piece.player === players.HUMAN) {
          pieceSelected = piece;
        } else {
          // Capture a piece
          board.testMove(pieceSelected, col, row).then((isSafe) => {
            // The king is safe if the move is choosen
            if (isSafe) {
              board.movePiece(pieceSelected, col, row);
              checkWinner().then((end) => {
                currentPlayer = end ? null : players.AI;
              });
            } else {
              gameMsg = "You can't do this move";
              gameMsgColor = ALERT_INFO_COLOR;
            }
            pieceSelected = null;
          });
        }
      }
    } else if (pieceSelected) {
      let moves = pieceSelected.getAvailableMoves();
      let wishedMove = findMove(col, row, moves);

      if (!wishedMove) {
        pieceSelected = null;
        return;
      } else {
        board.testMove(pieceSelected, col, row).then((isSafe) => {
          // The king is safe if the move is choosen
          if (isSafe) {
            board.movePiece(pieceSelected, col, row);
            checkWinner().then((end) => {
              currentPlayer = end ? null : players.AI;
            });
          } else {
            gameMsg = "You can't do this move";
            gameMsgColor = ALERT_INFO_COLOR;
          }
          pieceSelected = null;
        });
      }
    }
  }
}

function AI() {
  if (currentPlayer === players.AI) {
    let bestMove = getBestMove(MINIMAX_MAX_DEPTH);
    let piece = board.getPiece(bestMove.from.col, bestMove.from.row);
    board.movePiece(piece, bestMove.to.col, bestMove.to.row);
    checkWinner().then((end) => {
      currentPlayer = end ? null : players.HUMAN;
    });
  }
}

/**
 * Return true if the king will be in check in the position given.
 * @param {String} player - The player of the king piece
 * @param {Board} b - A board (by default the displayed board)
 */
function isKingInCheck(player, b = board) {
  let king = b.getKingPiece(player);
  let opponent = player === players.AI ? players.HUMAN : players.AI;
  let opponentPieces = b.getAllPieces(opponent);

  // Test if an opponent move can capture the piece at the position (col, row)
  for (let piece of opponentPieces) {
    let moves = piece.getAvailableMoves(b);
    for (let move of moves) {
      if (move.to.col === king.col && move.to.row === king.row) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Test if a player is in checkmate
 * @param {String} player - The player to test
 * @param {Board} b - A board (by default the displayed board)
 */
function isInCheckmate(player, b = board) {
  if (isKingInCheck(player, b)) {
    let cloneBoard = clone(b);
    let pieces = cloneBoard.getAllPieces(player);

    for (let piece of pieces) {
      let moves = piece.getAvailableMoves(b);
      for (let move of moves) {
        let boardClone = clone(b);
        let pieceClone = clone(piece);
        boardClone.movePiece(pieceClone, move.to.col, move.to.row);
        if (!isKingInCheck(player, boardClone)) {
          boardClone = null;
          pieceClone = null;
          return false;
        }
      }
    }
    boardClone = null;
    pieceClone = null;
    return true;
  }
  return false;
}

/**
 * Check if a player get checkmated or if a king is in check
 * @returns if the part ends or not
 */
function checkWinner() {
  return new Promise((resolve) => {
    let opponent = currentPlayer === players.AI ? players.HUMAN : players.AI;
    if (!isInCheckmate(opponent)) {
      if (isKingInCheck(opponent)) {
        gameMsg = 'King in check !';
        gameMsgColor = ALERT_INFO_COLOR;
      } else {
        // Message for the next player
        if (opponent === players.AI) {
          gameMsg = 'AI is searching a move...';
          gameMsgColor = AI_INFO_COLOR;
        } else {
          gameMsg = "It's your turn";
          gameMsgColor = HUMAN_INFO_COLOR;
        }
      }
      resolve(false); // End false
    } else {
      gameMsg = 'Checkmate !';
      gameMsgColor = ALERT_INFO_COLOR;
      currentPlayer = null;
      end = true;
      resolve(true); // End true
    }
  });
}
