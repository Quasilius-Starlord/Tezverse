import { io } from "socket.io-client";

const BACKENDURL = 'http://localhost:8000/';

const socket = io.connect(BACKENDURL);
let CLIENTID;

socket.on('connection',clientID=>{
    console.log(clientID);
    CLIENTID=clientID;
    //irrelevent
    // socket.emit('joinRoom',{room:'csgo', msg:'given Message'});
});

socket.on('recieve',data=>{
    console.log('recieve from room', data.room, data.msg);
})

// socket.on('create-new-game', statusUpdate=>{
//     socketID=statusUpdate.mySocketId
//     console.log(statusUpdate);
// });

const CreateWorld = async () => {
    socket.emit('start-world', {msg:'Create a new World'});
};

const JoinWorld = (navigate, worldID, setWaiting) => {
    try{
        console.log('joining world')
        socket.emit('join-world',{worldID:worldID});
        socket.on('world-saturation', data => {
            if(data.errCode)
                throw "World has been saturated";
        });
        socket.on('joined-world', response => {
            setWaiting(false);
        });
        return true;
    }catch(err){
        console.log(err);
        navigate('/');
        return false;
    }
}

const SendAcknowledgement = (x, y, z, playerID) => {
    socket.emit('acknowledgement', {positions:[x,y,z], playerID: CLIENTID, to: playerID});
}

const ConnectionFailed = navigate => {
    socket.on('connect_failed', err => {
        console.log(err);
        navigate('/');
    });
};

const ConnectionError = navigate => {
    socket.on('error', err => {
        console.log(err);
        navigate('/');
    });
};

const SendGameInviteSignal = (worldID, gameName, gameLeft) => {
    if(gameLeft)
        socket.emit('game-selected', {worldID:worldID, gameName:gameName, playerID: CLIENTID, gameLeft:gameLeft});
    else
        socket.emit('game-selected', {worldID:worldID, gameName:gameName, playerID: CLIENTID});
};

const MakeMove = data => {
    socket.emit('move', data);
}


export{
    socket,
    CLIENTID,
    CreateWorld,
    JoinWorld,
    ConnectionFailed,
    ConnectionError,
    SendAcknowledgement,
    SendGameInviteSignal,
    MakeMove
}