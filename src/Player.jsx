import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber"; // Import useThree
import { RigidBody } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three"; // Import THREE
import useGame from "./stores/useGame";

export default function Player() {
  const body = useRef();
  const cameraTarget = useRef(new THREE.Vector3(0, 0.65, 0)); // Ref to store the camera's actual look-at target for smooth interpolation

  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { camera } = useThree(); // Get the camera instance
  const start = useGame((state) => state.start);
  const restart = useGame((state) => state.restart);
  const end = useGame((state) => state.end);
  const phase = useGame((state) => state.phase);
  const blockCount = useGame((state) => state.blockCount);
  const setEndTime = useGame((state) => state.setEndTime);
  const setStartTime = useGame((state) => state.setStartTime);
  const resetTimers = useGame((state) => state.resetTimers);
  const resetTrigger = useGame((state) => state.resetTrigger);
  const setResetTrigger = useGame((state) => state.setResetTrigger);

  const GROUND_VELOCITY_THRESHOLD = 0.1;

  const jump = () => {
    if (!body.current) return;
    const currentVelocity = body.current.linvel();
    const isEffectivelyGrounded =
      Math.abs(currentVelocity.y) < GROUND_VELOCITY_THRESHOLD;

    if (isEffectivelyGrounded) {
      body.current.applyImpulse({ x: 0, y: 6, z: 0 }, true);
    }
  };

  const reset = () => {
    body.current.setTranslation({ x: 0, y: 0.85, z: 0 }, true);
    body.current.applyImpulse({ x: 0, y: 0, z: 0 }, true);
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    camera.position.set(0, 2, 5.5);
    camera.lookAt(0, 0.65, 0);
    cameraTarget.current.set(0, 0.65, 0);
    resetTimers();
    useGame.setState({ phase: "ready" });
  };

  useEffect(() => {

    const unsubEffect = useGame.subscribe(
      (state) => state.phase,
      (phase) => {
        console.log('phase changed', phase)
      }
    )

    const unsubscribe = subscribeKeys(
      (state) => state.jump,
      (val) => {
        if (val) {
          jump();
        }
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      if (phase !== "playing" && phase !== "ended") {
        console.log("start phase", phase);
        const timeNow = performance.now();
        setStartTime(timeNow);
        console.log("start time", timeNow);
        return start();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAny();
      unsubEffect();
    };
  }, [subscribeKeys, jump]);

  useEffect(() => {
    if (resetTrigger) {
      reset();
      setResetTrigger(false); // Reset the trigger after resetting the player
    }
  }, [resetTrigger]);

  const smoothingFactorPosition = 3;
  const smoothingFactorTarget = 5;

  useFrame((state, delta) => {
    if (!body.current) return;

    const { forward, backward, left, right } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const impulseStrength = 10 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
    }
    if (backward) {
      impulse.z += impulseStrength;
    }
    if (left) {
      impulse.x -= impulseStrength;
    }
    if (right) {
      impulse.x += impulseStrength;
    }

    if (impulse.x !== 0 || impulse.y !== 0 || impulse.z !== 0) {
      body.current.applyImpulse(impulse, true); // Apply impulse in world coordinates
    }

    const bodyposition = body.current.translation();

    const desiredCameraPosition = new THREE.Vector3(
      bodyposition.x,
      bodyposition.y + 2,
      bodyposition.z + 5.5
    );

    const desiredCameraTarget = new THREE.Vector3(
      bodyposition.x,
      bodyposition.y + 0.65,
      bodyposition.z
    );

    const alpha = 1.0 - Math.exp(-smoothingFactorPosition * delta);
    const alphaTarget = 1.0 - Math.exp(-smoothingFactorTarget * delta);

    camera.position.lerp(desiredCameraPosition, alpha);

    cameraTarget.current.lerp(desiredCameraTarget, alphaTarget);

    camera.lookAt(cameraTarget.current);

    if (bodyposition.z < -(blockCount * 6 + 2)) {
      if (phase === "playing") {
        const timeNow = performance.now();
        setEndTime(timeNow);
        console.log("end time", timeNow);
        end();
      }
    }

    if (bodyposition.y < -4) {
      if (phase === "playing") {
        restart();
        reset();
      }
    }
  });

  return (
    <>
      <RigidBody ref={body} colliders="ball" restitution={0.2} friction={1}>
        <mesh castShadow receiveShadow position={[0, 0.85, 0]} scale={0.85}>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
      </RigidBody>
    </>
  );
}
