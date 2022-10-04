const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
	makeTurn,
	getWinner
  }

function initGame(pits, marbles) {
    const state = createGameState(pits, marbles)
    return state;
}

function createGameState(pits, marbles) {
    return {
      players: [{
        pits: Array(pits).fill(marbles),
        scorePile: 0
      }, {
        pits: Array(pits).fill(marbles),
        scorePile: 0
      }],
	  pits: pits,
	  playerTurn: 0 // Could initalize to a random number
    };
  }

// Check if a move can be made with the provided pit. Perfrom move and 
// return true if move was able to be played, false if it was not able
// to be played.
function makeTurn(state, pit) {
	// Check if pit is a valid pit
	if (pit < 0 || pit > state.pits - 1) return false;

	// Check if pit is empty
	if (state.players[state.playerTurn].pits[pit] == 0) return false;

	// Call move marbles
	moveMarbles(state, state.playerTurn, state.playerTurn, pit);

	return true;
}

function moveMarbles(state, playerTurn, playerSide, pit) {
	let marblesToMove = state.player[playerSide].pits[pit];
	state.player[playerSide].pits[pit] = 0;
	let pos = [playerSide, pit];
	while (marblesToMove != 0) {
		pos = getNextPile(pos[0], pos[1], state.pits, playerTurn);
		if (pos[1] == -1) {
			state.player[pos[0]].scorePile++;
		} else {
			state.player[pos[0]].pits[pos[1]]++;
		}
		marblesToMove--;
	}
	if (pos[1] == -1) {
		return;
	} else if (state.player[pos[0]].pits[pos[1]] != 0) {
		moveMarbles(state, playerTurn, pos[0], pos[1]);
	}
	rotateTurns(state);
}

function getNextPlayer(playerNum) {
	return (playerNum + 1) % 2;
}

// Returns an array containig the player number and the pile position that
// comes after the one provided. Returns -1 if the next pile is a score pile.
function getNextPile(playerSide, pit, maxPits, playerTurn) {
	// Return the beginning of the next player's side if the current pile is:
	// 1.) the score pile of the current side
	// 2.) the last pit of a side of a player whose turn it is not
	if (pit == -1 ||
		pit == maxPits - 1 &&
		playerTurn != playerSide
	) return [getNextPlayer(playerSide), 0];

	// Return the score pile if the current pile is the last pit of
	// the side of the player whose turn it is
	if (pit == maxPits - 1) return [playerSide, -1];

	// Return the next pit if it is not the last pit
	return [playerSide, pit + 1];
}

function getWinner(state) {
	if (!gameIsOver(state)) return -1;

	for (var i = 0; i < state.players.length; i++) {
		movePlayerMarblesToScorePile(state, i);
	}

	return getPlayerWithHighestScore(state);
}

function gameIsOver(state) {
	for (var i = 0; i < state.players.length; i++) {
		if(playerPitsAreEmpty(state, i)) {
			return true;
		}
	}
}

function getPlayerWithHighestScore(state) {
	var player = -1;
	var score = -1;
	for (var i = 0; i < state.players.length; i++) {
		if (score < state.players[i].scorePile) {
			player = i;
			score = state.players[i].scorePile;
		}
	}
	return player;
}

function movePlayerMarblesToScorePile(state, player) {
	var marbles = 0;
	for (var i = 0; i < state.pits; i++) {
		marbles += state.players[player].pits[i];
		state.players[player].pits[i] = 0;
	}
	state.players[player].scorePile += marbles;
}

function playerPitsAreEmpty(state, player) {
	for (var i = 0; i < state.pits; i++) {
		if (state.players[player].pits[i] != 0) {
			return false;
		}
	}
	return true;
}

function rotateTurns(state) {
	state.playerTurn++;
	if (state.playerTurn > state.players.length - 1) {
		state.playerTurn = 0;
	}
}