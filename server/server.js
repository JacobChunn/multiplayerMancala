const io = require('socket.io')();
const { initGame, makeTurn, getWinner } = require('./game');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {

	client.on('click', handleClick);
	client.on('newGame', handleNewGame);
	client.on('joinGame', handleJoinGame);
  
	function handleJoinGame(roomName) {
	  const room = io.sockets.adapter.rooms[roomName];
  
	  let allUsers;
	  if (room) {
		allUsers = room.sockets;
	  }
  
	  let numClients = 0;
	  if (allUsers) {
		numClients = Object.keys(allUsers).length;
	  }
  
	  if (numClients === 0) {
		client.emit('unknownCode');
		return;
	  } else if (numClients > 1) {
		client.emit('tooManyPlayers');
		return;
	  }
  
	  clientRooms[client.id] = roomName;
  
	  client.join(roomName);
	  client.number = 1;
	  client.emit('init', 1);
	  
	  startGameInterval(roomName);
	}
  
	function handleNewGame() {
	  let roomName = makeid(5);
	  clientRooms[client.id] = roomName;
	  client.emit('gameCode', roomName);
  
	  state[roomName] = initGame();
  
	  client.join(roomName);
	  client.number = 0;
	  client.emit('init', 0);
	}
  
	function handleClick(pit) {
	  const roomName = clientRooms[client.id];
	  if (!roomName) {
		return;
	  }
	  try {
		pit = parseInt(pit);
	  } catch(e) {
		console.error(e);
		return;
	  }
  
	  if (state[roomName].playerTurn == client.number) {
		if (makeTurn(state[roomName], pit)) { // rotate turns?
			emitGameState(roomName, state[roomName]);
			var winner = getWinner(state[roomName]);
			if (winner != -1) {
				emitGameOver(roomName, winner);
			}
		} else {
			client.emit('invalidTurn');
		}
	  } else {
		client.emit('notClientsTurn');
	  }
	}
  });
  
  function emitGameState(room, gameState) {
	// Send this event to everyone in the room.
	io.sockets.in(room)
	  .emit('gameState', JSON.stringify(gameState));
  }
  
  function emitGameOver(room, winner) {
	io.sockets.in(room)
	  .emit('gameOver', JSON.stringify({ winner }));
  }
  
  io.listen(process.env.PORT || 3000);
  