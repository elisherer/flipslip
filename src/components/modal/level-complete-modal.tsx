import { ArrowRightIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { KeyboardEvent, useEffect, useRef } from "react";

import { Levels } from "@/levels/levels";
import { useGameState } from "@/providers/game-state-provider";

import styles from "./level-complete-modal.module.css";
import Modal from "./modal";

export default function LevelCompleteModal({
  open,
  setCompleteDialogOpen,
}: {
  open: boolean;
  setCompleteDialogOpen: (state: boolean) => any;
}) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [{ levelIndex }, gameApi] = useGameState();
  const hasNextLevel = levelIndex < Levels.length - 1;
  const onHome = () => {
    gameApi.homeScreen();
    setCompleteDialogOpen(false);
  };
  const onRestart = () => {
    gameApi.levelInitialize();
    setCompleteDialogOpen(false);
  };
  const onNext = () => {
    gameApi.levelInitialize(levelIndex + 1);
    setCompleteDialogOpen(false);
  };
  useEffect(() => {
    if (!open) return;
    // focus the primary action: Next Level when available, otherwise Restart
    const primaryIndex = hasNextLevel ? 2 : 1;
    buttonsRef.current[primaryIndex]?.focus();
  }, [open, hasNextLevel]);

  if (!open) return null;

  const moveFocus = (from: number, dir: 1 | -1) => {
    const buttons = buttonsRef.current.filter(Boolean) as HTMLButtonElement[];
    if (!buttons.length) return;
    const next = (from + dir + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      moveFocus(index, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      moveFocus(index, -1);
    } /*else if (e.key === "Enter" && index === 0) {
      e.preventDefault();
      e.stopPropagation();
      gameApi.homeScreen();
      setCompleteDialogOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      gameApi.homeScreen();
      setCompleteDialogOpen(false);
    }*/
  };

  return (
    <Modal onRequestClose={onHome} title="Level Complete!" hideTitle dark className={styles.modal}>
      <div className={styles.heading}>
        <span className={styles.star}>⭐</span>
        Level Complete!
        <span className={styles.star}>⭐</span>
      </div>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.button}
          ref={el => {
            buttonsRef.current[0] = el;
          }}
          onKeyDown={handleKeyDown(0)}
          onClick={onHome}
        >
          <XIcon />
          Home
        </button>
        <button
          type="button"
          className={styles.button}
          ref={el => {
            buttonsRef.current[1] = el;
          }}
          onKeyDown={handleKeyDown(1)}
          onClick={onRestart}
        >
          <RotateCcwIcon />
          Restart
        </button>
        {hasNextLevel && (
          <button
            type="button"
            className={styles.button + " " + styles.primary}
            ref={el => {
              buttonsRef.current[2] = el;
            }}
            onKeyDown={handleKeyDown(2)}
            onClick={onNext}
          >
            <ArrowRightIcon />
            Next Level
          </button>
        )}
      </div>
    </Modal>
  );
}
