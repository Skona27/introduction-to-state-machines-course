import { useMachine } from "@xstate/react";
import React from "react";
import { createMachine, actions, assign } from "xstate";

const { send, cancel } = actions;

const DELAY = 500;

const searchMachine = createMachine(
  {
    id: "searchMachine",
    initial: "idle",
    strict: true,
    context: {
      phrase: "",
      result: undefined
    },
    on: {
      TYPE: {
        actions: ["setPhrase", "cancelSearchEvent", "sendSearchEvent"]
      },
      SEARCH: {
        target: ".searching"
      }
    },
    states: {
      idle: {},
      searching: {
        invoke: {
          src: "search",
          onDone: {
            actions: "setResult",
            target: "idle"
          },
          onError: {
            target: "idle"
          }
        }
      }
    }
  },
  {
    actions: {
      sendSearchEvent: send(
        { type: "SEARCH" },
        { id: "searchEvent", delay: DELAY }
      ),
      cancelSearchEvent: cancel("searchEvent"),
      setPhrase: assign({
        phrase: (_, event) => event.data
      }),
      setResult: assign({
        result: (_, event) => event.data
      })
    },
    services: {
      search: async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(Math.random());
          }, 500);
        });
      }
    }
  }
);

export default function App() {
  const [current, send] = useMachine(searchMachine);

  const { phrase, result } = current.context;

  return (
    <div>
      Result: <strong>{result}</strong>
      <br />
      State: <strong> {current.value}</strong>
      <br />
      <br />
      <input
        type="text"
        value={phrase}
        onChange={(event) => {
          send({ type: "TYPE", data: event.target.value });
        }}
      />
    </div>
  );
}
