"use client";

import { useEffect, useState } from "react";
import { PanelsTopLeft, ArrowUpRight, X } from "lucide-react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { captureDesk, DESKS_KEY, deskItems, getStoredDesks, openDeskWindows, presets, type SavedDesk } from "@/lib/savedDesks";
import styles from "./SavedDesks.module.css";

export default function SavedDesksApp() {
  const { state, dispatch } = useDesktop();
  const [saved, setSaved] = useState(getStoredDesks);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  const [removed, setRemoved] = useState<SavedDesk | null>(null);
  const openItems = captureDesk(state.windows, window.innerWidth, window.innerHeight);
  const ids = selected ?? openItems.map(w => w.item);
  const available = deskItems.filter(item => !item.hidden || ids.includes(item.id));

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (!event.key || event.key === DESKS_KEY) setSaved(getStoredDesks());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function persist(desks: SavedDesk[]): boolean {
    try {
      localStorage.setItem(DESKS_KEY, JSON.stringify(desks));
      setSaved(desks);
      return true;
    } catch {
      setMessage("This browser could not save the change.");
      return false;
    }
  }

  function saveDesk(event: React.FormEvent) {
    event.preventDefault();
    if (!ids.length || !name.trim()) return;
    const desks = getStoredDesks();
    if ([...presets, ...desks].some(d => d.name.toLowerCase() === name.trim().toLowerCase())) {
      setMessage("A desk already has that name. Choose another name.");
      return;
    }
    const desk = { id: crypto.randomUUID(), name: name.trim(), windows: ids.map(item => openItems.find(w => w.item === item) ?? { item }) };
    if (persist([...desks, desk])) {
      setMessage("Saved " + desk.name + " on this device.");
      setRemoved(null); setName(""); setSelected(null);
    }
  }

  function openDesk(desk: SavedDesk) {
    const windows = openDeskWindows(desk, state.windows, window.innerWidth, window.innerHeight);
    if (windows.length) dispatch({ type: "OPEN_DESK", payload: { windows } });
  }

  return (
    <section aria-label="Saved desks" className={styles.app}>
      <header><PanelsTopLeft size={23} aria-hidden="true" /><h2>Saved Desks</h2></header>
      <p>Open a set of windows together. Opening a desk replaces the current layout.</p>
      <div className={styles.desks}>
        {[...presets, ...saved].map(desk => (
          <div key={desk.id} className={styles.card}>
            <button type="button" onClick={() => openDesk(desk)} aria-label={"Open " + desk.name}>
              <span className={styles.thumbnail} data-kind={desk.id} aria-hidden="true"><i/><i/></span>
              <span className={styles.label}><strong>{desk.name}</strong>
                <small>{desk.windows.slice().reverse().map(w => deskItems.find(item => item.id === w.item)?.name).filter(Boolean).join(" + ")}</small>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            {!presets.includes(desk) && <button type="button" className={styles.remove} aria-label={"Remove " + desk.name} onClick={() => {
              if (persist(getStoredDesks().filter(d => d.id !== desk.id))) { setRemoved(desk); setMessage("Removed " + desk.name + "."); }
            }}><X size={15} /></button>}
          </div>
        ))}
      </div>
      <form onSubmit={saveDesk}>
        <h3>Save a desk</h3>
        <label htmlFor="saved-desk-name">Desk name</label>
        <input id="saved-desk-name" maxLength={60} value={name} onChange={e => setName(e.target.value)} autoComplete="off" placeholder="My desk" />
        <details>
          <summary>Choose windows ({ids.length})</summary>
          <div className={styles.choices}>
            {available.map(item => <label key={item.id}><input type="checkbox" checked={ids.includes(item.id)} onChange={event => {
              setSelected(event.target.checked ? [...ids, item.id] : ids.filter(id => id !== item.id));
            }} />{item.name}</label>)}
          </div>
        </details>
        <button className={styles.save} disabled={!ids.length || !name.trim()}>Save on this device</button>
      </form>
      <div role="status" className={styles.status}>{message} {removed && <button type="button" onClick={() => {
        const desks = getStoredDesks();
        if (persist([...desks.filter(d => d.id !== removed.id), removed])) { setRemoved(null); setMessage("Desk restored."); }
      }}>Undo</button>}</div>
    </section>
  );
}
