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
      Show Answer [Debug]
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

function DifficultyPicker(props) {
  return (
    <select
      className="difficulty-picker"
      defaultValue="beginner"
      onChange={(e) => { props.onChange(e.target.value); }}
    >
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="expert">Expert</option>
    </select>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let rows = 10, cols = 10, mines = 10;
    this.timer = null;

    this.state = {
      rows: rows,
      cols: cols,
      mines: mines,
      viewableBoard: logic.initializeViewableBoard(rows, cols),
      hiddenBoard: null,
      showHidden: false,
      gameWon: null,
      time: 0,
      isNewGame: true,
      difficulty: 'beginner',
    }
  }

  handleButtonClick(x, y) {
    let hiddenBoard = this.state.hiddenBoard;
    if (this.state.isNewGame) {
      // every beginning of the game has to start with the user clicking on a "zero" square
      // so initialize a new board until the square that the user clicked on is a "zero" square
      do {
        hiddenBoard = logic.initializeHiddenBoard(
          this.state.rows,
          this.state.cols,
          this.state.mines
        );
      } while (hiddenBoard[x][y] !== logic.SquareValueEnum['0']);
      this.setState({ hiddenBoard: hiddenBoard, isNewGame: false });
    }

    // if we click on a square with a flag on it, do nothing
    if (this.state.viewableBoard[x][y] === logic.SquareValueEnum['flag']) {
      return;
    }

    // if we clicked on a mine, then game over and show the entire board
    if (hiddenBoard[x][y] === logic.SquareValueEnum['mine']) {
      this.setState({showHidden: true, gameWon: false});
      clearInterval(this.timer);
      return;
    }

    // otherwise show the number we clicked on
    let viewableBoard = logic.showClickedSquares(this.state.viewableBoard, hiddenBoard, x, y);

    // check if we won the game
    if (logic.checkVictoryCondition(viewableBoard, hiddenBoard)) {
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

  showAnswer() {
    this.setState({showHidden: true, gameWon: false});
    clearInterval(this.timer);
  }

  startNewGame(difficulty) {
    let gameParams = null;
    difficulty = difficulty || this.state.difficulty;
    if (difficulty === 'beginner') {
      gameParams = { rows: 10, cols: 10, mines: 10 };
    } else if (difficulty === 'intermediate') {
      gameParams = { rows: 16, cols: 16, mines: 40 };
    } else if (difficulty === 'expert') {
      gameParams = { rows: 16, cols: 30, mines: 99 };
    }

    this.setState({
      rows: gameParams.rows,
      cols: gameParams.cols,
      mines: gameParams.mines,
      viewableBoard: logic.initializeViewableBoard(gameParams.rows, gameParams.cols),
      hiddenBoard: null,
      gameWon: null,
      showHidden: false,
      time: 0,
      isNewGame: true,
      difficulty: difficulty,
    });
    clearInterval(this.timer);

    this.timer = setInterval(() => {this.setState({time: this.state.time + 1})}, 1000);
  }

  renderBoard() {
    return (
      <Board
        rows={this.state.rows}
        cols={this.state.cols}
        mines={this.state.mines}
        board={this.state.showHidden ? this.state.hiddenBoard : this.state.viewableBoard}
        btnClick={(x, y) => this.handleButtonClick(x, y)}
        btnRightClick={(x, y) => this.handleButtonRightClick(x, y)}
      />
    );
  }

  componentDidMount() {
    this.startNewGame();
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
        <NewGameButton onClick={() => this.startNewGame()} />
        <DifficultyPicker onChange={(difficulty) => this.startNewGame(difficulty) } />
      </div>
    );
  }
}

ReactDOM.render(<Game/>, document.getElementById('root'));
