import { BOARD_WIDTH_PROP, BOARD_HEIGHT_PROP, BOARD_HORIZONTAL_OFFSET,
	BOARD_VERTICAL_OFFSET, SCORE_PILE_VERTICAL_PROP, SCORE_PILE_HORIZONTAL_PROP,
	PIT_VERTICAL_PROP, PIT_HORIZONTAL_PROP, PIT_GAP, PIT_RAD
	} from './constants';

const BG_COLOR = "#90EE90";
const BOARD_COLOR = "#DEB887";

const socket = io("http://localhost:3000");

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

let pitCoords = [[], []];
let scorePileCoords = [];
let clickablePits = [];

let boardHorizontalStartPos;
let boardVerticalStartPos;
let boardWidth;
let boardHeight;

let pitVerticalDistance;
let pitHorizontalDistance;
let pitTotalDistance;
let scorePileHorizontalDistance;
let scorePileVerticalDistance;

function init(state) {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
  
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

	boardHorizontalStartPos = canvas.width * BOARD_HORIZONTAL_OFFSET;
	boardVerticalStartPos = canvas.height * BOARD_VERTICAL_OFFSET;
	boardWidth = canvas.width * BOARD_WIDTH_PROP;
	boardHeight = canvas.height * BOARD_HEIGHT_PROP;

	pitVerticalDistance = canvas.height * PIT_VERTICAL_PROP / (state.pits + 1);
	pitHorizontalDistance = canvas.width * (PIT_HORIZONTAL_PROP - PIT_GAP)
		/ (state.players.length + 1);
	pitTotalDistance = canvas.height * PIT_VERTICAL_PROP;
	scorePileHorizontalDistance = canvas.width * SCORE_PILE_HORIZONTAL_PROP / 2;
	scorePileVerticalDistance = canvas.width * SCORE_PILE_VERTICAL_PROP / 2;

	for (var i = 0; i < state.players.length; i++) {
		scorePileCoords.push([
			boardHorizontalStartPos + scorePileHorizontalDistance,
			boardVerticalStartPos + scorePileVerticalDistance * 
			((3 + pitTotalDistance) ** ((i + 1) % 2))
		]);
		for (var j = 0; j < state.pits; j++) {
			pitCoords[i].push([
				boardHorizontalStartPos + pitHorizontalDistance * ((2 + PIT_GAP) ** i),
				boardVerticalStartPos + pitVerticalDistance * (j + 1)
			]);
		}
	}

	for (var i = 0; i < state.pits; i++) {
		clickablePits.push(new Path2D());
		clickablePits[i].arc(
			pitCoords[0][i][0],
			pitCoords[0][i][1],
			PIT_RAD,
			0,
			2 * Math.PI);
	}

    canvas.addEventListener("click", click);
    gameActive = true;
}

function paintGame2P(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = BOARD_COLOR;
	ctx.fillRect(boardHorizontalStartPos, boardVerticalStartPos,
		boardWidth, boardHeight);
	

	for (var i = 0; i < state.pits; i++) {
		ctx.textAlign = "center";
		// Paint the pits
		ctx.fillText(
			"" + state.player[playerNumber].pits[i],
			pitCoords[playerNumber][i][0],
			pitCoords[playerNumber][i][1]
		);
		ctx.fillText(
			"" + state.player[(playerNumber + 1) % 2].pits[i],
			pitCoords[(playerNumber + 1) % 2][i][0],
			pitCoords[(playerNumber + 1) % 2][i][1]
		);
		
		// Paint the score piles
		ctx.fillText(
			"" + state.player[playerNumber].scorePile,
			scorePileCoords[playerNumber][0],
			scorePileCoords[playerNumber][1]
		);
		ctx.fillText(
			"" + state.player[(playerNumber + 1) % 2].scorePile,
			scorePileCoords[(playerNumber + 1) % 2][0],
			scorePileCoords[(playerNumber + 1) % 2][1]
		);
	}

}

function handleInit(number) {
	playerNumber = number;
}

function handleGameState(gameState) {
	if (!gameActive) {
	  return;
	}
	gameState = JSON.parse(gameState);
	requestAnimationFrame(() => paintGame2P(gameState));
}

function handleGameOver(data) {
	if (!gameActive) {
	  return;
	}
	data = JSON.parse(data);
  
	gameActive = false;
  
	if (data.winner === playerNumber) {
	  alert('You Win!');
	} else {
	  alert('You Lose :(');
	}
}

function handleGameCode(gameCode) {
	gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
	reset();
	alert('Unknown Game Code')
}

function handleTooManyPlayers() {
	reset();
	alert('This game is already in progress');
}

function reset() {
	playerNumber = null;
	gameCodeInput.value = '';
	initialScreen.style.display = "block";
	gameScreen.style.display = "none";
	pitCoords = [[], []];
}

function click(event) {
    // Determine which (if any) of marble pits were clicked
    // Emit turn event (make server check if it is able to be played or is players turn)
	for (var  i = 0; i < clickablePits.length; i++) {
		if (ctx.isPointInPath(clickablePits[i], event.offsetX, event.offsetY)) {
			socket.emit('click', i)
		}
		break;
	}
}