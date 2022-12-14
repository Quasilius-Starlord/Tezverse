/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function PlayerModel({ ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/Player.gltf");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions.walking.play();
    return () => {
        console.log('amimation loaded')
    };
  }, []);

  return (
    <group position={[1, 1.4, 1]} ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.025}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh
            name="Beta_Joints"
            geometry={nodes.Beta_Joints.geometry}
            material={materials["Beta_Joints_MAT.003"]}
            skeleton={nodes.Beta_Joints.skeleton}
          />
          <skinnedMesh
            name="Beta_Surface"
            geometry={nodes.Beta_Surface.geometry}
            material={materials["asdf1:Beta_HighLimbsGeoSG2.003"]}
            skeleton={nodes.Beta_Surface.skeleton}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/Player.gltf");

