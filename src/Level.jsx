import { Float, Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import useGame from "./stores/useGame";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const floorMaterial = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0, metalness: 0 });
const floorMaterial2 = new THREE.MeshStandardMaterial({ color: "#222222", roughness: 0, metalness: 0 });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "#ff0000", roughness: 1, metalness: 0 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: "#887777", roughness: 0, metalness: 0 });

function BlockStart({ position = [0, 0, 0] }) {
  return (
    <>
      <group position={position}>
        <Text
          maxWidth={0.25}
          lineHeight={0.75}
          textAlign="right"
          position={[1.2, 0.7, -3]}
          rotation-y={-0.25}
          scale={0.75}
          font="/bebas.woff"
        >
          MARBLE RACE
        </Text>
        <RigidBody type="fixed">
          <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            receiveShadow
            scale={[5.5, 0.2, 5.5]} // Width: 5.5, Depth: 5.5
          />
        </RigidBody>
      </group>
    </>
  );
}

function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time * 1.35, 0));
    if (obstacle.current) {
      obstacle.current.setNextKinematicRotation(rotation);
    }
  });

  return (
    <>
      <group position={position}>
        <RigidBody type="fixed">
          <mesh
            geometry={boxGeometry}
            material={floorMaterial2}
            receiveShadow
            scale={[5.5, 0.2, 9]} // Width: 5.5, Depth: 9
          />
        </RigidBody>
        <RigidBody
          type="kinematicPosition"
          position={[0, 0.3, 0]}
          restitution={0.2}
          friction={0}
          ref={obstacle}
        >
            <mesh
              material={obstacleMaterial}
              geometry={boxGeometry}
              scale={[3.5, 0.3, 0.3]}
              castShadow
              receiveShadow
            />
        </RigidBody>
      </group>
    </>
  );
}

function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const y = Math.sin(time) + 1.2;
    if (obstacle.current) {
      obstacle.current.setNextKinematicTranslation({
        x: position[0],
        // Use the kinematic body's current y, add the oscillation relative to its base position
        y: position[1] + y, // Adjust y relative to the group's position
        z: position[2],
      });
    }
  });

  return (
    <>
      <group position={position}>
        <RigidBody type="fixed">
          <mesh
            geometry={boxGeometry}
            material={floorMaterial2}
            receiveShadow
            scale={[5.5, 0.2, 9]} // Width: 5.5, Depth: 9
          />
        </RigidBody>
        <RigidBody
          type="kinematicPosition"
          position={[0, 0.3, 0]} // Position relative to the group
          restitution={0.2}
          friction={0}
          ref={obstacle}
        >
          <mesh
            material={obstacleMaterial}
            geometry={boxGeometry}
            // Position the mesh relative to the RigidBody center
            position={[0, 0, 0]} // Mesh position relative to RigidBody center
            // Adjust obstacle scale if needed relative to the new floor width
            scale={[5.0, 0.3, 0.3]} // Increased width slightly
            castShadow
            receiveShadow
          />
        </RigidBody>
      </group>
    </>
  );
}

function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  // Generate a random offset for the sine wave movement once per instance
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []); // Multiplies Math.random (0 to 1) by 2*PI to get a random phase offset (0 to 2*PI)

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Apply the random offset to the time parameter of Math.sin
    const x = Math.sin(time + randomOffset) * 1.777;
    if (obstacle.current) {
      obstacle.current.setNextKinematicTranslation({
        x: position[0] + x, // Adjust x relative to the group's position
        y: position[1] + 0.75, // Keep y relative to the group's position + base offset
        z: position[2],
      });
    }
  });

  return (
    <>
      <group position={position}>
        <RigidBody type="fixed">
          <mesh
            geometry={boxGeometry}
            material={floorMaterial2}
            receiveShadow
            scale={[5.5, 0.2, 9]} // Width: 5.5, Depth: 9
          />
        </RigidBody>
        <RigidBody
          type="kinematicPosition"
          position={[0, 0.75, 0]} // Initial position relative to the group
          restitution={0.2}
          friction={0}
          ref={obstacle}
        >
          <mesh
            material={obstacleMaterial}
            geometry={boxGeometry}
            scale={[2, 1.5, 0.3]} // Adjusted scale for visibility
            castShadow
            receiveShadow
            position={[0, 0, 0]} // Mesh position relative to RigidBody center
          />
        </RigidBody>
      </group>
    </>
  );
}

function Bounds({ levelLength = 10, centerZ = -5, floorWidth = 5.5 }) {
  // Define wall properties
  const wallHeight = 4; // Adjust height as needed
  const wallThickness = 0.3; // Adjust thickness as needed

  return (
    <>
      {/* Right Wall */}
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          // Position Calculation:
          // X: Half floor width + half wall thickness
          // Y: Half wall height (so base is at y=0)
          // Z: Center of the level's length
          position={[
            floorWidth / 2 + wallThickness / 2,
            wallHeight / 2,
            centerZ,
          ]}
          // Scale Calculation:
          // X: Wall thickness
          // Y: Wall height
          // Z: Total length of the level
          scale={[wallThickness, wallHeight, levelLength]}
          castShadow={false} // Optional: Walls might not need to cast shadows
          receiveShadow // Walls should receive shadows
        />
      </RigidBody>

      {/* Left Wall */}
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          // Position Calculation:
          // X: Negative half floor width - half wall thickness
          // Y: Half wall height
          // Z: Center of the level's length
          position={[
            -(floorWidth / 2 + wallThickness / 2),
            wallHeight / 2,
            centerZ,
          ]}
          // Scale Calculation:
          // X: Wall thickness
          // Y: Wall height
          // Z: Total length of the level
          scale={[wallThickness, wallHeight, levelLength]}
          castShadow={false}
          receiveShadow
        />
      </RigidBody>
    </>
  );
}

function BlockEnd({ position = [0, 0, 0] }) {
  const burger = useGLTF("./hamburger.glb");

  // Ensure the model is loaded before accessing scene
  if (!burger || !burger.scene) {
    return null; // Or a placeholder
  }

  // Apply shadows to all meshes in the loaded model
  burger.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <>
      <group position={position}>
        <Text font="./bebas.woff" position={[0, 3, -0.4]}>
          FINISH
        </Text>
        <RigidBody type="fixed">
          <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            receiveShadow
            scale={[5.5, 0.2, 5.5]} // Width: 5.5, Depth: 5.5
          />
        </RigidBody>
        <RigidBody type="fixed">
          <mesh
            geometry={boxGeometry}
            material={wallMaterial}
            position={[0, 2, -2.5]} // Adjust Y position for the wall
            scale={[0.3, 4, 5.5]} // Wall thickness, height, and depth
            receiveShadow // Walls should receive shadows
            rotation={[0, Math.PI / 2, 0]} // Rotate to align with the floor
          />
        </RigidBody>
        <RigidBody
          type="fixed"
          colliders="hull"
          position={[0, 0.25, 0]}
          restitution={0.2}
          friction={0}
        >
          <primitive object={burger.scene} scale={0.2} />
        </RigidBody>
      </group>
    </>
  );
}

// Preload assets
useGLTF.preload("./hamburger.glb");

export default function Level({
  count = 5,
  types = [BlockAxe, BlockLimbo, BlockSpinner],
  seed = 0,
}) {
  const resetTrigger = useGame((state) => state.resetTrigger);

  const blockDimensions = useMemo(() => {
    const dims = {};
    dims[BlockStart.name] = { depth: 5.5, width: 5.5 }; // Added width for consistency
    dims[BlockSpinner.name] = { depth: 5.5, width: 5.5 };
    dims[BlockLimbo.name] = { depth: 4, width: 5.5 };
    dims[BlockAxe.name] = { depth: 9, width: 5.5 };
    dims[BlockEnd.name] = { depth: 5.5, width: 5.5 };

    types.forEach((type) => {
      if (!dims[type.name]) {
        console.warn(
          `Dimensions not defined for block type: ${type.name}. Using default depth/width 5.5.`
        );
        dims[type.name] = { depth: 5.5, width: 5.5 }; // Default fallback
      }
    });
    return dims;
  }, [types]);

  const blocks = useMemo(() => {
    console.log("calling memo");
    const generatedBlocks = [];
    for (let i = 0; i < count; i++) {
      const BlockComponent = types[Math.floor(Math.random() * types.length)];
      generatedBlocks.push(BlockComponent);
    }
    return generatedBlocks;
  }, [count, types, resetTrigger]);

  // *** MODIFIED useMemo to calculate bounds info ***
  const {
    randomBlockPositions,
    endBlockPosition,
    totalLevelLength,
    levelCenterZ,
    floorWidth,
  } = useMemo(() => {
    const positions = [];
    const startBlockPosition = [0, 0, 0]; // Start block is always at origin
    const startDepth = blockDimensions[BlockStart.name].depth;
    const startWidth = blockDimensions[BlockStart.name].width; // Assuming start block defines floor width

    let currentZ = startBlockPosition[2]; // Start block's center Z
    let lastBlockDepth = startDepth;
    let lastBlockZ = currentZ;

    blocks.forEach((BlockComponent) => {
      const currentBlockDepth =
        blockDimensions[BlockComponent.name]?.depth ?? 5.5;
      const offset = lastBlockDepth / 2 + currentBlockDepth / 2;
      const newZ = lastBlockZ - offset;
      positions.push([0, 0, newZ]);
      lastBlockZ = newZ;
      lastBlockDepth = currentBlockDepth;
    });

    const endDepth = blockDimensions[BlockEnd.name]?.depth ?? 5.5;
    const endOffset = lastBlockDepth / 2 + endDepth / 2;
    const finalEndPosition = [0, 0, lastBlockZ - endOffset];

    // Calculate level boundaries
    const levelStartZ = startBlockPosition[2] + startDepth / 2; // Front edge of start block
    const levelEndZ = finalEndPosition[2] - endDepth / 2; // Back edge of end block
    const calculatedTotalLength = levelStartZ - levelEndZ; // Total length
    const calculatedCenterZ = (levelStartZ + levelEndZ) / 2; // Center Z coordinate

    return {
      randomBlockPositions: positions,
      endBlockPosition: finalEndPosition,
      totalLevelLength: calculatedTotalLength, // Export calculated length
      levelCenterZ: calculatedCenterZ, // Export calculated center
      floorWidth: startWidth, // Export floor width (assuming it's consistent)
    };
  }, [blocks, blockDimensions]);

  // Define Start block position (center at Z=0) - Redundant now, startBlockPosition used inside useMemo
  // const startBlockPosition = [0, 0, 0];

  return (
    <>
      {/* Render Blocks */}
      <BlockStart position={[0, 0, 0]} />{" "}
      {/* Start block is always at origin */}
      {blocks.map((Block, i) => (
        <Block key={i} position={randomBlockPositions[i]} />
        // *** REMOVED Bounds from here ***
      ))}
      <BlockEnd position={endBlockPosition} />
      {/* Render Bounds ONCE after all blocks, using calculated values */}
      <Bounds
        levelLength={totalLevelLength}
        centerZ={levelCenterZ}
        floorWidth={floorWidth}
      />
    </>
  );
}
