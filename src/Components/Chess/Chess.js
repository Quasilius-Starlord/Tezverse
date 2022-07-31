import { Chessboard, Pieces } from 'react-chessboard';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { ChessInstance, Chess } from 'chess.js';
import { socket, CLIENTID, MakeMove } from '../../Connections/socket';

const finale='r1b2kN1/3p1ppp/1p1b4/1BP5/2P1Q1P1/8/P6P/R1B1K1NR w KQ - 0 18';
const initial='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const ContractAddress = 'KT1RfqkrDWqBf3AsiSciyLvtWDXof7pH6CK1';

const Style={
    PlayerContainer:{margin:'40px 10px', display:'flex', flexDirection:'row', justifyContent:'space-evenly'},
    Player:{backgroundColor:'#00ffc3', padding:'10px 20px',width:'40%', borderRadius:'5px', fontSize:'2em'},
    Rank:{fontSize:'0.5em'}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
    for (let i = 0; i < 2; i++) {
        console.log(`Waiting ${i} seconds...`);
        await sleep(i * 1000);
    }
    console.log('Done');
}

const rpcURL = 'https://jakartanet.ecadinfra.com';
const ChessGame = props => {
    const [ fen, setFen ] = useState(initial);
    const [ chess, setChess ] = useState(new Chess(fen));
    const [ activePiece, setActivePiece ] = useState('');
    const [ activeSquare, setActiveSquare ] = useState('');
    const [ possibleSquare, setPossibleSquare ] = useState([]);
    const [ winner, setWinner ] = useState(null);
    const [ myColor, setMyColor ] = useState(props.firstClicked.current == true ? 'w' : 'b');
    const gameID = useRef(null);
    const [ chessDisplay, setChessDisplay ] = useState('none');

    async function Init(){
        try{
            // socket.emit('start-game');

            // socket.on('game-waiting', gameid => {
            //     console.log(gameid);
            //     gameID.current=gameid;
            // });

            // socket.on('game-begin', response => {
            //     console.log(response);
            // })
        }catch(err){
            console.log(err);
        }
    }

    async function SetGame(){
        try{
            await Init();
            console.log(CLIENTID);
        }catch(err){
            console.log(err);
        }
    };

    // console.log(fen);

    const moveHandler = async (move) => {
        
        if(chess.move(move)){

            setFen(chess.fen());
            console.log(chess.turn(), myColor, 'turn color');
            
            if(chess.turn() != myColor)
                MakeMove({move:move, worldID:props.worldID.current, gameName:'chess', playerID:CLIENTID});
            
            const moves = chess.moves({verbose: true});
            if(moves.length > 0){
                //game still going on
            }else{
                //game over
                if(chess.in_checkmate()){
                    if(chess.turn() == myColor){
                        console.log('You Lost');
                        //send to blockchain that youve lost
                        try {
                            const contract = await props.Tezos.current.wallet.at(ContractAddress);
                            const response = await contract.methods.winnerDeclareChess(props.worldID, "looser").send();
                            window.alert(`You've Lost`);
                        } catch (error) {
                            console.log(error);
                        }
                    }else{
                        console.log('You Won');
                        //send to blockchain that youve won
                        try {
                            const contract = await props.Tezos.current.wallet.at(ContractAddress);
                            const response = await contract.methods.winnerDeclareChess(props.worldID, "looser").send();
                            window.alert(`You've Won`);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }else if(chess.in_stalemate()){
                    console.log('Stale Mate');
                }
            }
        }
    }

    const ActiveSquareColor = () => {
        const style = {};
        if(activeSquare){
            style[activeSquare]={
                backgroundColor:'#4f4030'
            }
            const possible = chess.moves({square:activeSquare, legal:true, verbose:true});
            // console.log(possible)
            
            possible.forEach(element=>{
                // console.log(element)
                if(element.captured){
                    style[element.to] = {
                        backgroundColor:'#bf133e',
                        borderRadius:'50%',
                    }
                }else{
                    style[element.to] = {
                        backgroundColor:'#48f542',
                        borderRadius:'50%',
                    }
                }
            })
        }
        return style;
    }

    const WinnerDeclare = (color) => {
        if(winner == null)
            return null;
        
        if(winner == color){
            return (
                <span style={{textTransform:'uppercase', fontSize:'0.75rem'}}>won</span>
            )
        }else{
            return (
                <span style={{textTransform:'uppercase', fontSize:'0.75rem'}}>lost</span>
            )
        }
    }

    const whiteQueen='';
    
    // console.log('active block', activeSquare)
    useEffect(() => {
        // Initialize();
        // SetGame();
        // console.log(CLIENTID);
        socket.on('initiate-payment', async data => {
            try {
                // await demo();
                //TEZOS CONTRACT CALL HERE
                const contract = await props.Tezos.current.wallet.at(ContractAddress);
                const response = await contract.methods.transferForChess().send({amount:2});
                // console.log(response);
                console.log('Contract',contract.methods);
                socket.emit('payment-done', {worldID: props.worldID.current, gameName: 'chess'})
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('start-game-chess', data => {
            console.log(data);
            console.log(props.firstClicked)
            setChessDisplay('flex');
        });

        socket.on('move-chess', data => {
            console.log(data, 'opponent move')
            if(data.playerID != CLIENTID){
                moveHandler(data.move)
            }
        })
        
        return () => console.log('ran once')
    }, []);



    return(
        <>
            {chessDisplay == 'none' ? (<div>Waiting for other player to join</div>) : null}
            <div style={{display: chessDisplay, flexDirection:'row', justifyContent:'center', margin:'25px'}}>
                <Chessboard arePiecesDraggable={chess.turn() == myColor ? true : false} boardOrientation={myColor == 'w' ? 'white' : 'black'} position={fen} id='BasicBoard' boardWidth={'500'} onPieceDrop={(source, target, piece)=>{
                    moveHandler({from:source, to: target, promotion:'q'})
                }} 
                    customSquareStyles={ActiveSquareColor()}
                    areArrowsAllowed={true}
                    onPieceDragBegin={(piece, source)=>{
                        setActiveSquare(source);
                    }}
                    onPieceDragEnd={(piece, source)=>{
                        setActiveSquare('');
                    }} />
            </div>
        </>
    )
};

export default ChessGame;
