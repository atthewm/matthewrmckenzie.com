"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "mmck-secrets-revealed";

export function useSecrets() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const reveal = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setRevealed(true);
  }, []);

  return { revealed, reveal };
}
