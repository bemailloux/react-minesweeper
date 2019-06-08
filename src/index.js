import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className='square' onClick={props.onClick}>
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
        cols.push(<Square key={j} value={this.props.board[i][j]}/>);
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
      Show answer
    </button>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let viewableBoard = new Array(parseInt(this.props.rows));
    for (let i = 0; i < this.props.rows; i++) {
      viewableBoard[i] = new Array(parseInt(this.props.cols));
    }

    this.state = {
      viewableBoard: viewableBoard,
      hiddenBoard: initializeHiddenBoard(
        this.props.rows,
        this.props.cols,
        this.props.mines
      ),
      showHidden: false,
    }
  }

  handleShowAnswerButtonClick() {
    this.setState({showHidden: true});
    for (let i = 0; i < this.props.rows; i++) {
      console.log(this.state.hiddenBoard[i].join(''));
    }
  }

  renderBoard() {
    return (
      <Board
        rows={this.props.rows}
        cols={this.props.cols}
        mines={this.props.mines}
        board={this.state.showHidden ? this.state.hiddenBoard : this.state.viewableBoard}
      />
    );
  }

  render() {
    return (
      <div>
        {this.renderBoard()}
        <ShowAnswerButton onClick={() => this.handleShowAnswerButtonClick()} />
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
