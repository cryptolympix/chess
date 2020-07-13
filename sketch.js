let CW = 800;
if (window.innerWidth < 800) {
  CW = (9 * window.innerWidth) / 10;
}

let assets = [];

// Debug
let SHOW_MOVE = true;
let SHOW_MOVES_WEIGHT = true;

// Colors
let AI_PIECES_COLOR = 'black';
let HUMAN_PIECES_COLOR = 'white';
let PIECE_SELECTED_COLOR = 'red';
let DARK_SQUARE_COLOR = '#232323';
let LIGHT_SQUARE_COLOR = 'white';
let SHOW_COLOR = 'green';

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
  createCanvas(CW, CW);
  reset();
}

function reset() {
  end = false;
  currentPlayer = players.HUMAN;
  board = new Board(CW);
}

function draw() {
  background(255);
  board.draw();
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
        // if (piece.player === players.HUMAN) {
        pieceSelected = piece;
        // }
      } else {
        let piece = board.getPiece(col, row);
        if (piece.player === players.HUMAN) {
          pieceSelected = piece;
        } else {
          // Capture a piece
          board.movePiece(pieceSelected, col, row);
          pieceSelected = null;
        }
      }
    } else if (pieceSelected) {
      let moves = pieceSelected.getAvailableMoves();
      let wishedMove = findMove(col, row, moves);

      if (!wishedMove) {
        pieceSelected = null;
        return;
      } else {
        board.movePiece(pieceSelected, col, row);
        pieceSelected = null;
        // let result = checkWinner();
        // if (result) {
        //   end = true;
        //   currentPlayer = null;
        // } else {
        //   currentPlayer = players.AI;
        // }
      }
    }
  }
}

function checkWinner() {
  let winner = null;

  return winner;
}
