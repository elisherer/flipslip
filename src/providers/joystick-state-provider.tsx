import { PropsWithChildren, useContext } from "react";
import { Joystick } from "react-joystick-component";
import { createImmerStateContext, useImmerStateProvider } from "use-immer-state-provider";

type IJoystickUpdateEvent = Parameters<NonNullable<ConstructorParameters<typeof Joystick>[0]["move"]>>[0];

export type JoystickState = {
  left?: IJoystickUpdateEvent["direction"];
  right?: IJoystickUpdateEvent["direction"];
};

export const initialState: JoystickState = {};

const actions = {
  moveL: (draft: JoystickState, event: IJoystickUpdateEvent) => {
    draft.left = event.direction;
  },
  stopL: (draft: JoystickState) => {
    delete draft.left;
  },
  moveR: (draft: JoystickState, event: IJoystickUpdateEvent) => {
    draft.right = event.direction;
  },
  stopR: (draft: JoystickState) => {
    delete draft.right;
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
