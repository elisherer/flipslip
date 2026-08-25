import { type CSSProperties, useEffect, useMemo, useState } from "react";

import Icons from "@/components/icons";

import styles from "./control-hints.module.css";

export type HintKey = {
  label: string;
  codes: string[];
  wide?: boolean;
};

export type HintGroup = {
  label: string;
  keys: HintKey[];
  layout?: "row" | "directional" | "stack";
  keyRow?: "top" | "bottom";
  labelPosition?: "below" | "inline" | "none";
  bottomLabel?: string;
};

export type HintPreset = {
  accent: string;
  groups: HintGroup[];
};

export const key = (label: string, ...codes: string[]): HintKey => ({ label, codes });
export const wideKey = (label: string, ...codes: string[]): HintKey => ({ label, codes, wide: true });

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
};

export function ControlHints({ preset, style }: { preset: HintPreset; style?: CSSProperties }) {
  //const activeController = useControlStore(state => state.activeController);
  //const isTouchDevice = useIsTouchDevice();
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set());

  const visibleCodes = useMemo(() => {
    const codes = new Set<string>();
    preset.groups.forEach(group => group.keys.forEach(hintKey => hintKey.codes.forEach(code => codes.add(code))));
    return codes;
  }, [preset]);

  useEffect(() => {
    setPressedKeys(new Set());
  }, [preset]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target) || !visibleCodes.has(event.code)) return;
      setPressedKeys(current => {
        if (current.has(event.code)) return current;
        const next = new Set(current);
        next.add(event.code);
        return next;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!visibleCodes.has(event.code)) return;
      setPressedKeys(current => {
        if (!current.has(event.code)) return current;
        const next = new Set(current);
        next.delete(event.code);
        return next;
      });
    };

    const clearPressedKeys = () => setPressedKeys(new Set());

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPressedKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearPressedKeys);
    };
  }, [visibleCodes]);

  //if (isTouchDevice) return null;

  const renderHintKey = (hintKey: HintKey) => {
    const isActive = hintKey.codes.some(code => pressedKeys.has(code));
    return (
      <span
        className={[styles.controlHintKey, hintKey.wide ? styles.isWide : "", isActive ? styles.isActive : ""].join(
          " ",
        )}
        key={hintKey.label}
      >
        {hintKey.label === "←" ? (
          <Icons.arrow_back />
        ) : hintKey.label === "↓" ? (
          <Icons.arrow_downward />
        ) : hintKey.label === "↑" ? (
          <Icons.arrow_upward />
        ) : hintKey.label === "→" ? (
          <Icons.arrow_forward />
        ) : (
          hintKey.label
        )}
      </span>
    );
  };

  return (
    <div className={styles.controlHints} style={{ "--control-hint-accent": preset.accent, ...style } as CSSProperties}>
      <div className={styles.controlHintsGroups}>
        {preset.groups.map(group => {
          if (group.layout === "stack") {
            return (
              <div
                className={[styles.controlHintGroup, styles.isStack, styles.labelInline].join(" ")}
                key={group.label}
              >
                <div className={[styles.controlHintStackRow, styles.isTop].join(" ")}>
                  {group.keys[0] && renderHintKey(group.keys[0])}
                  <div className={styles.controlHintLabel}>{group.label}</div>
                </div>
                <div className={[styles.controlHintStackRow, styles.isBottom].join(" ")}>
                  {group.keys[1] && renderHintKey(group.keys[1])}
                </div>
                {group.bottomLabel && <div className={styles.controlHintStackLabel}>{group.bottomLabel}</div>}
              </div>
            );
          }

          return (
            <div
              className={[
                styles.controlHintGroup,
                group.layout === "directional"
                  ? styles.isDirectional
                  : group.keyRow === "bottom"
                    ? styles.isBottom
                    : styles.isTop,
                group.labelPosition === "none"
                  ? styles.labelNone
                  : group.labelPosition === "inline"
                    ? styles.labelInline
                    : styles.labelBelow,
              ].join(" ")}
              key={group.label}
            >
              <div
                className={[styles.controlHintKeys, group.layout === "directional" ? styles.isDirectional : ""].join(
                  " ",
                )}
              >
                {group.keys.map(renderHintKey)}
              </div>
              <div className={styles.controlHintLabel}>{group.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
