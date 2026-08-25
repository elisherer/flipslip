import { ReactNode, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import Icons from "../icons";
import styles from "./modal.module.css";

const modalRoot = document.getElementById("modal-root");

export default function Modal({
  className,
  contentClassName,
  onRequestClose,
  title,
  children,
  hideTitle,
  dark,
}: {
  className?: string;
  contentClassName?: string;
  onRequestClose: () => any;
  title: ReactNode;
  children: any;
  hideTitle?: boolean;
  dark?: boolean;
}) {
  const el = useMemo(() => {
    const div = document.createElement("div");
    div.className = styles.overlay;
    div.onclick = e => {
      if (e.target === div) onRequestClose();
    };
    return div;
  }, []);

  useEffect(() => {
    if (!modalRoot) return () => {};
    modalRoot.appendChild(el);
    return () => modalRoot.removeChild(el);
  }, [el]);

  return createPortal(
    <div
      className={(className || "") + " " + styles.modal + (dark ? " " + styles.dark : "")}
      role="dialog"
      aria-labelledby="modal__title"
      aria-describedby="modal__content"
    >
      <div id="modal__title" className={styles.title}>
        <div>{!hideTitle && title}</div>
        <div className={styles.close} onClick={onRequestClose} title="Close">
          <Icons.close />
        </div>
      </div>

      <div id="modal__content" className={(contentClassName || "") + " " + styles.content}>
        {children}
      </div>
    </div>,
    el,
  );
}
