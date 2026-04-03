"use client";
import { useEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";

const greetings = [
  "Hello, World",
  "こんにちは、世界",
  "Hola, Mundo",
  "Bonjour, Monde",
  "مرحباً، العالم",
  "नमस्ते, दुनिया",
  "你好，世界",
  "Ciao, Mondo",
  "Olá, Mundo",
  "Привет, Мир",
  "안녕하세요, 세계",
  "Hallo, Welt",
  "Merhaba, Dünya",
  "Hallo, Wereld",
  "Hej, Världen",
  "Γεια σου, Κόσμε",
  "สวัสดี โลก",
  "שלום, עולם",
  "Xin chào, Thế giới",
  "سلام، دنیا",
  "Hello, World",
];

export default function Preloader() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("preloader_shown")) {
      setShow(false);
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i >= greetings.length) {
        clearInterval(timer);
        const overlay = overlayRef.current;
        if (overlay) {
          overlay.style.opacity = "0";
          window.dispatchEvent(new CustomEvent("preloader:done"));
          setTimeout(() => {
            setShow(false);
            sessionStorage.setItem("preloader_shown", "1");
          }, 400);
        }
        return;
      }
      setIndex(i);
    }, 70);

    return () => clearInterval(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "var(--background)",
        transition: "opacity 0.4s cubic-bezier(0.19,1,0.22,1)",
      }}
    >
      <TextMorph
        duration={120}
        ease="cubic-bezier(0.19, 1, 0.22, 1)"
        className="text-[15px] leading-none tracking-[-0.02em] select-none"
        style={{ color: "var(--text-muted)", fontVariationSettings: '"wght" 580' }}
      >
        {greetings[index]}
      </TextMorph>
    </div>
  );
}
