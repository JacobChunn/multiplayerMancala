const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame
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
	  playerTurn: 0 // Could make random number
    };
  }

function makeTurn(state, pit) {

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
		return 0;
	} else if (state.player[pos[0]].pits[pos[1]] != 0) {
		moveMarbles(state, playerTurn, pos[0], pos[1]);
	}
	return 1;
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

}

function rotateTurns() {

}