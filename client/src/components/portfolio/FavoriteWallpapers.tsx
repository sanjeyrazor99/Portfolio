import { ArrowDown, ArrowUp, Maximize2, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { favoriteAnime, favoriteMovies, favoritePlayers, favoriteTvShows } from "@/data/content";

type Favorite = {
  title: string;
  poster: string;
  wallpaper?: string;
  accent: string;
  note?: string;
  source?: string;
  credit?: string;
  moment?: string;
  position?: string;
};

export default function FavoriteWallpapers({ kind, title, icon: Icon }: {
  kind: "movies" | "soccer" | "tv" | "anime";
  title: string;
  icon: LucideIcon;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const slides = useRef<HTMLDivElement>(null);
  const label = useId();
  const [index, setIndex] = useState(0);
  const favorites: readonly Favorite[] = {
    movies: favoriteMovies, soccer: favoritePlayers, tv: favoriteTvShows, anime: favoriteAnime,
  }[kind];
  const folder = { movies: "movie-posters", soccer: "player-wallpapers", tv: "series-posters", anime: "series-posters" }[kind];
  const posterUrl = (filename: string) => `${import.meta.env?.BASE_URL ?? "/"}${folder}/${filename}`;

  function cancelHover() {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = undefined;
  }

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  function moveTo(next: number, behavior: ScrollBehavior) {
    const track = slides.current;
    if (!track || next < 0 || next >= favorites.length) return;
    track.scrollTo({ top: next * track.clientHeight, behavior });
    setIndex(next);
  }

  function openEntry(next: number) {
    cancelHover();
    if (!dialog.current || dialog.current.open) return;
    dialog.current.showModal();
    moveTo(next, "instant");
    slides.current?.focus({ preventScroll: true });
  }

  return (
    <li data-interest={kind} data-reveal className="personality-gallery-tile"
      onPointerMove={event => {
        if (event.pointerType !== "mouse" || hoverTimer.current !== undefined || dialog.current?.open) return;
        hoverTimer.current = window.setTimeout(() => openEntry(0), 320);
      }}
      onPointerLeave={cancelHover}>
      <h3>
        <button className="personality-gallery-trigger" type="button" aria-haspopup="dialog" onClick={() => openEntry(0)}>
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
          <span>{title}</span>
          <Maximize2 size={16} aria-hidden="true" />
        </button>
      </h3>
      <ol className="movie-favorites" aria-label={`Favorite ${title.toLowerCase()}`}>
        {favorites.map((entry, rank) => (
          <li key={entry.title}>
            <button type="button" onClick={() => openEntry(rank)} aria-label={`Open ${entry.title}, rank ${rank + 1}`}>
              <img src={posterUrl(entry.poster)} alt="" loading="lazy" />
              <span className="personality-rank" aria-hidden="true">{rank + 1}</span>
              <strong>{entry.title}{entry.note && <small>{entry.note}</small>}</strong>
              <Maximize2 size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <dialog ref={dialog} className="movie-screen wallpaper-gallery" aria-labelledby={label}
        onKeyDown={event => {
          const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1
            : event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : 0;
          if (!direction) return;
          event.preventDefault();
          moveTo(index + direction, matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth");
        }}>
        <h2 id={label} className="sr-only">{title}</h2>
        <div ref={slides} className="wallpaper-track" tabIndex={0} aria-label="Scroll through rankings"
          onScroll={event => {
            const track = event.currentTarget;
            if (track.clientHeight) setIndex(Math.round(track.scrollTop / track.clientHeight));
          }}>
          {favorites.map((entry, rank) => (
            <section key={entry.title} className="movie-screen-frame" data-current={rank === index} data-gallery={kind}
              style={{
                "--movie-poster": `url("${posterUrl(entry.wallpaper ?? entry.poster)}")`,
                "--movie-light": entry.accent,
                "--wallpaper-position": entry.position ?? "center 32%",
              } as CSSProperties}>
              <div className="movie-screen-spotlight" aria-hidden="true" />
              <div className="movie-screen-copy">
                <span className="movie-screen-rank" aria-label={`Rank ${rank + 1}`}>{rank + 1}</span>
                <h3>{entry.title}</h3>
                {entry.note && <p>{entry.note}</p>}
                {entry.moment && <p className="wallpaper-moment">{entry.moment}</p>}
              </div>
              {entry.source && (
                <div className="wallpaper-credit">
                  <a href={entry.source} target="_blank" rel="noreferrer">{entry.credit}</a>
                </div>
              )}
            </section>
          ))}
        </div>
        <button className="movie-screen-close" type="button" onClick={() => dialog.current?.close()} aria-label="Close gallery">
          <X size={23} aria-hidden="true" />
        </button>
        <div className="movie-screen-navigation" aria-label="Browse rankings">
          <button type="button" onClick={() => moveTo(index - 1, "auto")} disabled={index === 0} aria-label="Previous ranking"><ArrowUp size={22} /></button>
          <span>{index + 1} / {favorites.length}</span>
          <button type="button" onClick={() => moveTo(index + 1, "auto")} disabled={index === favorites.length - 1} aria-label="Next ranking"><ArrowDown size={22} /></button>
        </div>
      </dialog>
    </li>
  );
}
