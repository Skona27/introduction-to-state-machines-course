import React from "react";
import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";

const playerMachine = (ref, { autoplay } = { autoplay: false }) =>
  createMachine(
    {
      id: "player",
      initial: "unknown",
      context: {
        ref
      },
      states: {
        unknown: {
          always: [
            {
              target: "playing",
              cond: "shouldAutoplay"
            },
            {
              target: "paused"
            }
          ]
        },
        paused: {
          entry: "stop",
          on: {
            PLAY: "playing"
          }
        },
        playing: {
          entry: "play",
          on: {
            STOP: "paused"
          }
        }
      }
    },
    {
      guards: {
        shouldAutoplay: () => autoplay
      },
      actions: {
        play: (context) => {
          if (context.ref.current) {
            context.ref.current.play();
          }
        },
        stop: (context) => {
          if (context.ref.current) {
            context.ref.current.pause();
          }
        }
      }
    }
  );

export default function App() {
  const ref = React.useRef(null);
  const machine = playerMachine(ref, { autoplay: true });
  const [current, send] = useMachine(machine);

  return (
    <div>
      <video
        ref={ref}
        src="https://cdn.videvo.net/videvo_files/video/premium/video0121/small_watermarked/25%20Alpen%20Gold%20day%204_preview.webm"
      />

      <br />

      <button onClick={() => send("STOP")}>pause</button>
      <button onClick={() => send("PLAY")}>play</button>
    </div>
  );
}
