import { useCallback, useState } from "react";

export type Toggler = {
  handleSet: () => void;
  handleUnset: () => void;
  handleToggle: () => void;
  current: boolean;
};

const useToggle = (defaultOpen?: boolean): Toggler => {
  const [current, setCurrent] = useState(Boolean(defaultOpen));

  const handleUnset = useCallback(() => {
      setCurrent(false);
    }, []),
    handleSet = useCallback(() => {
      setCurrent(true);
    }, []),
    handleToggle = useCallback(() => {
      setCurrent(prevOpen => !prevOpen);
    }, []);

  return {
    current,
    handleUnset,
    handleSet,
    handleToggle,
  };
};

export default useToggle;
