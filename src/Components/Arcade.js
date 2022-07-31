import { Canvas, useLoader } from "@react-three/fiber";
import { Scene, PerspectiveCamera, WebGL1Renderer } from "three";
import { OrbitControls, Stars } from '@react-three/drei';
// import Model from "./Models/Room Model";
import Model from './Models/Room';
import BASEModel from './Models/BASEModel';
import { useEffect, useRef, useState } from "react";
import { Physics, useBox } from '@react-three/cannon';
import { PuffLoader } from "react-spinners";
import { socket, JoinWorld, ConnectionError, ConnectionFailed, CLIENTID, SendGameInviteSignal } from "../Connections/socket";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import ChessGame from "./Chess/Chess";
import { Raycaster } from 'three';
import PlayerModel from './Models/PlayerModel';
import DiceGame from './Dice/Dice';

import ExtendedArcade from './Models/ExtendedArcade'

// blue bot
import Bot from './Models/Bot'

const ContractAddress = 'KT1RfqkrDWqBf3AsiSciyLvtWDXof7pH6CK1';

const Plane = ({ position, dimention }) => {
    return(
        <mesh position={position} rotation={[-Math.PI/2, 0, 0]}>
            <planeBufferGeometry attach={'geometry'} args={dimention} />
            <meshLambertMaterial attach={'material'} color='green' />
        </mesh>
    )
}

const Box = ({ position=[0,0,0], dimention=[1,1,1] }) => {
    const [ref, api] = useBox(() => ({mass: 1, position: position}));
    console.log('position',position)
    return(
        <mesh ref={ref} receiveShadow castShadow position={position}>
            <boxBufferGeometry attach={'geometry'} args={dimention} />
            <meshLambertMaterial attach={'material'} />
        </mesh>
    )
}

const World = props => {
    const world = useRef();
    console.log(props.secondPlayer, 'second player')
    const ray = new Raycaster([0,0,0], [1,0,0], 2, 20);
    return(
        <Canvas ref={world} shadows={true} camera={{position:[0,10,22]}}>
            <ambientLight intensity={0.1} />
            <directionalLight color={'white'} />
            <spotLight intensity={0.4} position={[10,10,0]} />
            <Stars />
            
            <OrbitControls />
            <directionalLight intensity={0.5} color='pink' position={[5, 5, 0]} />
            <directionalLight intensity={0.5} color='pink' position={[-5, 5, 0]} />
            {/* world component */}
            <ExtendedArcade 
             firstClicked={props.firstClicked}
             worldID={props.worldID}
             gameLoaded={props.gameLoaded}
             wallet={props.wallet}
             Tezos={props.Tezos}
             setDiceBoardShow={props.setDiceBoardShow}
             setChessBoardShow={props.setChessBoardShow} >
                {/* players */}
                <Bot world={world} worldID={props.worldID} player={1} displacementZ={0} />
                {
                    // {/* second player */}
                    props.secondPlayer == false ? null : <Bot world={world} p2initpos={props.p2initpos} worldID={props.worldID} player={2} playerID={props.secondPlayer} displacementZ={0} />
                }
            </ExtendedArcade>

            <axesHelper args={[2,2,2]}/>
        </Canvas>
    )
}

// {
//     "branch": "BLMLyS9fdSvh8LSuez4NgExNQp2xmFWSn6a5kEbt6vC9JgwPWwS",
//     "contents": [
//       {
//         "kind": "transaction",
//         "source": "tz1XtFwuCnjACGYL6TRXq7LgAd8R4cmtapQ5",
//         "fee": "468",
//         "counter": "469839",
//         "gas_limit": "1540",
//         "storage_limit": "0",
//         "amount": "2000000",
//         "destination": "KT1MpUxSbma57yMSiXWSQ132uR93zmXZAUUe",
//         "parameters": {
//           "entrypoint": "transferForChess",
//           "value": {
//             "prim": "Unit"
//           }
//         }
//       }
//     ]
//   }

const Arcade = props => {
    const [ waiting, setWaiting ] = useState(true);
    const { id } = useParams();
    const worldID = useRef(null);
    const navigate = useNavigate();
    const [ secondPlayer, setSecondPlayer ] = useState(false);
    const p2initpos = useRef(null);
	const [ chessBoardShow, setChessBoardShow ] = useState(false);
	const [ diceBoardShow, setDiceBoardShow ] = useState(false);
    const gameLoaded = useRef(null);
    const firstClicked = useRef(true);
    console.log(chessBoardShow);

    const [ account, setAccount ] = useState(props.account.current);

    const ContractTest = async () => {
        try {
            const contract = await props.Tezos.current.wallet.at(ContractAddress);
            const storage = await contract.storage();
			const add = await props.Tezos.current.wallet.pkh();
            console.log('address', worldID.current)
            // const response = await contract.methods.transferForChess().send({amount:2});
            const response = await contract.methods.winnerDeclareChess(worldID.current,"winner").send();
            // const res = await storage.AddressToBalance.get(add);
            console.log(response, 'storage');

            console.log('Contract',contract.methods);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        //event fired when second player has joined
        socket.on('second-player-joined', playerID => {
            if(CLIENTID != playerID){
                console.log('second player jined', playerID)
                setSecondPlayer(playerID);
            }
		});

        socket.on('acknowledgement',data => {
            console.log('acknowledgememt', data);
            if(CLIENTID != data.playerID){
                firstClicked.current = false;
                console.log('second player jined', data.playerID)
                p2initpos.current = data.positions;
                setSecondPlayer(data.playerID);

            }
        });

        socket.on('game-selected', data => {
            if(data.playerID != CLIENTID){
                if(data.gameName)
                    window.alert(`Player 2 has joined ${data.gameName}`);
                else
                    window.alert(`Player 2 has clicked off of ${data.gameName}`);
            }
        })
        try {
            ConnectionError(navigate);
            ConnectionFailed(navigate);
            worldID.current = id;

            //join world logic
            const res = JoinWorld(navigate, id, setWaiting);
            console.log(account);
            console.log(props.wallet.current);
            console.log(props.Tezos.current);
            // ContractTest();
            if(res === true){
                // world join has been verified load models

            }
        } catch (err) {
            navigate('/');
            console.log('error has pccured')
        }
        return () => {
            console.log('ran once');
        };
    }, []);

    if(waiting){
        return(
            <div style={{position:'absolute',width:'100%',display:'flex',justifyContent:'center',alignItems:'center',height:'100%',backgroundColor:'rgb(157, 224, 224,0.8)'}}>
                <PuffLoader loading={true} size={150} />
            </div>
        )
    }else{
        return(
            <>
                <Modal show={chessBoardShow} onHide={()=>{
                    setChessBoardShow(false);
                    gameLoaded.current = null;
                    SendGameInviteSignal(worldID.current, null, 'chess');
                }} backdrop='static' keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Chess Game</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ChessGame
                         wallet={props.wallet}
                         Tezos={props.Tezos}
                         firstClicked={firstClicked} 
                         worldID={worldID} />
                    </Modal.Body>
                </Modal>
                <Modal show={diceBoardShow} onHide={()=>{
                    setDiceBoardShow(false);
                    gameLoaded.current = null;
                    // maybe necessary for multiplayer
                }} backdrop='static' keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Dice Game</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DiceGame 
                         wallet={props.wallet}
                         Tezos={props.Tezos}
                         worldID={worldID} />
                    </Modal.Body>
                </Modal>
                <World
                 firstClicked={firstClicked}
                 gameLoaded={gameLoaded}
                 setChessBoardShow={setChessBoardShow}
                 setDiceBoardShow={setDiceBoardShow}
                 p2initpos={p2initpos.current}
                 worldID={worldID.current}
                 wallet={props.wallet}
                 Tezos={props.Tezos}
                 secondPlayer={secondPlayer} />
            </>
        )
    }
};

export default Arcade;