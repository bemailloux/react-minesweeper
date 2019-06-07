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
  constructor(props) {
    super(props);
    this.state = {
      viewableStatus: [],
      hiddenStatus: initializeHiddenBoard(
        this.props.rows,
        this.props.cols,
        this.props.mines
      ),
    }
  }

  render() {
    let rows = [];
    for (let i = 0; i < this.props.rows; i++) {
      let cols = [];
      for (let j = 0; j < this.props.cols; j++) {
        cols.push(<Square key={j} />);
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
  handleShowAnswerButtonClick() {

  }

  render() {
    return (
      <div>
        <Board rows='10' cols='10' mines='10'/>
        <ShowAnswerButton onClick={() => this.handleShowAnswerButtonClick()} />
      </div>
    );
  }
}

ReactDOM.render(<Game/>, document.getElementById('root'));

function initializeHiddenBoard(numRows, numCols, numMines) {
  if (numMines > numRows * numCols) {
    // too many mines
    return;
  }

  // create the board
  let board = new Array(numRows);
  for (let i = 0; i < numRows; i++) {
    board[i] = (new Array(numCols)).fill('-');
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

  return board;
}
