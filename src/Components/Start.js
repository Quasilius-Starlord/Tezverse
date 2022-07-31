import { useRef, useState, useEffect } from "react";
import { Container, Row, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
// useRef
import { socket, CreateWorld } from './../Connections/socket';
import { Form, FormControl, InputGroup } from 'react-bootstrap';

const Style={
    Parent:{width:'100%', display:'flex', height:'100vh', flexDirection:'column', justifyContent:'space-evenly', alignItems:'center'},
    Intro:{width:'70%', textAlign:'center', fontSize:'1.5rem'}
}

const JoinRoom = (roomID, socket) => {
    socket.emit('joinRoom', {room:roomID, msg:'Message given'});
};

const SendMessage = (roomID, message, socket) => {
    socket.emit('messageRoom',{room:roomID, msg:message});
}

const worldGenerateHandler = async navigate => {
    try{
        await CreateWorld();
        socket.on('world-created', data => {
            const worldID = data.worldID;
            navigate(`world/${worldID}`);
        });
    }catch(err){
        console.log(err);
    }
}

const  Start = (props) => {
    const navigate = useNavigate();
    const RoomInput = useRef();
    const RoomRef = useRef('');
    const WorldID = useRef();
    const [ worldID, setWorldID ] = useState('');

    useEffect(()=>{
        console.log(props.account.current);
        console.log(props.wallet.current);
        console.log(props.Tezos.current);
    },[props.account.current])

    return(
        <div style={Style.Parent}>
            <div style={Style.Intro}>Tezverse - A Tezos based Metaverse</div>
            <div><a href="https://templewallet.com/download?platform=extension" target={'_blank'}>Download</a> Temple Wallet Here</div>
            {/* start a new world */}
            <Button onClick={()=>{worldGenerateHandler(navigate)}} variant="success" style={{fontSize:'1.2rem'}}>Start New World</Button>
            {/* join an existing world */}
            <InputGroup style={{width:'70%'}} className="mb-3">
                <FormControl
                    value={worldID}
                    onChange={e=>{
                        setWorldID(e.target.value)
                    }}
                    placeholder="World ID" />
                    <Button variant="success" onClick={e => {
                        try {
                            const url = new URL(worldID);
                            navigate(url);
                        } catch (error) {
                            navigate(`world/${worldID}`);
                        }
                    }}>Join World</Button>
            </InputGroup>
        </div>
    )
}

export default Start;