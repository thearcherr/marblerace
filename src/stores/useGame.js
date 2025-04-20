import { create } from "zustand";

export default create((set) => ({
    blockCount: 4 + Math.floor(Math.random() * 4),
    phase: "ready",
    startTime: 0.00,
    endTime: 0.00,
    resetTrigger: false,
    blocksSeed: 0,
    
    setResetTrigger: (boolean) => {
        set(() => {
            return { resetTrigger: boolean}
        })
    },

    setStartTime: (time) => {
        set(() => {
            return { startTime: time }
        })
    },

    setEndTime: (time) => {
        set(() => {
            return { endTime: time }
        })
    },

    resetTimers: () => {
        set(() => {
            return { startTime: 0.00, endTime: 0.00 }
        })
    },

    start: () => {
        set(() => {
            return { phase: "playing" }
        })
    },

    restart: () => {
        set(() => {
            return { phase: "ready"}
        })
    },

    end: () => {
        set(() => {
            return { phase: "ended" }
        })
    },
}));