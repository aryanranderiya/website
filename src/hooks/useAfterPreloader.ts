import { useEffect, useState } from "react";

function isPreloaderDone() {
  try {
    return !!sessionStorage.getItem("preloader_shown");
  } catch {
    return false;
  }
}

export function useAfterPreloader() {
  const [ready, setReady] = useState(isPreloaderDone);

  useEffect(() => {
    if (ready) return;
    const handler = () => setReady(true);
    window.addEventListener("preloader:done", handler, { once: true });
    return () => window.removeEventListener("preloader:done", handler);
  }, [ready]);

  return ready;
}
