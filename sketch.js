let CW = 800;
if (window.innerWidth < 800) {
  CW = (9 * window.innerWidth) / 10;
}

// Icons for the pieces
let assets = [];

// Containers
let infoView;
let resetButton;
let gameMsg;
let gameMsgColor;

// Config
let SHOW_MOVE = false;
let SHOW_MOVES_WEIGHT = false;
let SHOW_ANIMATION = true;
let MINIMAX_MAX_DEPTH = 1;

// Colors
let PIECE_SELECTED_COLOR = 'red';
let DARK_SQUARE_COLOR = '#232323';
let LIGHT_SQUARE_COLOR = 'white';
let SHOW_COLOR = 'green';
let AI_INFO_COLOR = 'darkgoldenrod';
let HUMAN_INFO_COLOR = 'cornflowerblue';
let ALERT_INFO_COLOR = 'firebrick';

// Board
let BOARD_PXL_DIM = CW;
let BOARD_NUM_COL = 8;
let BOARD_SQUARE_DIM = CW / BOARD_NUM_COL;
let board;

// Gameplay
let end;

// Player
let players = { HUMAN: 'human', AI: 'ai' };
let currentPlayer;

// Pieces
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
  resetButton = createButton();
  initEventListeners();
  reset();
}

function reset() {
  loop();
  end = false;
  currentPlayer = players.HUMAN;
  board = initBoard();
  gameMsg = "It's your turn";
  gameMsgColor = HUMAN_INFO_COLOR;
}

function initEventListeners() {
  resetButton.mousePressed(() => {
    reset();
    resetButton.style('opacity', 0.7);
  });
  resetButton.mouseReleased(() => resetButton.style('opacity', 1));
}

function draw() {
  background(255);
  drawGameInfo();
  drawBoard();
  drawButton();

  if (end && !pieceInAnimation) {
    noLoop();
  }

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

function drawButton() {
  resetButton.html(`<span>Reset</span>`);
  if (currentPlayer === players.AI) {
    resetButton.style('opacity', 0.6);
  }
  resetButton.class('button');
}

function mouseReleased() {
  if (end) return;
  if (mouseX < 0 || mouseX > BOARD_PXL_DIM || mouseY < 0 || mouseY > BOARD_PXL_DIM) {
    if (pieceSelected) pieceSelected = null;
    return;
  }

  /**
   * Find a move specifying a destination
   * @param {Number} toCol - The column of the destination
   * @param {Number} toRow - The row of the destination
   * @param {Array<Move>} moves - An array of moves
   */
  function findMove(toCol, toRow, moves) {
    for (let move of moves) {
      if (move.to.col === toCol && move.to.row === toRow) {
        return move;
      }
    }
  }

  /**
   *
   * @param {Piece} piece
   * @param {Number} col
   * @param {Number} row
   */
  function makeMove(piece, col, row) {
    let moves = getAvailableMoves(piece);
    let wishedMove = findMove(col, row, moves);
    if (!wishedMove) {
      pieceSelected = null;
      return;
    } else {
      // Test if the king is safe after a move
      testMove(pieceSelected, wishedMove).then(({ isSafe }) => {
        if (isSafe) {
          movePiece(pieceSelected, wishedMove);
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

  if (currentPlayer === players.HUMAN) {
    let col = floor(mouseX / BOARD_SQUARE_DIM);
    let row = floor(mouseY / BOARD_SQUARE_DIM);

    if (board[col][row]) {
      let piece = board[col][row];
      if (!pieceSelected) {
        if (piece.player === players.HUMAN) {
          pieceSelected = piece;
        }
      } else {
        if (piece.player === players.HUMAN) {
          pieceSelected = piece;
        } else {
          makeMove(pieceSelected, col, row);
        }
      }
    } else if (pieceSelected) {
      makeMove(pieceSelected, col, row);
    }
  }
}

/**
 * The AI plays
 */
function AI() {
  if (currentPlayer === players.AI) {
    getBestMove(MINIMAX_MAX_DEPTH)
      .then((bestMove) => {
        let piece = board[bestMove.from.col][bestMove.from.row];
        movePiece(piece, bestMove);
        checkWinner().then((end) => {
          currentPlayer = end ? null : players.HUMAN;
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

/**
 * Return true if the king will be in check in the position given.
 * @param {String} player - The player of the king piece
 * @param {Board} b - A board (by default the displayed board)
 */
function isKingInCheck(player, b = board) {
  let king = getKingPiece(player, b);
  let opponent = player === players.AI ? players.HUMAN : players.AI;
  let opponentPieces = getAllPieces(opponent, b);

  // Test if an opponent move can capture the piece at the position (col, row)
  for (let piece of opponentPieces) {
    let moves = getAvailableMoves(piece, b);
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
    let pieces = getAllPieces(player, b);
    for (let piece of pieces) {
      let moves = getAvailableMoves(piece, b);
      for (let move of moves) {
        let boardClone = clone(b);
        let pieceClone = clone(piece);
        movePiece(pieceClone, move, boardClone);
        if (!isKingInCheck(player, boardClone)) {
          return false;
        }
      }
    }
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
      gameMsg = `${opponent === players.AI ? 'AI' : 'You'} get checkmated !`;
      gameMsgColor = ALERT_INFO_COLOR;
      currentPlayer = null;
      end = true;
      resolve(true); // End true
    }
  });
}
