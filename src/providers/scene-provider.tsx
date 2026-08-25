import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { IfInSessionMode } from "@react-three/xr";
import { PropsWithChildren, useContext, useEffect, useRef } from "react";
import { createImmerStateContext, useImmerStateProvider } from "use-immer-state-provider";

import { useGameState } from "@/providers/game-state-provider";

type PublicInterface<T> = Pick<T, keyof T>;

export type SceneState = {
  cameraControls?: PublicInterface<CameraControlsImpl>;
};

export const initialState: SceneState = {};

const actions = {
  setCameraControls: (draft: SceneState, cameraControls: CameraControlsImpl) => {
    draft.cameraControls = cameraControls;
  },
};

const { context, initialValue: extractedInitialValue } = createImmerStateContext(initialState, actions);

export type SceneApi = (typeof extractedInitialValue)[1];

export const useScene = () => {
  return useContext(context);
};

export const SceneProvider = ({
  initialPosition,
  children,
}: PropsWithChildren<{ initialPosition?: [x: number, y: number, z: number] }>) => {
  const [, api, value] = useImmerStateProvider(initialState, actions);
  const [{ debug }] = useGameState();
  const cameraControlsRef = useRef<CameraControlsImpl>(null);
  useEffect(() => {
    if (cameraControlsRef.current) {
      api.setCameraControls(cameraControlsRef.current);
      cameraControlsRef.current.distance = 6;
      if (initialPosition) {
        cameraControlsRef.current.setPosition(initialPosition[0], initialPosition[1], initialPosition[2]);
      }
    }
  }, [debug, initialPosition]);
  return (
    <context.Provider value={value}>
      <IfInSessionMode deny={["immersive-ar", "immersive-vr"]}>
        <CameraControls
          ref={cameraControlsRef}
          makeDefault
          distance={6}
          minDistance={debug ? 0.1 : 6}
          maxDistance={debug ? 10 : 6}
          enabled={debug}
          smoothTime={0.3}
        />
      </IfInSessionMode>
      {children}
    </context.Provider>
  );
};
