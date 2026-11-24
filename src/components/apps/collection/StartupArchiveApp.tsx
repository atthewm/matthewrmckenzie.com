"use client";

import { useState } from "react";
import Image from "next/image";
import { Disc3, HardDrive, ChevronUp, Maximize2 } from "lucide-react";
import styles from "./StartupArchive.module.css";

const disks = [
  {
    name: "First desktop", date: "February 11, 2026", shortDate: "11 FEB 26",
    image: "first-desktop.webp", revision: "29738f277f6e8bada047f430e92295d51bbfdf83",
    alt: "An indigo desktop with colorful square icons arranged down the left edge.",
    notes: "The first edition put About, Work, Writing and the media players on an indigo desktop. App icons lined up on the left. Settings opened in its own window.",
  },
  {
    name: "Chapter edition", date: "November 12, 2026", shortDate: "12 NOV 26",
    image: "chapter-edition.webp", revision: "1f5b69da83d5d4728936acea3f0f40b712e80c82",
    alt: "A cream reading page with Matthew McKenzie in large serif type above links to Capital, Training and Kitchen.",
    notes: "This edition opened on a reading page. Its three chapters covered Capital, Training and Kitchen. A link at the foot of the page still opened the desktop.",
  },
  {
    name: "Panther desktop", date: "November 22, 2026", shortDate: "22 NOV 26",
    image: "panther-desktop.webp", revision: "5d7e55541525393d18301a40ba9e85f4395c3592",
    alt: "A blue desktop with illustrated app icons along the right edge and a translucent Dock below.",
    notes: "The desktop returned to the front door. The Dock held the main apps, while Recipes, Health, games and other shortcuts occupied two columns on the right.",
  },
] as const;

export default function StartupArchiveApp() {
  const [mounted, setMounted] = useState<number | null>(0);
  const disk = mounted === null ? null : disks[mounted];
  return (
    <section className={styles.archive} aria-label="Startup Disk Archive">
      <header className={styles.heading}>
        <HardDrive size={28} aria-hidden="true" />
        <div><h2>Startup Disk Archive</h2><p>Three editions of Matthew’s website</p></div>
      </header>
      <div className={styles.rack} role="group" aria-label="Mount a disk">
        {disks.map((entry, index) => (
          <button type="button" key={entry.image} aria-label={`Mount ${entry.name}`} aria-pressed={mounted === index} onClick={() => setMounted(index)}>
            <Disc3 size={22} aria-hidden="true" />
            <span><b>{entry.name}</b><small>{entry.shortDate}</small></span>
          </button>
        ))}
      </div>
      {disk ? (
        <article className={styles.record} aria-label={`Mounted disk: ${disk.name}`}>
          <div className={styles.recordHead}>
            <div><time>{disk.date}</time><h3>{disk.name}</h3></div>
            <button className={styles.eject} type="button" onClick={() => setMounted(null)}><ChevronUp size={15} aria-hidden="true" /> Eject</button>
          </div>
          <figure className={styles.slide}>
            <a href={`/startup-archive/${disk.image}`} target="_blank" rel="noreferrer" aria-label={`View full screenshot of ${disk.name}`}>
              <Image unoptimized src={`/startup-archive/${disk.image}`} width={960} height={600} alt={disk.alt} />
            </a>
            <figcaption><span>Home screen</span><a href={`/startup-archive/${disk.image}`} target="_blank" rel="noreferrer"><Maximize2 size={12} aria-hidden="true" /> Full size</a></figcaption>
          </figure>
          <p>{disk.notes}</p>
          <a className={styles.source} href={`https://github.com/atthewm/matthewrmckenzie.com/commit/${disk.revision}`} target="_blank" rel="noreferrer">Source revision {disk.revision.slice(0,7)}</a>
        </article>
      ) : (
        <div className={styles.empty} role="status"><HardDrive size={36} aria-hidden="true" /><h3>Disk ejected</h3><p>Choose a disk above to view its home screen.</p></div>
      )}
    </section>
  );
}
