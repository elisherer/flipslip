import { useEffect, useState } from "react";

export const isAudioLocked = () => {
  return new Promise(resolve => {
    const checkHTML5Audio = async () => {
      const audio = new Audio();
      try {
        await audio.play();
        resolve(false);
      } catch (err) {
        console.error(err);
        resolve(true);
      }
    };
    try {
      const context = new AudioContext();
      resolve(context.state === "suspended");
    } catch (e) {
      console.error(e);
      return checkHTML5Audio();
    }
  });
};

const userGestureEvents = [
  "click",
  "contextmenu",
  "auxclick",
  "dblclick",
  "mousedown",
  "mouseup",
  "pointerup",
  "touchend",
  "keydown",
  "keyup",
];

export default function useAudioLockStatus() {
  const [locked, setLocked] = useState(true);
  useEffect(() => {
    isAudioLocked().then(locked => {
      if (!locked) {
        setLocked(false);
        return;
      }
      // audio is locked
      const unlockAudio = () => {
        setLocked(false);
        userGestureEvents.forEach(eventName => {
          document.removeEventListener(eventName, unlockAudio);
        });
      };
      // set events for unlocking
      userGestureEvents.forEach(eventName => {
        document.addEventListener(eventName, unlockAudio);
      });
    });
  }, []);
  return locked;
}
