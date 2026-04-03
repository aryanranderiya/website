import { useEffect, useState } from "react";

export function useAfterPreloader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Return visit within same session — no preloader, animate immediately
    if (sessionStorage.getItem("preloader_shown")) {
      setReady(true);
      return;
    }
    const handler = () => setReady(true);
    window.addEventListener("preloader:done", handler, { once: true });
    return () => window.removeEventListener("preloader:done", handler);
  }, []);

  return ready;
}
