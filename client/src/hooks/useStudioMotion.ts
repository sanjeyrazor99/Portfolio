import { useEffect, type RefObject } from "react";

export function useStudioMotion(rootRef: RefObject<HTMLDivElement | null>, onActiveProject: (id: string) => void, onChapterChange: (id: string) => void) {
  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.querySelector<HTMLElement>(".studio-hero");
    if (!root || !hero) return;

    const chapters = Array.from(root.querySelectorAll<HTMLElement>("#main > .studio-section"));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previewMotion = import.meta.env.DEV && new URLSearchParams(location.search).get("motion") === "on";
    const motionEnabled = () => previewMotion || !preference.matches;
    const tileSelector = ".studio-project, .studio-role-panel, .studio-workflow, .studio-skill-grid > div, .studio-education > div, .portfolio-chat";
    let tile: HTMLElement | null = null;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;

    function clearTile() {
      tile?.removeAttribute("data-studio-lit");
      tile = null;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
    }

    function lightTile(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !motionEnabled()) return;
      const next = event.target instanceof Element ? event.target.closest<HTMLElement>(tileSelector) : null;
      if (tile !== next) {
        clearTile();
        tile = next;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!tile || pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!tile) return;
        const rect = tile.getBoundingClientRect();
        tile.style.setProperty("--tile-light-x", (pointerX - rect.left) + "px");
        tile.style.setProperty("--tile-light-y", (pointerY - rect.top) + "px");
        tile.setAttribute("data-studio-lit", "");
      });
    }
    let reveal: IntersectionObserver | undefined;

    let projects: MutationObserver | undefined;
    let projectCards = Array.from(root.querySelectorAll<HTMLElement>(".studio-project"));
    let activeProject = "";
    let currentChapter = "home";
    const about = root.querySelector("#about");

    function draw() {
      frame = 0;
      if (!root || !hero) return;
      const viewport = window.innerHeight;
      const scroll = Math.max(0, window.scrollY);
      const range = document.documentElement.scrollHeight - viewport;
      const progress = range > 0 ? Math.min(1, scroll / range) : 0;
      root.style.setProperty("--studio-progress", String(progress));
      let closest = "";
      let distance = Infinity;
      for (const card of projectCards) {
        const bounds = card.getBoundingClientRect();
        const figure = card.querySelector<HTMLElement>(".studio-project-figure");
        if (!figure) continue;
        const center = bounds.top + figure.offsetHeight / 2;
        const offset = (center - viewport * .48) / (viewport * .6);
        if (motionEnabled()) card.style.setProperty("--project-offset", String(Math.max(-1, Math.min(1, offset))));
        if (Math.abs(offset) < distance) {
          distance = Math.abs(offset);
          closest = card.id.slice("project-".length);
        }
      }
      if (closest !== activeProject) {
        activeProject = closest;
        onActiveProject(closest);
      }
      const motion = motionEnabled();
      const scenes = chapters.map(chapter => ({ chapter, bounds: chapter.getBoundingClientRect() }));
      let nextChapter = about && about.getBoundingClientRect().top <= 1 ? "about" : "home";
      for (const { chapter, bounds } of scenes) {
        if (bounds.top <= viewport * .38) nextChapter = chapter.id;
      }
      if (currentChapter !== nextChapter) {
        currentChapter = nextChapter;
        onChapterChange(nextChapter);
      }
      if (!motion) return;

      const first = scenes[0]?.bounds.top ?? viewport;
      root.style.setProperty("--cover-exit", String(1 - Math.max(0, Math.min(1, first / viewport))));
      for (const { chapter, bounds } of scenes) {
        const top = bounds.top;
        const entry = Math.max(0, Math.min(1, (viewport - top) / (viewport * .82)));
        const depth = 1 - entry * entry * (3 - 2 * entry);
        chapter.style.setProperty("--chapter-depth", String(depth));
        const exit = 1 - Math.max(0, Math.min(1, bounds.bottom / (viewport * .62)));
        chapter.style.setProperty("--scene-exit", String(exit));
      }

    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function stopReveals() {
      reveal?.disconnect();
      projects?.disconnect();
      root?.querySelectorAll("[data-studio-enter]").forEach(element => {
        element.removeAttribute("data-studio-enter");
      });
    }

    function setMotion() {
      clearTile();
      stopReveals();
      schedule();
      if (!root) return;
      root.toggleAttribute("data-studio-motion", motionEnabled());
      if (typeof IntersectionObserver === "undefined") return;

      reveal = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-studio-enter", "ready");
          reveal?.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -2% 0px" });

      function register(elements: Iterable<Element>) {
        if (!motionEnabled()) return;
        for (const element of elements) {
          if (element.hasAttribute("data-studio-enter")) continue;
          if (element.getBoundingClientRect().top < window.innerHeight) continue;
          element.setAttribute("data-studio-enter", "waiting");
          reveal?.observe(element);
        }
      }

      register(root.querySelectorAll("[data-reveal]"));
      const projectGrid = root.querySelector(".studio-projects");
      if (projectGrid && typeof MutationObserver !== "undefined") {
        projects = new MutationObserver(records => {
          for (const record of records) {
            for (const node of record.removedNodes) {
              if (node instanceof Element) reveal?.unobserve(node);
            }
            projectCards = Array.from(projectGrid.querySelectorAll<HTMLElement>(".studio-project"));
          register(projectCards);
          }
          schedule();
        });
        projects.observe(projectGrid, { childList: true });
      }
    }

    setMotion();
    root.addEventListener("pointermove", lightTile, { passive: true });
    root.addEventListener("pointerleave", clearTile);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", setMotion);
    const size = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule);
    size?.observe(root);
    return () => {
      stopReveals();
      clearTile();
      root.removeEventListener("pointermove", lightTile);
      root.removeEventListener("pointerleave", clearTile);
      root.removeAttribute("data-studio-motion");
      size?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", setMotion);
    };
  }, [rootRef, onActiveProject, onChapterChange]);
}
