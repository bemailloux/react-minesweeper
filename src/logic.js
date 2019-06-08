export const SquareValueEnum = {
  'unknown': '-',
  'mine': 'x',
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'flag': 'F',
}

// game logic functions
export function calculateAdjacentMines(board, x, y) {
  if (board[x][y] === SquareValueEnum['mine']) return SquareValueEnum['mine'];
  let count = 0;

  // check the row above this row
  if (x > 0) {
    if (y > 0) {
      if (board[x-1][y-1] === SquareValueEnum['mine']) count++;
    }
    if (board[x-1][y] === SquareValueEnum['mine']) count++;
    if (y < board[x].length - 1) {
      if (board[x-1][y+1] === SquareValueEnum['mine']) count++;
    }
  }

  // check this row
  if (y > 0) {
    if (board[x][y-1] === SquareValueEnum['mine']) count++;
  }
  if (board[x][y] === SquareValueEnum['mine']) count++;
  if (y < board[x].length - 1) {
    if (board[x][y+1] === SquareValueEnum['mine']) count++;
  }

  // check the row below this row
  if (x < board.length - 1) {
    if (y > 0) {
      if (board[x+1][y-1] === SquareValueEnum['mine']) count++;
    }
    if (board[x+1][y] === SquareValueEnum['mine']) count++;
    if (y < board[x].length - 1) {
      if (board[x+1][y+1] === SquareValueEnum['mine']) count++;
    }
  }

  return count;
}

export function initializeViewableBoard(numRows, numCols) {
  let viewableBoard = new Array(parseInt(numRows));
  for (let i = 0; i < numRows; i++) {
    viewableBoard[i] = (new Array(parseInt(numCols))).fill(SquareValueEnum['unknown']);
  }

  return viewableBoard;
}

export function initializeHiddenBoard(numRows, numCols, numMines) {
  if (numMines > numRows * numCols) {
    // too many mines
    return;
  }

  // create the board
  let board = new Array(parseInt(numRows));
  for (let i = 0; i < numRows; i++) {
    board[i] = new Array(parseInt(numCols));
  }

  // put mines randomly in the board
  for (let mineIdx = 0; mineIdx < numMines; mineIdx++) {
    let mineRow, mineCol;
    do {
      mineRow = Math.floor(Math.random() * numRows);
      mineCol = Math.floor(Math.random() * numCols);
    } while(board[mineRow][mineCol] === SquareValueEnum['mine']);

    board[mineRow][mineCol] = SquareValueEnum['mine'];
  }

  // calculate number of adjacent mines to each square
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      board[i][j] = calculateAdjacentMines(board, i, j);
    }
  }

  return board;
}

export function showClickedSquares(viewableBoard, hiddenBoard, x, y) {
  // if we already checked this square, don't bother checking it again
  if (viewableBoard[x][y] !== SquareValueEnum['unknown']) return viewableBoard;
  viewableBoard[x][y] = hiddenBoard[x][y];

  // do recursive "zero expansion"
  if (hiddenBoard[x][y] === SquareValueEnum['0']) {
    if (x > 0) {
      if (y > 0) viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x-1, y-1);
      viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x-1, y);
      if (y < viewableBoard[0].length-1) viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x-1, y+1);
    }

    if (y > 0) viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x, y-1);
    if (y < viewableBoard[0].length-1) viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x, y+1);

    if (x < viewableBoard.length-1) {
      if (y > 0) viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x+1, y-1);
      viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x+1, y);
      if (y < viewableBoard[0].length-1) viewableBoard = showClickedSquares(viewableBoard, hiddenBoard, x+1, y+1);
    }
  }

  return viewableBoard;
}

export function checkVictoryCondition(viewableBoard, hiddenBoard) {
  let verifyBoard = viewableBoard.map((row) => {
    return row.map((item) => {
      return (item === SquareValueEnum['unknown'] || item === SquareValueEnum['flag']) ? SquareValueEnum['mine'] : item;
    });
  });

  return verifyBoard.every((row, i) => {
    return row.every((val, j) => {
      return val === hiddenBoard[i][j];
    });
  });
}
