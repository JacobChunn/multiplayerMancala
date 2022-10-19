import { BOARD_WIDTH_PROP, BOARD_HEIGHT_PROP, BOARD_HORIZONTAL_OFFSET,
	BOARD_VERTICAL_OFFSET, SCORE_PILE_DISTANCE_FROM_PITS_PROP,
	PIT_AVAILABLE_VERTICAL_SPACE, PIT_HORIZONTAL_DISTANCE_BETWEEN_PITS_PROP,
	PIT_RAD
	} from '/constants.js';

const BG_COLOR = "#90EE90";
const BOARD_COLOR = "#DEB887";
const MARBLE_COLOR = "#000000";
const PIT_COLOR = "#C0B396";

const socket = io("127.0.0.1:3000");

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameStart', handleStartGame);
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
const gameCodeContainer = document.getElementById('gameCodeContainer');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
	gameScreen.style.display = "block";
	initialScreen.style.display = "none";
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
	gameScreen.style.display = "block";
	gameCodeContainer.style.display = "none";
	initialScreen.style.display = "none";
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

let pitCoords;
let scorePileCoords = [];
let pitsArcs = [[], []];

let boardHorizontalStartPos;
let boardVerticalStartPos;
let boardWidth;
let boardHeight;

let boardHorizontalCenter;
let boardVerticalCenter;

let pitHorizontalDistanceBetweenPits;
let pitAvailableVerticalSpace;
let pitTotalDistance;

let scorePileDistanceFromPits;

function handleStartGame(state) {
	console.log("Game started!");
	state = JSON.parse(state);

	gameCodeContainer.style.display = "none";
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

	boardHorizontalStartPos = canvas.width * BOARD_HORIZONTAL_OFFSET;
	boardVerticalStartPos = canvas.height * BOARD_VERTICAL_OFFSET;
	boardWidth = canvas.width * BOARD_WIDTH_PROP;
	boardHeight = canvas.height * BOARD_HEIGHT_PROP;

	boardHorizontalCenter = boardHorizontalStartPos + (boardWidth / 2);
	boardVerticalCenter = boardVerticalStartPos + (boardHeight / 2)

	pitHorizontalDistanceBetweenPits = boardWidth * PIT_HORIZONTAL_DISTANCE_BETWEEN_PITS_PROP;
	pitAvailableVerticalSpace = boardHeight * PIT_AVAILABLE_VERTICAL_SPACE;

	scorePileDistanceFromPits = boardWidth * SCORE_PILE_DISTANCE_FROM_PITS_PROP;

	pitCoords = new Array(state.players.length);

	for (var i = 0; i < state.players.length; i++) {
		scorePileCoords.push([
			boardHorizontalStartPos + scorePileHorizontalDistance,
			boardVerticalStartPos + (scorePileVerticalDistance * 
				(3 + pitTotalDistance)) ** ((i + playerNumber) % 2)
		]);
		pitCoords[i] = new Array(state.pits);
		for ( var j = 0; j < state.pits; j++) {
			pitCoords[i][j] = new Array(2);
		}
	}
	distributePitsX(pitCoords, boardHorizontalCenter, pitHorizontalDistanceBetweenPits);
	distributePitsY(pitCoords, boardVerticalCenter, pitAvailableVerticalSpace);
/*
	distributePits(pitCoords, boardHorizontalCenter, boardVerticalCenter,
		state.players.length, state.pits, pitHorizontalDistanceBetweenPits,
		scorePileVerticalDistance);
*/
	for (var i = 0; i < state.players.length; i++) {
		for (var j = 0; j < state.pits; j++) {
			pitsArcs[(i + playerNumber) % 2].push(new Path2D());
			pitsArcs[(i + playerNumber) % 2][j].arc(
				pitCoords[(i + playerNumber) % 2][j][0],
				pitCoords[(i + playerNumber) % 2][j][1],
				PIT_RAD,
				0,
				2 * Math.PI);
		}
	}

    canvas.addEventListener("click", click);
    gameActive = true;
	requestAnimationFrame(() => paintGame2P(state));
}
/*
function distributePits(pitArr, centerX, centerY, pitsX, pitsY, pitDistanceX, pitDistanceY) {
	let firstPitX = centerX - (pitsX - 1) / 2 * pitDistanceX;
	let firstPitY = centerY - (pitsY - 1) / 2 * pitDistanceY;

	for (var i = 0; i < pitsX; i++) {
		for (var j = 0; j < pitsY; j++) {
			pitArr[i][j] = [
				firstPitX + pitDistanceX * i,
				firstPitY + pitDistanceY * j
			];
		}
	}
}
*/

function distributePitsX(pitArr, centerX, pitDistanceX) {
	let firstPitX = centerX - (pitArr.length - 1) / 2 * pitDistanceX;

	for (var i = 0; i < pitArr.length; i++) {
		for (var j = 0; j < pitArr[i].length; j++) {
			pitArr[i][j][0] = firstPitX + pitDistanceX * i;
		}
	}
}

function distributePitsY(pitArr, centerY, availableVerticalSpace) {
	for (var i = 0; i < pitArr.length; i++) {
		let pitDistanceY = availableVerticalSpace / (pitArr[i].length + 1);
		for (var j = 0; j < pitArr[i].length; j++) {
			let firstPitY = centerY - (pitArr[i].length - 1) / 2 * pitDistanceY;
			pitArr[i][j][1] = firstPitY + pitDistanceY * j;
		} 
	}
}

function distributeScorePiles(scorePileArr, centerY, pitVerticalSpace, pitDistance,
	distanceFromPitSpace) {
	if (pitArr.length == 0) return;

	let distanceBetweenPits = 0;
	let topOfVerticalSpace = centerY - (pitVerticalSpace / 2);
	let bottomOfVerticalSpace = centerY + (pitVerticalSpace / 2);

	if (pitArr.length > 1) {
		if (pitArr[0].length > 0 && pitArr[1].length > 0) {
			distanceBetweenPits = pitArr[0][0][0] - pitArr[1][0][0];
		}
	}

	for (var i = 0; i < pitArr.length; i++) {

	}
}

function paintGame2P(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = BOARD_COLOR;
	ctx.fillRect(boardHorizontalStartPos, boardVerticalStartPos,
		boardWidth, boardHeight);
	
	console.log(state.pits);

	for (var i = 0; i < state.pits; i++) {
		ctx.textAlign = "center";
		ctx.fillStyle = PIT_COLOR;
		// Paint the pits
		paintPit(state, 0, i, 0, 1);
		paintPit(state, 1, i, 0, 1);
	}
	// Paint the score piles
	paintScorePile(state, playerNumber, 0, 1);
	paintScorePile(state, (playerNumber + 1) % 2, 0, 1);
}

function paintPit(state, player, pit, xIndex, yIndex) {
	ctx.fillStyle = PIT_COLOR;
	ctx.fill(pitsArcs[player][pit]);

	ctx.textAlign = "center";
	ctx.fillStyle = MARBLE_COLOR;
	ctx.fillText(
		"" + state.players[player].pits[pit],
		pitCoords[player][pit][xIndex],
		pitCoords[player][pit][yIndex]
	);
}

function paintScorePile(state, player, xIndex, yIndex) {
	ctx.fillText(
		"" + state.players[player].scorePile,
		scorePileCoords[player][xIndex],
		scorePileCoords[player][yIndex]
	);
	console.log("Player: " + player + ": " + state.players[player].scorePile + "\n");
	console.log("X: " + scorePileCoords[player][xIndex] + " Y: " + scorePileCoords[player][yIndex] + "\n");
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
	for (var  i = 0; i < pitsArcs[0].length; i++) {
		if (ctx.isPointInPath(pitsArcs[0][i], event.offsetX, event.offsetY)) {
			socket.emit('click', i)
			break;
		}
	}
}