const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { initGame, makeTurn, getWinner } = require('./game');
const { makeid } = require('./utils');
const { NUMBER_OF_PITS, NUMBER_OF_MARBLES } = require('./constants');

const state = {};
const clientRooms = {};

app.use(express.static('../frontend'));

server.listen(3000, () => {
	console.log('listening on *:3000');
});

io.on('connection', client => {

	console.log('a user connected');

	client.on('click', handleClick);
	client.on('newGame', handleNewGame);
	client.on('joinGame', handleJoinGame);
  
	function handleJoinGame(roomName) {
		console.log('handleJoinGame 1: \"' + roomName + '\"');
		const room = io.sockets.adapter.rooms[roomName];

		console.log("Has: " + io.sockets.adapter.rooms.has(roomName));
		console.log("Map: " + io.sockets.adapter.rooms);
		console.log("Room: " + io.sockets.adapter.rooms.get(roomName).size);

		let numClients = 0;
		if (io.sockets.adapter.rooms.has(roomName)) {
			numClients = io.sockets.adapter.rooms.get(roomName).size;
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
		
		startGame(roomName, state[roomName]);
		console.log(state[roomName]);

		console.log('handleJoinGame Last');
	}

	function handleNewGame() {
		let roomName = makeid(5);
		clientRooms[client.id] = roomName;
		client.emit('gameCode', roomName);

		state[roomName] = initGame(NUMBER_OF_PITS, NUMBER_OF_MARBLES);
		
		client.join(roomName);
		client.number = 0;
		client.emit('init', 0);

		console.log('handleNewGame: \"' + roomName + '\"');
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
  
function startGame(room, gameState) {
	io.sockets.in(room)
	.emit('gameStart', JSON.stringify(gameState));
	console.log('startGame');
}

function emitGameState(room, gameState) {
	// Send this event to everyone in the room.
	io.sockets.in(room)
	.emit('gameState', JSON.stringify(gameState));
}
  
function emitGameOver(room, winner) {
	io.sockets.in(room)
	.emit('gameOver', JSON.stringify({ winner }));
}