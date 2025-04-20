import { OrbitControls } from "@react-three/drei";
import Lights from "./Lights.jsx";
import Level from "./Level.jsx";
import { Physics } from "@react-three/rapier";
import Player from "./Player.jsx";
import useGame from "./stores/useGame.js";
import Effects from "./Effects.js";

export default function Experience() {

  const blockCount = useGame((state) => state.blockCount);
  const blocksSeed = useGame((state) => state.blocksSeed);

  return (
    <>
      <color attach="background" args={["#252731"]} />
      <Effects />
      <Physics>
        <OrbitControls makeDefault />
        <Level count={blockCount} seed={blocksSeed} />
        <Lights />
        <Player />
      </Physics>
    </>
  );
}
