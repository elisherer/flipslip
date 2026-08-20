import { ComponentProps } from "react";

import styles from "./push-button.module.css";

export default function PushButton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-role="button" className={styles.pushButton + (className ? " " + className : "")} {...props} />;
}
