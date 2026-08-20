import { useCallback, useEffect, useState } from "react";

/* View in fullscreen */
function openFullscreen(elem: any) {
  if (!elem) {
    console.warn("Fullscreen element not found");
    return;
  }
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen(doc: any) {
  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    /* Firefox */
    doc.mozCancelFullScreen();
  } else if (doc.webkitExitFullscreen) {
    /* Chrome, Safari and Opera */
    doc.webkitExitFullscreen();
  } else if (doc.msExitFullscreen) {
    /* IE/Edge */
    doc.msExitFullscreen();
  }
}
const DEFAULT_GET_ELEMENT = () => document.body;

const useFullscreen = (getElement = DEFAULT_GET_ELEMENT): [boolean, () => void] => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = useCallback(() => {
    const element = getElement();
    if (isFullscreen) {
      closeFullscreen(document);
      setIsFullscreen(false);
    } else {
      openFullscreen(element);
      setIsFullscreen(true);
    }
  }, [isFullscreen, getElement]);
  const handleExitFullscreen = useCallback(
    () => isFullscreen && !document.fullscreenElement && setIsFullscreen(false),
    [isFullscreen, setIsFullscreen],
  );
  useEffect(() => {
    document.addEventListener("fullscreenchange", handleExitFullscreen, false);
    return () => document.removeEventListener("fullscreenchange", handleExitFullscreen, false);
  }, [handleExitFullscreen]);

  return [isFullscreen, toggleFullscreen];
};

export default useFullscreen;
