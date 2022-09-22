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
        score_pile: 0
      }, {
        pits: Array(pits).fill(marbles),
        score_pile: 0
      }]
    };
  }