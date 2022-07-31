const express = require('express');
const http = require('http');
const socket = require('socket.io');

const { v4 : uuid } = require('uuid');

const application = express();

const server = http.createServer(application);

const io = socket(server, {cors:{origin:'*'}});

const initializeGame = require('./GameLogic').initializeGame;


io.on('connection', client => {
    console.log('new client connected', client.id);

    client.emit('connection', client.id);

    initializeGame(io, client);
    // console.log(typeof(initializeGame))

    client.on('getConn', data => {
        const room = io.sockets.adapter.rooms;
        // console.log('looking up world', room);
    })

    
});


server.listen(8000, () => {
    console.log('server has been started')
})