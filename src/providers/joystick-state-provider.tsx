import { PropsWithChildren, useContext } from "react";
import { Joystick } from "react-joystick-component";
import { createImmerStateContext, useImmerStateProvider } from "use-immer-state-provider";

type IJoystickUpdateEvent = Parameters<NonNullable<ConstructorParameters<typeof Joystick>[0]["move"]>>[0];

export type JoystickState = {
  direction1?: IJoystickUpdateEvent["direction"];
  direction2?: IJoystickUpdateEvent["direction"];
};

export const initialState: JoystickState = {};

const actions = {
  move1: (draft: JoystickState, event: IJoystickUpdateEvent) => {
    draft.direction1 = event.direction;
  },
  stop1: (draft: JoystickState) => {
    delete draft.direction1;
  },
  move2: (draft: JoystickState, event: IJoystickUpdateEvent) => {
    draft.direction2 = event.direction;
  },
  stop2: (draft: JoystickState) => {
    delete draft.direction2;
  },
};

const { context, initialValue: extractedInitialValue } = createImmerStateContext(initialState, actions);

export type JoystickStateApi = (typeof extractedInitialValue)[1];

export const useJoystickState = () => {
  return useContext(context);
};

const JoystickStateProvider = ({ children }: PropsWithChildren<{}>) => {
  const [, , value] = useImmerStateProvider(initialState, actions);

  return <context.Provider value={value}>{children}</context.Provider>;
};

export default JoystickStateProvider;
