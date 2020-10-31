import * as React from "react";
import { useMachine } from "@xstate/react";
import { assign, createMachine, send, actions, DoneInvokeEvent } from "xstate";

type TypeEvent = {
  type: "TYPE";
  data: string;
};

type SearchEvent = {
  type: "SEARCH";
  data: undefined;
};

type Event = TypeEvent | SearchEvent;

type Context = {
  phrase: string;
  result: number | undefined;
};

const { cancel } = actions;
const DELAY = 1000;

const searchMachine = createMachine<Context, Event>(
  {
    id: "search",
    initial: "idle",
    context: {
      phrase: "",
      result: undefined
    },
    on: {
      TYPE: {
        actions: ["setPhrase", "cancelSeaachEvent", "sendSearchEvent"]
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
      setPhrase: assign<Context, TypeEvent>({
        phrase: (_, event) => event.data
      }),
      sendSearchEvent: send(
        { type: "SEARCH" },
        {
          id: "searchEvent",
          delay: DELAY
        }
      ),
      setResult: assign<Context, DoneInvokeEvent<number>>({
        result: (_, event) => event.data
      }),
      cancelSeaachEvent: cancel("searchEvent")
    } as any,
    services: {
      search: async () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(Math.random());
          }, 1000);
        });
      }
    }
  }
);

export default function App() {
  const [current, send] = useMachine(searchMachine);
  const { result, phrase } = current.context;

  return (
    <div>
      Result: <strong>{result}</strong>
      <br />
      State: <strong>{current.value}</strong>
      <br />
      <br />
      <input
        value={phrase}
        onChange={(event) => {
          send({ type: "TYPE", data: event.target.value });
        }}
      />
    </div>
  );
}
