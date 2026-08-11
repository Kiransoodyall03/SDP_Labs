"use client";

import { useEffect, useState } from "react";

const GIFS = [
  "/scare/scare1.gif",
  "/scare/scare2.gif",
  "/scare/scare3.gif",
  "/scare/scare4.gif",
  "/scare/scare5.gif",
];

const AUDIO = "/scare/scare_audio.mp3";

const EVERY_MS = 60_000;
const SHOWN_FOR_MS = 2_500;

/**
 * Fires a jump scare once a minute: one of five gifs full-screen with the audio
 * over it, then gone. Nothing to do with the todo list — see the README.
 *
 * A client component because it needs a timer, the browser's audio and a random
 * pick, none of which exist on the server. The gif is chosen when the timer
 * fires rather than during render, so there is nothing for the server and the
 * client to disagree about on hydration.
 */
export function JumpScare() {
  const [gif, setGif] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio(AUDIO);

    const timer = setInterval(() => {
      setGif(GIFS[Math.floor(Math.random() * GIFS.length)]);

      audio.currentTime = 0;
      // Browsers refuse to play audio until the page has been interacted with;
      // silence is better than an unhandled rejection in the console.
      void audio.play().catch(() => {});

      setTimeout(() => setGif(null), SHOWN_FOR_MS);
    }, EVERY_MS);

    return () => {
      clearInterval(timer);
      audio.pause();
    };
  }, []);

  if (!gif) return null;

  return (
    <div
      // Not announced to screen readers, and it never swallows a click on the
      // form underneath.
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- animated gif, no next/image optimisation wanted */}
      <img src={gif} alt="" className="max-h-full max-w-full object-contain" />
    </div>
  );
}
