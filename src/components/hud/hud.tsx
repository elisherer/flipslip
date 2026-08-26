import { useXRSessionModeSupported } from "@react-three/xr";
import {
  BugIcon,
  BugOffIcon,
  InfoIcon,
  MaximizeIcon,
  MinimizeIcon,
  PencilIcon,
  RectangleGogglesIcon,
  RotateCcwIcon,
  Volume2Icon,
  VolumeOffIcon,
  XIcon,
} from "lucide-react";
import { Joystick } from "react-joystick-component";

import { ControlHints, key } from "@/components/hud/control-hints";
import PushButton from "@/components/push-button";
import useFullscreen from "@/hooks/use-fullscreen";
import { useGameState } from "@/providers/game-state-provider";
import { useJoystickState } from "@/providers/joystick-state-provider";
import { isLocalDev } from "@/utils/constants";
import isTouchDevice from "@/utils/is-touch-device";

import useToggle from "../../hooks/use-toggle";
import AboutModal from "../modal/about-modal";
import { xrStore } from "../xr/store";
import styles from "./hud.module.css";

const Hud = ({ onOpenEditor }: { onOpenEditor?: (levelIndex?: number) => void }) => {
  const [{ inLevel, levelIndex, settings, debug, audioLocked }, gameApi] = useGameState();
  const [, joystickApi] = useJoystickState();
  const infoModalOpen = useToggle();
  const [isFullscreen, toggleFullscreen] = useFullscreen();
  const vrSupport = useXRSessionModeSupported("immersive-ar");

  return (
    <>
      {isLocalDev ? (
        <div className={styles.topCenter}>
          <PushButton data-small onClick={gameApi.toggleDebug}>
            {debug ? <BugOffIcon /> : <BugIcon />}
          </PushButton>
          {onOpenEditor && (
            <PushButton data-small onClick={() => onOpenEditor(inLevel ? levelIndex : undefined)} title="Level Editor">
              <PencilIcon />
            </PushButton>
          )}
        </div>
      ) : (
        <div className={styles.cover} />
      )}
      <div className={styles.topRight}>
        {vrSupport && (
          <PushButton onClick={() => xrStore.enterAR().catch(e => alert(e.message))}>
            <RectangleGogglesIcon />
          </PushButton>
        )}
        <PushButton onClick={() => gameApi.changeSetting("hq", !settings.hq)} title="Toggle quality">
          {settings.hq ? "HQ" : "LQ"}
        </PushButton>
        <PushButton
          onClick={() => gameApi.changeSetting("audio", audioLocked ? true : !settings.audio)}
          title="Toggle sound"
        >
          {settings.audio && !audioLocked ? <Volume2Icon /> : <VolumeOffIcon />}
        </PushButton>
        <PushButton onClick={toggleFullscreen} title="Toggle fullscreen">
          {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </PushButton>
      </div>
      {inLevel ? (
        <div className={styles.topLeft}>
          <PushButton onClick={() => gameApi.homeScreen()} title="Back to home [ESC]">
            <XIcon />
          </PushButton>
          <PushButton onClick={() => gameApi.levelInitialize()} title="Restart level [BACKSPACE]">
            <RotateCcwIcon />
          </PushButton>
        </div>
      ) : (
        <div className={styles.topLeft}>
          <PushButton className={styles.info} onClick={infoModalOpen.handleSet} title="About">
            <InfoIcon />
          </PushButton>
          <AboutModal open={infoModalOpen.current} onClose={infoModalOpen.handleUnset} />
        </div>
      )}
      {!inLevel ? null : isTouchDevice ? (
        <>
          <div className={styles.bottomLeft}>
            <Joystick
              size={100}
              baseColor="rgba(128,128,128,0.3)"
              stickColor="rgba(128,128,128,0.5)"
              move={joystickApi.moveL}
              stop={joystickApi.stopL}
              minDistance={48}
            />
          </div>
          <div className={styles.bottomRight}>
            <Joystick
              size={100}
              baseColor="rgba(128,128,128,0.3)"
              stickColor="rgba(128,128,128,0.5)"
              move={joystickApi.moveR}
              stop={joystickApi.stopR}
              minDistance={48}
            />
          </div>
        </>
      ) : (
        <>
          <ControlHints
            preset={{
              accent: "#e5e7eb",
              groups: [
                {
                  label: "Move 🧑‍🚀",
                  layout: "directional",
                  keys: [key("W", "KeyW"), key("A", "KeyA"), key("S", "KeyS"), key("D", "KeyD")],
                },
              ],
            }}
            style={{
              left: "5rem",
              bottom: "2rem",
            }}
          />
          <ControlHints
            preset={{
              accent: "#e5e7eb",
              groups: [
                {
                  label: "Move 🛸",
                  layout: "directional",
                  keys: [key("↑", "ArrowUp"), key("←", "ArrowLeft"), key("↓", "ArrowDown"), key("→", "ArrowRight")],
                },
              ],
            }}
            style={{
              left: "initial",
              right: "0",
              bottom: "2rem",
            }}
          />
        </>
      )}
    </>
  );
};

export default Hud;
