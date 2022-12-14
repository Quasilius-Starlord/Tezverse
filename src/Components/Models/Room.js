/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { CLIENTID, SendGameInviteSignal } from "../../Connections/socket";

export default function Model({ ...props }) {
	const group = useRef();
	const { nodes, materials } = useGLTF("/arena chess.gltf");

	return (
	<group ref={group} {...props} dispose={null}>
		{props.children}

		<mesh
			castShadow
			receiveShadow
			geometry={nodes.Cube001.geometry}
			material={materials.floor}
			position={[0.9, 0.65, -2.16]}
			scale={[23.84, 0.66, 22.92]}
		/>
		<group onClick={()=>{
			//chess board
			SendGameInviteSignal(props.worldID, 'chess');
			props.setChessBoardShow(true);
			props.gameLoaded.current = 'chess'
			console.log('chess board clickled');
			
		}} position={[-11.84, 3.04, 6.05]} scale={1.64}>
		<mesh
			castShadow
			receiveShadow
			geometry={nodes.Cube002_1.geometry}
			material={materials.wood}
		/>
		<mesh
			castShadow
			receiveShadow
			geometry={nodes.Cube002_2.geometry}
			material={materials.chess}
		/>
		</group>
		<group position={[0, 10, 0]} scale={[15, 10, 15]}>
		<mesh
			castShadow
			receiveShadow
			geometry={nodes.Cube001_1.geometry}
			material={materials.ceiling}
		/>
		<mesh
			castShadow
			receiveShadow
			geometry={nodes.Cube001_2.geometry}
			material={materials.walls}
		/>
		</group>
	</group>
	);
}

useGLTF.preload("/arena chess.gltf");