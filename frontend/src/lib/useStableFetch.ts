import { useEffect, useRef } from "react";

export function useStableFetch(fn: () => void, deps: React.DependencyList) {
  const fetched = useRef(false);
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fn();
  }, deps);
}
