import { Joystick } from "react-joystick-component";

import { ControlHints, key } from "@/components/hud/control-hints";
import Icons from "@/components/icons";
import PushButton from "@/components/push-button";
import useFullscreen from "@/hooks/use-fullscreen";
import { useGameState } from "@/providers/game-state-provider";
import { useJoystickState } from "@/providers/joystick-state-provider";
import { isLocalDev } from "@/utils/constants";
import isTouchDevice from "@/utils/is-touch-device";

import useToggle from "../../hooks/use-toggle";
import AboutModal from "../modal/AboutModal";
import { hasVR } from "../xr/store";
import styles from "./hud.module.css";

const Hud = ({ onOpenEditor }: { onOpenEditor?: (levelIndex?: number) => void }) => {
  const [{ inLevel, levelIndex, settings }, gameApi] = useGameState();
  const [, joystickApi] = useJoystickState();
  const infoModalOpen = useToggle();
  const [isFullscreen, toggleFullscreen] = useFullscreen();

  return (
    <>
      {isLocalDev ? (
        <div className={styles.topCenter}>
          <PushButton data-small onClick={gameApi.toggleDebug}>
            <Icons.debug />
          </PushButton>
          {onOpenEditor && (
            <PushButton data-small onClick={() => onOpenEditor(inLevel ? levelIndex : undefined)} title="Level Editor">
              <Icons.edit />
            </PushButton>
          )}
        </div>
      ) : (
        <div className={styles.cover} />
      )}
      <div className={styles.topRight}>
        {hasVR() && (
          <PushButton onClick={/*() => store?.enterVR()*/ undefined}>
            <Icons.vr />
          </PushButton>
        )}
        <PushButton onClick={() => gameApi.changeSetting("hq", !settings.hq)} title="Toggle quality">
          {settings.hq ? <Icons.high_quality /> : <Icons.standard_quality />}
        </PushButton>
        <PushButton onClick={() => gameApi.changeSetting("sfx", !settings.sfx)} title="Toggle sound effects">
          {settings.sfx ? <Icons.volume_up /> : <Icons.volumn_off />}
        </PushButton>
        <PushButton onClick={() => gameApi.changeSetting("music", !settings.music)} title="Toggle music">
          {settings.music ? <Icons.music_note /> : <Icons.music_off />}
        </PushButton>
        <PushButton onClick={toggleFullscreen} title="Toggle fullscreen">
          {isFullscreen ? <Icons.fullscreen /> : <Icons.fullscreen_exit />}
        </PushButton>
      </div>
      {inLevel ? (
        <div className={styles.topLeft}>
          <PushButton onClick={() => gameApi.homeScreen()} title="Back to home [ESC]">
            <Icons.close />
          </PushButton>
          <PushButton onClick={() => gameApi.levelInitialize()} title="Restart level [BACKSPACE]">
            <Icons.replay />
          </PushButton>
        </div>
      ) : (
        <div className={styles.topLeft}>
          <PushButton className={styles.info} onClick={infoModalOpen.handleSet} title="About">
            <Icons.info />
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
              move={joystickApi.move1}
              stop={joystickApi.stop1}
            />
          </div>
          <div className={styles.bottomRight}>
            <Joystick
              size={100}
              baseColor="rgba(128,128,128,0.3)"
              stickColor="rgba(128,128,128,0.5)"
              move={joystickApi.move2}
              stop={joystickApi.stop2}
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
                  label: "Move",
                  layout: "directional",
                  keys: [key("W", "KeyW"), key("A", "KeyA"), key("S", "KeyS"), key("D", "KeyD")],
                },
                // {
                //   label: "Run",
                //   layout: "stack",
                //   labelPosition: "inline",
                //   bottomLabel: "Jump",
                //   keys: [key("Shift", "ShiftLeft", "ShiftRight", "Shift"), wideKey("Space", "Space")],
                // },
                // { label: "Enter", keyRow: "bottom", labelPosition: "inline", keys: [key("F", "KeyF")] },
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
                  label: "Move",
                  layout: "directional",
                  keys: [key("↑", "ArrowUp"), key("←", "ArrowLeft"), key("↓", "ArrowDown"), key("→", "ArrowRight")],
                },
                // {
                //   label: "Run",
                //   layout: "stack",
                //   labelPosition: "inline",
                //   bottomLabel: "Jump",
                //   keys: [key("Shift", "ShiftLeft", "ShiftRight", "Shift"), wideKey("Space", "Space")],
                // },
                // { label: "Enter", keyRow: "bottom", labelPosition: "inline", keys: [key("F", "KeyF")] },
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
