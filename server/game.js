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
	  pits: pits
    };
  }