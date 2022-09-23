import { BOARD_WIDTH_PROP, BOARD_HEIGHT_PROP, BOARD_HORIZONTAL_OFFSET,
	BOARD_VERTICAL_OFFSET, SCORE_PILE_VERTICAL_PROP, SCORE_PILE_HORIZONTAL_PROP,
	PIT_VERTICAL_PROP, PIT_HORIZONTAL_PROP, PIT_GAP
	} from './constants';

const BG_COLOR = "#90EE90";
const BOARD_COLOR = "#DEB887";


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

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
  
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    document.addEventListener("click", click);
    gameActive = true;
}

function paintGame2P(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	const boardHorizontalStartPos = canvas.width * BOARD_HORIZONTAL_OFFSET;
	const boardVerticalStartPos = canvas.height * BOARD_VERTICAL_OFFSET;
	const boardWidth = canvas.width * BOARD_WIDTH_PROP;
	const boardHeight = canvas.height * BOARD_HEIGHT_PROP;

	ctx.fillStyle = BOARD_COLOR;
	ctx.fillRect(boardHorizontalStartPos, boardVerticalStartPos,
		boardWidth, boardHeight);
	
	let j = playerNumber;
	const pitVerticalDistance = canvas.height * PIT_VERTICAL_PROP / (state.pits + 1);
	const pitHorizontalDistance = canvas.width * (PIT_HORIZONTAL_PROP - PIT_GAP)
		/ (state.players.length + 1);
	const pitTotalDistance = canvas.height * PIT_VERTICAL_PROP;
	const scorePileHorizontalDistance = canvas.width * SCORE_PILE_HORIZONTAL_PROP / 2;
	const scorePileVerticalDistance = canvas.width * SCORE_PILE_VERTICAL_PROP / 2;

	for (var i = 0; i < state.pits; i++) {
		ctx.textAlign = "center";
		// Paint the pits
		ctx.fillText("" + state.player[playerNumber].pits[i],
			boardHorizontalStartPos + pitHorizontalDistance,
			boardVerticalStartPos + pitVerticalDistance * (i + 1));
		ctx.fillText("" + state.player[(playerNumber + 1) % 2].pits[i],
			boardHorizontalStartPos + pitHorizontalDistance * 2 + PIT_GAP,
			boardVerticalStartPos + pitVerticalDistance * (i + 1));
		
		// Paint the score piles
		ctx.fillText("" + state.player[playerNumber].scorePile,
			boardHorizontalStartPos + scorePileHorizontalDistance,
			boardVerticalStartPos + scorePileVerticalDistance * 3 + pitTotalDistance);
		ctx.fillText("" + state.player[(playerNumber + 1) % 2].scorePile,
			boardHorizontalStartPos + scorePileHorizontalDistance,
			boardVerticalStartPos + scorePileVerticalDistance);
	}

}

function click() {
    // Determine which (if any) of marble pits were clicked
    // Emit turn event (make server check if it is able to be played or is players turn)
}