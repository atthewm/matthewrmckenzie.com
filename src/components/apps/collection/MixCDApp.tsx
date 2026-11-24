"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { appleMusicPlaylists } from "@/config/playlists";
import { mixTracks } from "./mixTracks";
import styles from "./MixCD.module.css";

export default function MixCDApp() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [back, setBack] = useState(false);
  const [index, setIndex] = useState(0);
  const [failedPreview, setFailedPreview] = useState<string | null>(null);
  const track = mixTracks[index];
  const collection = appleMusicPlaylists.find((entry) => entry.id === track.sourceId);
  const number = String(index + 1).padStart(2, "0");
  function playTrack(next: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const preview = mixTracks[next].previewUrl;
    setFailedPreview(null);
    setIndex(next);
    if (audio.src !== preview) audio.src = preview;
    void audio.play().catch((error: Error) => {
      if (error.name !== "AbortError" && audio.src === preview) setFailedPreview(preview);
    });
  }

  return (
    <section className={styles.app} aria-label="Mix CD">
      <div className={styles.desk}>
        <div className={styles.sleeve}>
          <div className={styles.package}>
            <span className={styles.disc} aria-hidden="true"><i /></span>
            {back ? (
              <div className={styles.reverse} aria-label="Back of sleeve">
                <p>Mix CD 01 · Liner notes</p>
                <h2>{track.title}</h2>
                <p className={styles.linerText}>{track.note}</p>
                {collection && <a href={collection.appleMusicUrl} target="_blank" rel="noreferrer">From {collection.title} ↗</a>}
              </div>
            ) : (
              <div className={styles.front} aria-label="Front of sleeve">
                <p>McKenzie OS <span>Mix CD 01</span></p>
                <span className={styles.grooves} aria-hidden="true" />
                <h2>Crossings</h2>
                <span className={styles.imprint}>Five tracks from the music shelf</span>
              </div>
            )}
          </div>
          <button type="button" className={styles.flip} onClick={() => setBack(!back)}>
            <RotateCw size={14} aria-hidden="true" /> {back ? "Show front cover" : "Flip to liner notes"}
          </button>
        </div>
        <div className={styles.trackList}>
          <h3>Track list</h3>
          <ol>{mixTracks.map((entry, i) => (
            <li key={entry.catalogUrl}>
              <button type="button" aria-label={`Play ${entry.title}`} aria-pressed={index === i} onClick={() => playTrack(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span><span>{entry.title}</span>
              </button>
            </li>
          ))}</ol>
        </div>
      </div>
      <article className={styles.panel} aria-label="Track preview">
        <div className={styles.trackHeader}>
          <div><p className={styles.eyebrow}>Track {number} / 05</p><h3>{track.title}</h3><p className={styles.artist}>{track.artist}</p></div>
          <div className={styles.transport}>
            <button type="button" aria-label="Previous track" disabled={index === 0} onClick={() => playTrack(index - 1)}><ChevronLeft size={19} aria-hidden="true" /></button>
            <button type="button" aria-label="Next track" disabled={index === mixTracks.length - 1} onClick={() => playTrack(index + 1)}><ChevronRight size={19} aria-hidden="true" /></button>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={mixTracks[0].previewUrl}
          controls
          controlsList="nodownload"
          preload="metadata"
          aria-label={`Preview ${track.title} by ${track.artist}`}
          onEnded={() => { if (index + 1 < mixTracks.length) playTrack(index + 1); }}
          onError={(event) => setFailedPreview(event.currentTarget.src)}
          onPlaying={() => setFailedPreview(null)}
        />
        {failedPreview === track.previewUrl && <p role="status" className={styles.error}>This preview is unavailable. Open the recording on Apple Music below.</p>}
        <div className={styles.credits}><small>Preview courtesy of Apple Music</small><a href={track.catalogUrl} target="_blank" rel="noreferrer">Listen on Apple Music ↗</a></div>
      </article>
    </section>
  );
}
