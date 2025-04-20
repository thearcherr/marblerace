import { useKeyboardControls } from "@react-three/drei"
import useGame from './stores/useGame.js'
import { useEffect } from "react";

export default function Interface() {

    const forward = useKeyboardControls((state) => state.forward);
    const backward = useKeyboardControls((state) => state.backward);
    const left = useKeyboardControls((state) => state.left);
    const right = useKeyboardControls((state) => state.right);
    const space = useKeyboardControls((state) => state.jump);

    const phase = useGame((state) => state.phase);
    const calculatedTime = useGame((state) => (state.endTime - state.startTime) / 1000).toFixed(2);

    const actionReset = () => {
        useGame.setState({ resetTrigger: true });
        console.log("trigger reset");
    }

    return (
        <div className="interface">
            <div className="time">{phase === "ended" ? calculatedTime : "0.00"}</div>
            <div onClick={actionReset} className={`restart ${phase === "ended" ? "show" : "hide"}`}>RESTART</div>

            <div className="controls">
                <div className="raw">
                    <div className={`key ${forward ? "active" : ""}`}></div>
                </div>
                <div className="raw">
                <div className={`key ${left ? "active" : ""}`}></div>
                <div className={`key ${backward ? "active" : ""}`}></div>
                <div className={`key ${right ? "active" : ""}`}></div>
                </div>
                <div className="raw">
                <div className={`key large ${space ? "active" : ""}`}></div>
                </div>
            </div>
        </div>
    )
}