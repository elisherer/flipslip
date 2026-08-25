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
        link: "Kenney (Prototype Kit)",
        url: "https://kenney.nl/assets/prototype-kit",
      },
      {
        label: "UFO",
        link: "Kenney (Tower Defence Kit)",
        url: "https://kenney.nl/assets/tower-defense-kit",
      },
      {
        label: "Astronaut",
        link: "Aquamea (Lowpoly Little Astronaut)",
        url: "https://aquamea.itch.io/little-austronaut",
      },
    ],
  },
  {
    title: "Audio",
    entries: [
      {
        label: "Trigger (click/unclick)",
        link: "Kenney (UI Audio; Button)",
        url: "https://kenney.nl/assets/ui-audio",
      },
      {
        label: "Level complete",
        link: "Spell 1",
        url: "https://opengameart.org/content/spell-1",
      },
    ],
  },
  {
    title: "Music",
    entries: [
      {
        label: "Selection screen",
        link: "yd (ObservingTheStar)",
        url: "https://opengameart.org/content/another-space-background-track",
      },
      {
        label: "In-game music",
        link: "BonoboGames (Space Background Music)",
        url: "https://opengameart.org/content/space-background-music",
      },
    ],
  },
  {
    title: "UI",

    entries: [{ label: "Icons", link: "MUI (Material UI)", url: "https://mui.com/material-ui/material-icons/" }],
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
