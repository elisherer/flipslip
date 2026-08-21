import { KeyboardEvent, useEffect, useRef } from "react";

import Icons from "@/components/icons";

import Modal from "./Modal";
import styles from "./LevelCompleteModal.module.css";

export default function LevelCompleteModal({
  open,
  hasNextLevel,
  onHome,
  onRestart,
  onNext,
}: {
  open: boolean;
  hasNextLevel: boolean;
  onHome: () => any;
  onRestart: () => any;
  onNext: () => any;
}) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

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
      moveFocus(index, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(index, -1);
    }
  };

  return (
    <Modal onRequestClose={onHome} title="Level Complete!" className={styles.modal}>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.button}
          ref={el => { buttonsRef.current[0] = el; }}
          onKeyDown={handleKeyDown(0)}
          onClick={onHome}
        >
          <Icons.close />
          Home
        </button>
        <button
          type="button"
          className={styles.button}
          ref={el => { buttonsRef.current[1] = el; }}
          onKeyDown={handleKeyDown(1)}
          onClick={onRestart}
        >
          <Icons.replay />
          Restart
        </button>
        {hasNextLevel && (
          <button
            type="button"
            className={styles.button + " " + styles.primary}
            ref={el => { buttonsRef.current[2] = el; }}
            onKeyDown={handleKeyDown(2)}
            onClick={onNext}
          >
            <Icons.arrow_forward />
            Next Level
          </button>
        )}
      </div>
    </Modal>
  );
}
