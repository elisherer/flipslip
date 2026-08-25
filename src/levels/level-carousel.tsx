import { useTexture } from "@react-three/drei";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { DoubleSide } from "three";

import Icons from "@/components/icons";
import PushButton from "@/components/push-button";
import { xrStore } from "@/components/xr/store";
import useThumbstickDirection from "@/components/xr/useThumbstickDirection";
import XrButton from "@/components/xr/xr-button";
import { Levels, deleteDraft, getDraftNumber, isDraftLevel } from "@/levels/levels";
import { useGameState } from "@/providers/game-state-provider";
import { Direction } from "@/types/direction";

import styles from "./level-carousel.module.css";

const CARD_RANGE = 2;

function Logo() {
  const texture = useTexture("/assets/textures/logo.png");

  return (
    <mesh position={[0, 2, -15]} receiveShadow>
      <planeGeometry args={[14, 5]} />
      <meshStandardMaterial map={texture} transparent side={DoubleSide} />
    </mesh>
  );
}

export function LevelCarousel({ vr }: { vr?: boolean }) {
  const [{ progress, inLevel }, gameApi] = useGameState();
  const maxUnlockedIndex = Math.min(progress.lastCompletedIndex + 1, Levels.length - 1);

  const [selectedIndex, setSelectedIndex] = useState(maxUnlockedIndex);
  const [levelsVersion, setLevelsVersion] = useState(0);

  useEffect(() => {
    setSelectedIndex(maxUnlockedIndex);
  }, [maxUnlockedIndex]);

  const cards = useMemo(() => {
    const items: { index: number; offset: number }[] = [];
    for (let offset = -CARD_RANGE; offset <= CARD_RANGE; offset++) {
      const index = selectedIndex + offset;
      if (index < 0 || index >= Levels.length) continue;
      items.push({ index, offset });
    }
    return items;
  }, [selectedIndex, levelsVersion]);

  const goTo = (index: number) => {
    if (index < 0 || index >= Levels.length) return;
    setSelectedIndex(index);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setSelectedIndex(i => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setSelectedIndex(i => Math.min(Levels.length - 1, i + 1));
      } else if (e.key === "Enter" && selectedIndex <= maxUnlockedIndex) {
        gameApi.levelInitialize(selectedIndex);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, maxUnlockedIndex, gameApi]);

  const vrDirection = useThumbstickDirection("right", !!vr);
  useEffect(() => {
    if (!vr) return;
    if (vrDirection === Direction.LEFT) {
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (vrDirection === Direction.RIGHT) {
      setSelectedIndex(i => Math.min(Levels.length - 1, i + 1));
    }
  }, [vr, vrDirection]);

  const isLocked = (index: number) => !isDraftLevel(index) && index > maxUnlockedIndex;
  const selectedLocked = isLocked(selectedIndex);

  const handleDeleteDraft = (index: number, e: MouseEvent) => {
    e.stopPropagation();
    const draftNumber = getDraftNumber(index);
    if (draftNumber === null) return;
    if (!window.confirm(`Delete Draft ${draftNumber}? This can't be undone.`)) return;
    deleteDraft(draftNumber);
    setSelectedIndex(i => Math.min(i > index ? i - 1 : i, Levels.length - 1));
    setLevelsVersion(v => v + 1);
  };

  if (inLevel) return;

  if (vr) {
    return (
      <group position={[0, -2, -18]}>
        <mesh position={[0, -3, -22]} receiveShadow>
          <planeGeometry args={[35, 35]} />
          <meshStandardMaterial color="black" transparent side={DoubleSide} opacity={0.9} />
        </mesh>
        <Logo />
        <XrButton
          position={[-6, 6, 0]}
          color="#606060"
          hoverColor="#e0e0e0"
          fontSize={0.5}
          label="❌"
          onClick={() => xrStore.getState().session?.end()}
        />
        <XrButton
          position={[-4, -1, 0]}
          color="#606060"
          hoverColor="#e0e0e0"
          label="←"
          disabled={selectedIndex <= 0}
          fontSize={0.8}
          onClick={() => selectedIndex > 0 && goTo(selectedIndex - 1)}
        />
        {cards.map(({ index, offset }) => {
          const locked = isLocked(index);
          const completed = !isDraftLevel(index) && index <= progress.lastCompletedIndex;
          const current = offset === 0;
          return (
            <XrButton
              key={index}
              position={[offset, -1, 0]}
              color={completed ? "#008000" : undefined}
              hoverColor={completed ? "#00e000" : undefined}
              opacity={current ? 1 : locked ? 0.35 : 0.6}
              onClick={() => locked || gameApi.levelInitialize(index)}
              fontSize={0.5}
              label={(isDraftLevel(index) ? getDraftNumber(index) : index + 1)?.toString()}
            />
          );
        })}
        <XrButton
          position={[5, -1, 0]}
          color="#606060"
          hoverColor="#e0e0e0"
          fontSize={0.8}
          label="️→"
          disabled={selectedIndex >= Levels.length - 1}
          onClick={() => selectedIndex < Levels.length - 1 && goTo(selectedIndex + 1)}
        />
      </group>
    );
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.logo} />
      <div className={styles.track}>
        <PushButton
          className={styles.nav}
          data-side="left"
          aria-disabled={selectedIndex <= 0}
          onClick={() => selectedIndex > 0 && goTo(selectedIndex - 1)}
        >
          <Icons.arrow_back />
        </PushButton>
        {cards.map(({ index, offset }) => {
          const locked = isLocked(index);
          const completed = !isDraftLevel(index) && index <= progress.lastCompletedIndex;
          const current = offset === 0;
          return (
            <button
              key={index}
              type="button"
              className={styles.card}
              data-current={current}
              data-locked={locked}
              style={{
                transform: `translateX(${offset * 8}em) scale(${current ? 1 : 0.75})`,
                opacity: current ? 1 : locked ? 0.35 : 0.6,
                zIndex: 10 - Math.abs(offset),
              }}
              onClick={() => (current ? locked || gameApi.levelInitialize(index) : goTo(index))}
            >
              {isDraftLevel(index) && (
                <div
                  className={styles.cardDelete}
                  role="button"
                  title="Delete draft"
                  onClick={e => handleDeleteDraft(index, e)}
                >
                  <Icons.delete />
                </div>
              )}
              <div className={styles.cardLabel}>{isDraftLevel(index) ? "Draft" : "Level"}</div>
              <div className={styles.cardNumber}>{isDraftLevel(index) ? getDraftNumber(index) : index + 1}</div>
              {locked ? (
                <div className={styles.cardLock}>
                  <Icons.lock />
                </div>
              ) : (
                completed && (
                  <div className={styles.cardComplete}>
                    <Icons.check_circle />
                  </div>
                )
              )}
            </button>
          );
        })}
        <PushButton
          className={styles.nav}
          data-side="right"
          aria-disabled={selectedIndex >= Levels.length - 1}
          onClick={() => selectedIndex < Levels.length - 1 && goTo(selectedIndex + 1)}
        >
          <Icons.arrow_forward />
        </PushButton>
      </div>
      <PushButton
        className={styles.playButton}
        aria-disabled={selectedLocked}
        onClick={() => !selectedLocked && gameApi.levelInitialize(selectedIndex)}
      >
        <Icons.play_arrow />
        Play
      </PushButton>
      <div className={styles.dots}>
        {Levels.map((_, index) => (
          <div
            key={index}
            className={styles.dot}
            data-active={index === selectedIndex}
            data-locked={isLocked(index)}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default LevelCarousel;
