import logo from './logo.svg';
import './App.css';
import Arcade from './Components/Arcade';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Start from './Components/Start'
import Test from './Components/Test';
import { useEffect, useRef, useState } from 'react';

import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito' 
import { NetworkType } from '@airgap/beacon-sdk';

const rpcURL = 'https://jakartanet.ecadinfra.com';

function App() {
    const Tezos = useRef(new TezosToolkit(rpcURL));
    const wallet = useRef(new BeaconWallet({
        name: 'Chess Game',
        preferredNetwork: NetworkType.JAKARTANET
    }));

    const account = useRef(null);
    
    async function InitBlockChain(){
        if(account.current!==null)
            return;
        
        Tezos.current.setWalletProvider(wallet.current);
        try {
            const acc = await wallet.current.client.requestPermissions({
                network:{
                    type:NetworkType.JAKARTANET,
                    rpcUrl:rpcURL
                }
            });
            console.log(acc.address, 'rest');
            account.current=await wallet.current.client.getActiveAccount();
            const balance = await Tezos.current.tz.getBalance(acc.address);
			// await (await Tezos.current.wallet.at('asd')).
            
        } catch (error) {
            console.log(error);
        }
    };

	useEffect(() => {
        InitBlockChain();
        return () => {
            console.log('started');
        };
    }, []);
  return (
    <BrowserRouter>
      <Routes>
		<Route path='/'>
			<Route index element={<Start wallet={wallet} Tezos={Tezos} account={account} />} />
			<Route path='/world/:id' element={<div className='App'><Arcade wallet={wallet} Tezos={Tezos} account={account} /></div>} />
		</Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
