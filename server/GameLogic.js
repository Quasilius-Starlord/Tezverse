const { v4 : uuid} = require('uuid');

const LEDGER = new Object();
const TRANSFER = new Map();

const gamesAvailable = ['chess', 'dice'];

initializeGame = (io, client) => {
    const socketio=io;
    const gameSocket=client;

    gameSocket.on('disconnect',()=>{
        
    });

    gameSocket.on('move',data => {
        // const move = move.gameId
        console.log(data, 'move')
        switch (data.gameName) {
            case 'chess':
                io.in(data.worldID).emit('move-chess', data);
                break;
            case 'dice':
                break;
            default:
                break;
        }
    });

    gameSocket.on('player-move',data => {
        // const move = move.gameId
        console.log(data, 'player-move')
        io.in(data.worldID).emit('player-move', data);
    });

    gameSocket.on('acknowledgement',data => {
        io.sockets.in(data.to).emit('acknowledgement', data);
    });
    
    //when player starts a world
    client.on('start-world', data => {
        const worldID = uuid();
        //create a room and add this client to that room
        client.join(worldID);
        console.log('world generated for', client.id, 'is', worldID);
        LEDGER[worldID] = new Map();
        TRANSFER[worldID] = new Set();
        for( const game in gamesAvailable ){
            LEDGER[worldID][gamesAvailable[game]] = new Set();
        }
        // console.log(LEDGER);
        client.emit('world-created',{worldID:worldID});
        
    });


    client.on('game-selected',data => {
        // LEDGER[data.worldID] = 
        if(data.gameName){
            LEDGER[data.worldID][data.gameName].add(client.id);
            switch (data.gameName) {
                case 'chess':
                    {
                        if(LEDGER[data.worldID][data.gameName].size == 2){
                            io.in(data.worldID).emit('initiate-payment', {amount: 2});
                            return;
                        }
                        break;
                    }
                case 'dice':
                    {
                        io.in(client.id).emit('initiate-payment', {amount: 2});
                        return;
                        break;
                    }
                default:
                    break;
            }
            // if(LEDGER[data.worldID][data.gameName].siz)
        }else{
            console.log(data.gameLeft);
            // console.log(typeof(LEDGER[data.worldID][data.gameLeft]));
            LEDGER[data.worldID][data.gameLeft].delete(client.id);
        }
        // console.log(LEDGER);
        io.in(data.worldID).emit('game-selected', data);
    });

    client.on('payment-done', data => {
        //switch statement
        //and transfer const update
        console.log(TRANSFER)
        TRANSFER[data.worldID].add(client.id);
        switch (data.gameName) {
            case 'chess':
                {
                    if(TRANSFER[data.worldID].size == 2)
                        io.in(data.worldID).emit('start-game-chess', {validity: true, gameName:'chess'});
                    break;
                }
            case 'dice':
                {
                    io.in(client.id).emit('start-game-dice', {validity: true, gameName:'dice'});
                    break;
                }
            default:
                break;
        }
    });
    
    // on player wish to join a room
    client.on('join-world', data => {
        // console.log(client.id, 'request to join world', data.worldID);
        
        const room = io.sockets.adapter.rooms.get(data.worldID);
        // console.log('all rooms', io.sockets.adapter.rooms.get(data.worldID));
        if(room === undefined){
            client.emit('error', "Room Does not Exist!");
            return;
        }
        if(room.size === 1){
            client.join(data.worldID);
            io.in(data.worldID).emit('second-player-joined', client.id);
            client.emit('joined-world', true);
        }else if(room.size > 1){
            client.emit('error', "Room has been saturated!");
            return;
        }
    });
};

exports.initializeGame = initializeGame;