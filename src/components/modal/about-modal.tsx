import styles from "./about-model.module.css";
import Modal from "./modal";

interface CreditEntry {
  label: string;
  link: string;
  url: string;
}

interface CreditGroup {
  title: string;
  entries: CreditEntry[];
}

const CREDITS: CreditGroup[] = [
  {
    title: "3D models",
    entries: [
      {
        label: "Level blocks",
        //
        link: "Prototype Kit (Kenney)",
        url: "https://kenney.nl/assets/prototype-kit",
      },
      {
        label: "UFO",
        link: "Tower Defence Kit (Kenney)",
        url: "https://kenney.nl/assets/tower-defense-kit",
      },
      {
        label: "Astronaut",
        link: "Lowpoly Little Astronaut (Aquamea)",
        url: "https://aquamea.itch.io/little-austronaut",
      },
    ],
  },
  {
    title: "SFX",
    entries: [
      {
        label: "Trigger (click/unclick)",
        link: "UI Audio (Kenney)",
        url: "https://kenney.nl/assets/ui-audio",
      },
      {
        label: "Switch sound",
        link: "Spell 1 (Bart Kelsey)",
        url: "https://opengameart.org/content/spell-1",
      },
      {
        label: "Level complete",
        link: "Jingle_Win_Synth_00 (Little Robot Sound Factory)",
        url: "https://opengameart.org/content/electric-sound-effects-library",
      },
    ],
  },
  {
    title: "Music",
    entries: [
      {
        label: "Selection screen",
        link: "ObservingTheStar (yd)",
        url: "https://opengameart.org/content/another-space-background-track",
      },
      {
        label: "In-game music",
        link: "Space Background Music (BonoboGames)",
        url: "https://opengameart.org/content/space-background-music",
      },
    ],
  },
  {
    title: "UI",

    entries: [
      { label: "Icons", link: "Lucide", url: "https://lucide.dev" },
      {
        label: "Mobile joystick",
        link: "react-joystick-component (elmarti)",
        url: "https://www.npmjs.com/package/react-joystick-component",
      },
    ],
  },
];

export default function AboutModal({ open, onClose }: { open: boolean; onClose: () => any }) {
  if (!open) return null;
  return (
    <Modal onRequestClose={onClose} title="About" className={styles.modal}>
      <h3>Creator: Eli Sherer</h3>
      {CREDITS.map(group => (
        <div key={group.title}>
          <h4>{group.title}</h4>
          <ul>
            {group.entries.map(entry => (
              <li key={entry.label}>
                {entry.label} -{" "}
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  {entry.link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Modal>
  );
}
