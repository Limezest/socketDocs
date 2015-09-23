var http = require('http');
var fs = require('fs');
var faker = require('faker/locale/fr');

var server = http.createServer(function(req, res) {
	if (req.url === '/favicon.ico') {
		fs.readFile('./favicon.ico', function(err, content) {
			res.writeHead(200, {'Content-Type': 'image/x-icon'});
			res.end(content);
		});
		return;
    }
	if (req.url === '/script.js') {
		fs.readFile('./script.min.js', function(err, content) {
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(content);
		});
		return;
    }
	if (req.url === '/style.css') {
		fs.readFile('./style.min.css', function(err, content) {
			res.writeHead(200, {'Content-Type': 'text/css'});
			res.end(content);
		});
		return;
    }

	fs.readFile('./index.html', 'utf-8', function(err, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content);
	});
});

//  Socket.IO logic
var io = require('socket.io').listen(server);
var users = [];
var cellValues = [];
/*
	// test values
	var cellValues = [
		{id: '0A', value: '0A'}, {id: '0B', value: '0B'}, {id: '0C', value: '0C'},
		{id: '1A', value: '1A'}, {id: '1B', value: '1B'}, {id: '1C', value: '1C'},
		{id: '2A', value: '2A'}, {id: '2B', value: '2B'}, {id: '2C', value: '2C'},
		{id: '3A', value: '3A'}, {id: '3B', value: '3B'}, {id: '3C', value: '3C'},
		{id: '4A', value: '4A'}, {id: '4B', value: '4B'}, {id: '4C', value: '4C'}
	];
*/

io.sockets.on('connection', function(socket) {
//  Assigns the users a random name and picture, then pushes it in the server-side user list
	var sockID = socket.id;
	var user = {
		name: faker.name.firstName(),
		avatar: faker.image.avatar()
	};
	users.push(user);

	//  Updates the client-side user list
	socket.broadcast.emit('user:changeBroadcast', users);
	socket.emit('user:changeBroadcast', users);
	console.log(users);


	//  Sends the user the current values for the cells
	socket.emit('cell:loadEmit', cellValues);

	//  Value change reception
	socket.on('cell:changeEmit', function(message){
		cellValues.push(message);
		socket.broadcast.emit('cell:changeBroadcast', message);
	});

	//  Alignment change reception
	socket.on('cell:alignmentEmit', function(message) {
		socket.broadcast.emit('cell:alignmentBroadcast', message)
	});

	// fon-size chage reception
	socket.on('cell:fontEmit', function(message) {
		socket.broadcast.emit('cell:fontBroadcast', message);
	});

	socket.on('disconnect', function() {
		users.splice(users.indexOf(user), 1);
		console.log(users);
		socket.broadcast.emit('user:changeBroadcast', users);
	});
});

server.listen(80);
