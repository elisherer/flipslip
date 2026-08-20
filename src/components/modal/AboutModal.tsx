import Modal from "./Modal";

export default function AboutModal({ open, onClose }: { open: boolean; onClose: () => any }) {
  if (!open) return null;
  return (
    <Modal onRequestClose={onClose} title="About">
      <h3>Creator: Eli Sherer</h3>
      <h4>3D models</h4>
      <ul>
        <li>
          Prototype Kit -{" "}
          <a href="https://kenney.nl/assets/prototype-kit" target="_blank" rel="noopener noreferrer">
            Kenney
          </a>
        </li>
        <li>
          Tower Defence Kit (UFO) -{" "}
          <a href="https://kenney.nl/assets/tower-defense-kit" target="_blank" rel="noopener noreferrer">
            Kenney
          </a>
        </li>
        <li>
          Character Animations -{" "}
          <a href="https://kaylousberg.itch.io/kaykit-character-animations" target="_blank" rel="noopener noreferrer">
            KayKit (Kay Lousberg)
          </a>
        </li>
      </ul>
      <h4>Audio</h4>
      <ul>
        <li>
          Button (UI Audio; click/unclick) -{" "}
          <a href="https://kenney.nl/assets/ui-audio" target="_blank" rel="noopener noreferrer">
            Kenney
          </a>
        </li>
      </ul>

      <h4>Music</h4>
      <ul>
        <li>
          Selection screen
          <ul>
            <li>
              <a href="https://opengameart.org/content/happy-adventure-loop" target="_blank" rel="noopener noreferrer">
                Happy Adventure (Loop)
              </a>
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          In-game music
          <ul>
            <li>
              <a href="https://opengameart.org/content/green-hills" target="_blank" rel="noopener noreferrer">
                Green Hills
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </Modal>
  );
}
