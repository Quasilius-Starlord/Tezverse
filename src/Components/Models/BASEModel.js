import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { socket, CLIENTID, SendAcknowledgement } from "../../Connections/socket";
import { clone as Clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { useGraph, useFrame } from "@react-three/fiber";

import { CycleRaycast } from '@react-three/drei'
// function 

const Styles = {
	Label: {
		transform: 'translate3d(-50%, -85px, 0)',
		padding:'0px 2px',borderRadius:'10%',
		backgroundColor:'InfoBackground',
		color:'InfoText',fontFamily:'monospace',
		WebkitUserSelect:'none',
		fontSize:'0.5em'
		
	}
}

let num = 0;

export default function Model({ ...props }) {
	const position = useRef((props.player == 2 && props.p2initpos!=null) ? ([props.p2initpos[0], props.p2initpos[1], props.p2initpos[2]+props.displacementZ]) : [0.1, 3.7, (0.09 + props.displacementZ)]);
	const [ keyPress, setKeyPress ] = useState(null);
	const k = useRef(null);
	const playerModel = useRef();

	useFrame(() => {
		// obj.current.rotation.y+=0.1;
		if(k.current == null)
			return;
		// console.log(props.world.current);
		// console.log(playerModel.current.position)
		// const ray = new Raycaster(playerModel.current.position, [1,0,0], 2, 20);
		// const intersect = 
		
		if(k.current == 'w'){
			position.current[2]-=0.15;
			playerModel.current.position.z-=0.15;
		}else if(k.current == 's'){
			position.current[2]+=0.15;
			playerModel.current.position.z+=0.15;
		}else if(k.current == 'a'){
			position.current[0]-=0.15;
			// if(playerModel.current.rotation.y>3.14/2)
			// 	playerModel.current.rotation.y-=0.15;
			playerModel.current.position.x-=0.15;
		}else if(k.current == 'd'){
			position.current[0]+=0.15;
			if(playerModel.current.rotation.y>3.14/2)
				playerModel.current.rotation.y-=0.15;
			playerModel.current.position.x+=0.15;
		}
	})

	useEffect( () => {
		if(props.player == 1){
			document.addEventListener('keydown', e => {
				//emit to same room
				// no key is pressed
				if(! ['w', 's', 'a', 'd'].includes(e.key))
					return;

				if(k.current == null){
					k.current = e.key;
					// setKeyPress(e.key);
					socket.emit('player-move', {CLIENTID:CLIENTID, worldID:props.worldID, key:e.key});
				}
				
			});
			document.addEventListener('keyup', e => {
				//key is already pressed
				if(k.current != null){
					k.current = null;

					socket.emit('player-move', {CLIENTID:CLIENTID, worldID:props.worldID, key:null});
				}
			})
		}else if(props.player == 2){
			socket.on('player-move', e => {
				if(e.CLIENTID != CLIENTID){
					console.log('key pressed', e.key)
					if(k.current != e.key){
						k.current = e.key;
					}
				}
			})
		}
	return () => {};
	}, [...position.current]);

	socket.on('second-player-joined', playerID => {
		if(CLIENTID != playerID && props.player  == 1){
			//send acknoedgement to other
			SendAcknowledgement(...position.current, playerID);
		}
	});
	useEffect(() => {
		console.log('initial set function run');
		if(props.player == 2){
			if(props.p2initpos != null && props.p2initpos.length != 0){
				console.log(props.p2initpos);
				// position.current=props.p2initpos.map(e => e*-1);
			}
		}
		return () => {
			console.log('ran once');
		};
	}, []);
	
	const { scene, materials } = useGLTF("/BASEmodel.gltf");
	const clone = useMemo(() => Clone(scene), [scene]);
	const { nodes } = useGraph(clone);


  return (
    <group position={position.current} ref={playerModel} {...props} dispose={null} rotation={[ 0, -Math.PI/2, 0]} >
		<Html zIndexRange={[10, 0]}>
			<div style={Styles.Label}>{CLIENTID}</div>
		</Html>
      <group>
        <primitive object={nodes.wiest} />
        <primitive object={nodes.hellikkL} />
        <primitive object={nodes.hellikkR} />
        <skinnedMesh
          geometry={nodes.Cube001.geometry}
          material={nodes.Cube001.material}
          skeleton={nodes.Cube001.skeleton}
        />
        <lineSegments
          geometry={nodes.Cube001_1.geometry}
          material={nodes.Cube001_1.material}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/BASEmodel.gltf");

