var http = require("http");
var util = require('util');
var io = require('socket.io')(8080);




console.log("create socket listener on port 8080");


io.sockets.on('connection', function(socket) {
    console.log('client connected! on socket ' + socket.id);


    var playerColor = false;


    socket.emit('event', {code: 1});

    socket.on('hello', function() {
        console.log('Ohh, hello!');
    });



    socket.on('clicked', function(data){

        if(!playerColor) playerColor = data.color;

        if(playerColor != data.color) return false;

        io.sockets.emit('clicked', data);
    });
});






