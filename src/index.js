import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as logic from './logic.js';

// Components
function Square(props) {
  return (
    <button
      className={'square bg-color' + props.value}
      onClick={props.onClick}
      onContextMenu={(e) => {e.preventDefault(); props.onRightClick();}}
    >
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
            onRightClick={() => this.props.btnRightClick(i,j)}
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
      viewableBoard[i] = (new Array(parseInt(this.props.cols))).fill(logic.SquareValueEnum['unknown']);
    }
    this.timer = null;

    this.state = {
      viewableBoard: logic.initializeViewableBoard(this.props.rows, this.props.cols),
      hiddenBoard: logic.initializeHiddenBoard(
        this.props.rows,
        this.props.cols,
        this.props.mines
      ),
      showHidden: false,
      gameWon: null,
      time: 0,

    }
  }

  handleButtonClick(x, y) {
    // if we click on a square with a flag on it, do nothing
    if (this.state.viewableBoard[x][y] === logic.SquareValueEnum['flag']) {
      return;
    }

    // if we clicked on a mine, then game over and show the entire board
    if (this.state.hiddenBoard[x][y] === logic.SquareValueEnum['mine']) {
      this.setState({showHidden: true, gameWon: false});
      clearInterval(this.timer);
      return;
    }

    // otherwise show the number we clicked on
    let viewableBoard = logic.showClickedSquares(this.state.viewableBoard, this.state.hiddenBoard, x, y);

    // check if we won the game
    if (logic.checkVictoryCondition(viewableBoard, this.state.hiddenBoard)) {
      this.setState({gameWon: true});
      clearInterval(this.timer);
    }

    this.setState({viewableBoard: viewableBoard});
  }

  handleButtonRightClick(x, y) {
    // add flag when user right clicks
    let viewableBoard = this.state.viewableBoard;
    // only allow right clicks on empty squares and flag squares
    if (viewableBoard[x][y] === logic.SquareValueEnum['unknown']) {
      viewableBoard[x][y] = logic.SquareValueEnum['flag'];
    } else if (viewableBoard[x][y] === logic.SquareValueEnum['flag']) {
      viewableBoard[x][y] = logic.SquareValueEnum['unknown'];
    }

    this.setState({viewableBoard: viewableBoard});
  }

  handleShowAnswerButtonClick() {
    this.setState({showHidden: true, gameWon: false});
    clearInterval(this.timer);
  }

  handleNewGameButtonClick() {
    this.setState({
      viewableBoard: logic.initializeViewableBoard(this.props.rows, this.props.cols),
      hiddenBoard: logic.initializeHiddenBoard(
        this.props.rows,
        this.props.cols,
        this.props.mines
      ),
      gameWon: null,
      showHidden: false,
      time: 0,
    });
    clearInterval(this.timer);

    this.timer = setInterval(() => {this.setState({time: this.state.time + 1})}, 1000);
  }

  renderBoard() {
    return (
      <Board
        rows={this.props.rows}
        cols={this.props.cols}
        mines={this.props.mines}
        board={this.state.showHidden ? this.state.hiddenBoard : this.state.viewableBoard}
        btnClick={(x, y) => this.handleButtonClick(x, y)}
        btnRightClick={(x, y) => this.handleButtonRightClick(x, y)}
      />
    );
  }

  componentDidMount() {
    this.timer = setInterval(() => {this.setState({time: this.state.time + 1})}, 1000);
  }

  render() {
    let winOrLoseText = '';
    if (this.state.gameWon === true) {
      winOrLoseText = 'You won! :)';
    } else if (this.state.gameWon === false) {
      winOrLoseText = 'Game over! :(';
    }
    winOrLoseText += ' Time: ' + this.state.time + ' seconds';

    return (
      <div>
        {this.renderBoard()}
        <div className="win-or-lose">{winOrLoseText}</div>
        <ShowAnswerButton onClick={() => this.handleShowAnswerButtonClick()} />
        <NewGameButton onClick={() => this.handleNewGameButtonClick()} />
      </div>
    );
  }
}

ReactDOM.render(<Game rows='10' cols='10' mines='10'/>, document.getElementById('root'));
