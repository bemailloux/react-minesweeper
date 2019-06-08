import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={'square bg-color' + props.value} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  render() {
    let rows = [];
    for (let i = 0; i < this.props.rows; i++) {
      let cols = [];
      for (let j = 0; j < this.props.cols; j++) {
        cols.push(
          <Square
            key={i + ' ' + j}
            value={this.props.board[i][j]}
            onClick={() => this.props.btnClick(i,j)}
          />
        );
      }

      rows.push(
        <div className='board-row' key={i}>
          {cols}
        </div>
      );
    }

    return (
      <div className='board'>
        {rows}
      </div>
    );
  }
}

function ShowAnswerButton(props) {
  return (
    <button className='show-answer-button' onClick={props.onClick}>
      Show Answer
    </button>
  );
}

function NewGameButton(props) {
  return (
    <button className='new-game-button' onClick={props.onClick}>
      New Game
    </button>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let viewableBoard = new Array(parseInt(this.props.rows));
    for (let i = 0; i < this.props.rows; i++) {
      viewableBoard[i] = (new Array(parseInt(this.props.cols))).fill('-');
    }

    this.state = {
      viewableBoard: initializeViewableBoard(this.props.rows, this.props.cols),
      hiddenBoard: initializeHiddenBoard(
        this.props.rows,
        this.props.cols,
        this.props.mines
      ),
      showHidden: false,
      gameWon: null,
    }
  }

  handleButtonClick(x, y) {
    // if we clicked on a mine, then show the entire board
    if (this.state.hiddenBoard[x][y] === 'x') {
      this.setState({showHidden: true, gameWon: false});
      return;
    }

    // otherwise show the number we clicked on
    let viewableBoard = showClickedSquares(this.state.viewableBoard, this.state.hiddenBoard, x, y);
    if (checkVictoryCondition(viewableBoard, this.state.hiddenBoard)) {
      this.setState({gameWon: true});
    }

    this.setState({viewableBoard: viewableBoard});
  }

  handleShowAnswerButtonClick() {
    this.setState({showHidden: true});
  }

  handleNewGameButtonClick() {
    this.setState({
      viewableBoard: initializeViewableBoard(this.props.rows, this.props.cols),
      hiddenBoard: initializeHiddenBoard(
        this.props.rows,
        this.props.cols,
        this.props.mines
      ),
      gameWon: null,
      showHidden: false,
    });
  }

  renderBoard() {
    return (
      <Board
        rows={this.props.rows}
        cols={this.props.cols}
        mines={this.props.mines}
        board={this.state.showHidden ? this.state.hiddenBoard : this.state.viewableBoard}
        btnClick={(x, y) => this.handleButtonClick(x, y)}
      />
    );
  }

  render() {
    let winOrLoseText = '';
    if (this.state.gameWon === true) {
      winOrLoseText = 'You won! :)';
    } else if (this.state.gameWon === false) {
      winOrLoseText = 'Game over! X(';
    }

    return (
      <div>
        <div className="win-or-lose">{winOrLoseText}</div>
        {this.renderBoard()}
        <ShowAnswerButton onClick={() => this.handleShowAnswerButtonClick()} />
        <NewGameButton onClick={() => this.handleNewGameButtonClick()} />
      </div>
    );
  }
}

ReactDOM.render(<Game rows='10' cols='10' mines='10'/>, document.getElementById('root'));

function calculateAdjacentMines(board, x, y) {
  if (board[x][y] === 'x') return 'x';
  let count = 0;

  // check the row above this row
  if (x > 0) {
    if (y > 0) {
      if (board[x-1][y-1] === 'x') count++;
    }
    if (board[x-1][y] === 'x') count++;
    if (y < board[x].length - 1) {
      if (board[x-1][y+1] === 'x') count++;
    }
  }

  // check this row
  if (y > 0) {
    if (board[x][y-1] === 'x') count++;
  }
  if (board[x][y] === 'x') count++;
  if (y < board[x].length - 1) {
    if (board[x][y+1] === 'x') count++;
  }

  // check the row below this row
  if (x < board.length - 1) {
    if (y > 0) {
      if (board[x+1][y-1] === 'x') count++;
    }
    if (board[x+1][y] === 'x') count++;
    if (y < board[x].length - 1) {
      if (board[x+1][y+1] === 'x') count++;
    }
  }

  return count;
}

function initializeViewableBoard(numRows, numCols) {
  let viewableBoard = new Array(parseInt(numRows));
  for (let i = 0; i < numRows; i++) {
    viewableBoard[i] = (new Array(parseInt(numCols))).fill('-');
  }

  return viewableBoard;
}

function initializeHiddenBoard(numRows, numCols, numMines) {
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
    } while(board[mineRow][mineCol] === 'x');

    board[mineRow][mineCol] = 'x';
  }

  // calculate number of adjacent mines to each square
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      board[i][j] = calculateAdjacentMines(board, i, j);
    }
  }

  return board;
}

function showClickedSquares(viewableBoard, hiddenBoard, x, y) {
  // if we already checked this square, don't bother checking it again
  if (viewableBoard[x][y] !== '-') return viewableBoard;
  viewableBoard[x][y] = hiddenBoard[x][y];

  // do recursive "zero expansion"
  if (hiddenBoard[x][y] === 0) {
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

function checkVictoryCondition(viewableBoard, hiddenBoard) {
  let verifyBoard = hiddenBoard.map((row) => {
    return row.map((item) => { return item === 'x' ? '-' : item; });
  });

  return verifyBoard.every((row, i) => {
    return row.every((val, j) => {
      return val === viewableBoard[i][j];
    });
  });
}
