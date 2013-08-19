var fs = require("fs");
var http = require("http");
// var express = require("express");
// var config = JSON.parse(fs.readFileSync("config.json"));
var host = '192.168.0.28';
var port = 1337;

var server = http.createServer(function(request, response){
	console.log("Received request: " + request.url);
	fs.readFile("." + request.url, function(error, data){
		if (error) {
			response.writeHead(404, {"Content-type":"text/plain"});
			response.end("Sorry the page was not found");
		} else {
			if(request.url.match(/\.js$/) !== null) {
				response.writeHead(200, {"Content-type":"text/javascript"});
			} else {
				response.writeHead(200, {"Content-type":"text/html"});
			}
			response.end(data);
		}
	})
});

server.listen(port, host, function(){
	console.log("Listening " + host + ":" + port);
});

// var app = express.createServer();
// app.get("/", function(request, response){
// 	var content = fs.readFileSync("template.html");
// 	response.setHeader("Content-Type", "text/html");
// 	response.send(content);
// });
// app.listen(port, host);
// var io = require('socket.io').listen(1338);

var io = require('socket.io').listen(1338);

var sendChat = function (data) {
	io.sockets.emit('chat', data);
};

var sendWrite = function (data) {
	io.sockets.emit('is writing', data);
};

io.sockets.on('connection', function (socket) {
	socket.on('set nickname', function (name) {
		socket.set('nickname', name, function () {
			socket.emit('ready');
			console.log('set name:', name);
			io.sockets.emit('joined', name);
		});
	});

	socket.on('msg', function (text) {
		socket.get('nickname', function (err, name) {
			console.log('Chat message by ', name , ' text:', text);
			sendChat({
				username: name,
				text: text
			});
		});
	});

	socket.on('write', function () {
		socket.get('nickname', function (err, name) {
			sendWrite({
				username: name
			});
		});
	});

	socket.on('disconnect', function () {
		socket.get('nickname', function (err, name) {
			io.sockets.emit('leaved', name);
		});
	});
});