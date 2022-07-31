import { useEffect } from 'react';
import { BeaconWallet } from '@taquito/beacon-wallet'
import { TezosToolkit } from '@taquito/taquito';
import { NetworkType } from '@airgap/beacon-sdk';
import { useState, useRef } from 'react';
import { Form, FormControl, InputGroup, Button } from 'react-bootstrap';

const Styles={
    dice:{
        width:'100px',
        height:'100px'
    }
}

const ContractAddress = 'KT1HpL7i3pwZ6zm4SoCSHnbSMqzSCiEVS2b5';

function Dice(props){
    console.log(props.draw)
	if(props.draw === 1)
  	    return <div style={Styles.dice} className="img-1"></div>; 
    else if(props.draw === 2)
        return <div style={Styles.dice} className="img-2"></div>;
    else if(props.draw === 3)
        return <div style={Styles.dice} className="img-3"></div>;
    else if (props.draw === 4)
        return <div style={Styles.dice} className="img-4"></div>;
    else if (props.draw === 5)
        return <div style={Styles.dice} className="img-5"></div>;
    else if (props.draw === 6) 
        return <div style={Styles.dice} className="img-6"></div>;
    else
        return <div style={Styles.dice} className="dice">!!!</div>;
}

function RollDice(props){
    const [draw, setDraw] = useState(1);  
    let counter= 0;
    
    useEffect(() => {
        if(props.result == null)
            return;
        const interval = setInterval(() => {
            counter += 1;
            if(counter >= 15){
                setDraw(props.result);
                clearInterval(interval);
                counter = 0;
                if(props.result!=null){
                    if(props.bet == props.result)
                        window.alert('you won');
                    else
                        window.alert('you lost');
                }
                return;
            }

            setDraw(Math.round((Math.random()*5) + 1));    	
        }, 100);
  
    }, [props.toggleRender]);
      
    return (<Dice draw={draw} />);
}

function DiceGame(props){
    const [ bet, setBet ] = useState(null);
    const [ result, setResult ] = useState(null);
    const [ toggleRender, setTogglerender ] = useState(true);
    const board = useRef();
    
    return(
        <div ref={board} style={{display:'flex', width:'100%', flexDirection:'column', alignItems:'center'}}>
            <InputGroup style={{width:'100%', padding:'10px'}} className="mb-3">
                <FormControl
                    value={bet ? bet : ''}
                    onChange={e => {
                        const b = parseInt(e.target.value);
                        if(b && (b >=1 && b<=6 ))
                            setBet(b);
                        else
                            setBet('');
                    }}
                    placeholder="Bet A Number" />
                    <Button variant="success" onClick={ async e => {
                        try {
                            const contract = await props.Tezos.current.wallet.at(ContractAddress);
                            const response = await contract.methods.placeBetDice(bet).send({amount:2});
                            const address = await props.Tezos.current.wallet.pkh();
                            const storage = await contract.storage();
                            const res = await storage.betStore.get(address);
                            console.log(res, 'bet result')
                            if(res){
                                setResult(parseInt(res.toString()));
                                setTogglerender(!toggleRender);
                                console.log('stored in blockchain', res.toString());
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }}>Make Bet</Button>
            </InputGroup>
            <RollDice toggleRender={toggleRender} setTogglerender={setTogglerender} bet={bet} result={result}/>
        </div>
    )
}

export default DiceGame;