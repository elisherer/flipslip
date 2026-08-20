import styles from "./loading-screen.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.logo} />
    </div>
  );
}
