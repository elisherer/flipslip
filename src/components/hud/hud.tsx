import { ControlHints, key } from "@/components/hud/control-hints";
import Icons from "@/components/icons";
import PushButton from "@/components/push-button";
import useFullscreen from "@/hooks/use-fullscreen";
import { useGameState } from "@/providers/game-state-provider";
import { isLocalDev } from "@/utils/constants";
import isTouchDevice from "@/utils/is-touch-device";

import useToggle from "../../hooks/use-toggle";
import AboutModal from "../modal/AboutModal";
import { hasVR } from "../xr/store";
import styles from "./hud.module.css";

const Hud = ({ onOpenEditor }: { onOpenEditor?: (levelIndex?: number) => void }) => {
  const [{ inLevel, levelIndex, settings }, gameApi] = useGameState();
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
            <PushButton
              data-small
              onClick={() => onOpenEditor(inLevel ? levelIndex : undefined)}
              title="Level Editor"
            >
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
        <PushButton onClick={() => gameApi.changeSetting("hq", !settings.hq)}>
          {settings.hq ? <Icons.high_quality /> : <Icons.standard_quality />}
        </PushButton>
        <PushButton onClick={() => gameApi.changeSetting("sfx", !settings.sfx)}>
          {settings.sfx ? <Icons.volume_up /> : <Icons.volumn_off />}
        </PushButton>
        <PushButton onClick={() => gameApi.changeSetting("music", !settings.music)}>
          {settings.music ? <Icons.music_note /> : <Icons.music_off />}
        </PushButton>
        <PushButton onClick={toggleFullscreen}>
          {isFullscreen ? <Icons.fullscreen /> : <Icons.fullscreen_exit />}
        </PushButton>
      </div>
      {inLevel ? (
        <div className={styles.topLeft}>
          <PushButton onClick={() => gameApi.homeScreen()}>
            <Icons.close />
          </PushButton>
          <PushButton onClick={() => gameApi.levelInitialize()}>
            <Icons.replay />
          </PushButton>
        </div>
      ) : (
        <div className={styles.topLeft}>
          <PushButton className={styles.info} onClick={infoModalOpen.handleSet}>
            <Icons.info />
          </PushButton>
          <AboutModal open={infoModalOpen.current} onClose={infoModalOpen.handleUnset} />
        </div>
      )}
      {!inLevel ? null : isTouchDevice ? /*(
        <>
          <Joystick
            id="left"
            joystickWrapperStyle={{ left: 0, bottom: 0 }}
            // joystickBaseProps={joystickMeshProps}
            // joystickHandleProps={joystickMeshProps}
            // joystickStickProps={joystickMeshProps}
            // buttonSmallBaseProps={joystickMeshProps}
            // buttonLargeBaseProps={joystickMeshProps}
            // buttonTop1Props={joystickMeshProps}
            // buttonGroup1Position={[-2, -1, 0]}
            // buttonTop2Props={joystickMeshProps}
            // buttonGroup2Position={[1, 2, 0]}
            // buttonTop3Props={joystickMeshProps}
            // buttonGroup3Position={[2, -2, 0]}
            // buttonNumber={3}
          />
          <VirtualButton
            id="jump"
            label="Jump"
            buttonWrapperStyle={{ right: "40px", bottom: "120px" }}
            buttonCapStyle={{ color: "black" }}
          />
          <VirtualButton
            id="interact"
            label="Action"
            buttonWrapperStyle={{ right: "120px", bottom: "30px" }}
            buttonCapStyle={{ color: "black" }}
          />
        </>
      )*/ null : (
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
                  keys: [key("UP", "ArrowUp"), key("L", "ArrowLeft"), key("D", "ArrowDown"), key("R", "ArrowRight")],
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
