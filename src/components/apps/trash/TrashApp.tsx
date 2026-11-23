"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import styles from "./TrashApp.module.css";

const notes = [
  ["Flour", "60 g rye, 65 g all-purpose. Same total flour as the last batch."],
  ["Sugar", "150 g cane sugar, down from 180 g. Keep the honey at 170 g."],
  ["Mix", "Leave the mixer in the cupboard. Whisk in the eggs by hand, one at a time."],
] as const;

const noteText = "Brownie trials / Batch 04\n\n" + notes.map(([label, body]) => label + "\n" + body).join("\n\n") + "\n";
const files = [
  { id: "picture", name: "Last Light.png", kind: "PNG image", title: "Last light on Congress", url: "/trash/last-light.png" },
  { id: "sound", name: "Startup 02.wav", kind: "WAVE audio", title: "Startup chime, take 02", url: "/trash/startup-take-02.wav" },
  { id: "note", name: "Brownie Notes.txt", kind: "Plain text", title: "Brownie trials, batch 04", url: "data:text/plain;charset=utf-8," + encodeURIComponent(noteText) },
] as const;

type FileId = typeof files[number]["id"];

function FileIcon({ id }: { id: FileId }) {
  if (id === "picture") {
    return <span className={styles.slideIcon}><Image src="/trash/last-light.png" width={160} height={100} unoptimized alt="" /></span>;
  }
  if (id === "sound") {
    return <Image className={styles.soundIcon} src="/icons/panther/itunes-3.png" width={45} height={45} unoptimized alt="" />;
  }
  return <span className={styles.paperIcon}><span>Aa</span></span>;
}

export default function TrashApp() {
  const [selected, setSelected] = useState<typeof files[number]>(files[0]);
  const headingId = useId();
  return (
    <section className={styles.finder} aria-label="Contents of Trash">
      <div className={styles.files} role="group" aria-label="Files in Trash">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            aria-label={file.name}
            aria-pressed={selected.id === file.id}
            className={styles.file}
            onClick={() => setSelected(file)}
          >
            <span className={styles.iconBox}><FileIcon id={file.id} /></span>
            <span className={styles.filename}>{file.name}</span>
          </button>
        ))}
      </div>

      <article className={styles.preview} aria-labelledby={headingId}>
        <div className={styles.previewHeader}>
          <div>
            <p className={styles.kind}>{selected.kind}</p>
            <h2 id={headingId} className={styles.title}>{selected.title}</h2>
          </div>
          <a className={styles.save} href={selected.url} download={selected.name} aria-label={'Save a copy of ' + selected.name}>
            <Download size={14} aria-hidden="true" /> Save a copy
          </a>
        </div>
        {selected.id === "picture" && (
          <figure className={styles.figure}>
            <div className={styles.mount}>
              <Image className={styles.picture} src={selected.url} width={160} height={100} unoptimized alt="Pixel art of bats taking flight above Congress Avenue Bridge, with the Austin skyline in the evening light." />
            </div>
            <figcaption>Congress Avenue Bridge <span aria-hidden="true">·</span> Austin, Texas</figcaption>
          </figure>
        )}
        {selected.id === "sound" && (
          <div className={styles.audioPanel}>
            <div className={styles.audioScreen}>
              <span>System sound</span>
              <Image src="/trash/startup-wave.png" width={480} height={76} unoptimized alt="" className={styles.wave} />
              <span>Take 02 <i>Mono</i></span>
            </div>
            <audio controls preload="metadata" src={selected.url} aria-label="Play startup chime, take 02" />
          </div>
        )}
        {selected.id === "note" && (
          <div className={styles.note}>
            <dl>{notes.map(([label, body]) => <div key={label}><dt>{label}</dt><dd>{body}</dd></div>)}</dl>
            <Link href="/recipes/brownies-v4">Open the full recipe <span aria-hidden="true">↗</span></Link>
          </div>
        )}
      </article>
      <div className={styles.status}>3 items</div>
    </section>
  );
}
