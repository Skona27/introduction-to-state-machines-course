import { useMachine } from "@xstate/react";
import React from "react";
import { assign, createMachine } from "xstate";

const data = ["A", "B", "C"];

const fetchMachine = createMachine(
  {
    id: "fetch",
    initial: "idle",
    context: {
      result: []
    },
    on: {
      FETCH: "pending"
    },
    states: {
      idle: {},
      pending: {
        on: {
          FETCH: undefined
        },
        invoke: {
          src: "fetch",
          onDone: {
            target: "success",
            actions: "setData"
          },
          onError: {
            target: "error"
          }
        }
      },
      success: {},
      error: {}
    }
  },
  {
    actions: {
      setData: assign({
        result: (_, event) => event.data
      })
    },
    services: {
      fetch: () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.9) {
              resolve(data);
            } else {
              reject();
            }
          }, 1000);
        })
    }
  }
);

export default function App() {
  const [current, send] = useMachine(fetchMachine);
  return (
    <div className="App">
      {current.matches("success") && (
        <ul>
          {current.context.result.map((item) => (
            <li key={item}>item</li>
          ))}
        </ul>
      )}

      {current.matches("pending") && <span>Please wait...</span>}
      {current.matches("error") && <span>Ooops! Something went wrong</span>}

      <br />

      <button
        onClick={() => {
          send("FETCH");
        }}
      >
        fetch
      </button>
    </div>
  );
}
