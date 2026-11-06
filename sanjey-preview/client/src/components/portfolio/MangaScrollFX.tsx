import { useEffect } from "react";

type MangaScrollFXProps = { enabled: boolean };

/** Client-only GSAP camera, manga panels, rails and one shared 90 BPM pulse clock. */
export default function MangaScrollFX({ enabled }: MangaScrollFXProps) {
  useEffect(() => {
    if (
      !enabled ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    )
      return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let clockFrame = 0;
    const root = document.documentElement;
    const originalVars = new Map<string, string>();
    const rememberVariable = (name: string) => {
      if (!originalVars.has(name))
        originalVars.set(name, root.style.getPropertyValue(name));
    };
    const pulseTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          ".skill-node",
          ".project-card",
          ".stat",
          ".nav a",
          ".btn",
          ".section-index",
          ".punch-button",
          ".hero-speech",
          ".custom-cursor",
          ".read-switch",
          ".lite-switch",
          ".mode-switch",
          ".earth-prompt",
          ".clash-trigger",
          ".hero-character-hitbox",
          ".sound-toggle",
        ].join(",")
      )
    );
    const oldPulseStyles = new Map<
      HTMLElement,
      { scale: string; ring: string; delay: string }
    >();
    pulseTargets.forEach((target, index) => {
      oldPulseStyles.set(target, {
        scale: target.style.getPropertyValue("--manga-pulse-scale"),
        ring: target.style.getPropertyValue("--manga-ripple-opacity"),
        delay: target.style.getPropertyValue("--beat-delay"),
      });
      target.style.setProperty("--beat-delay", `${-(index % 12) * 0.055}s`);
    });
    const restorePulses = () =>
      oldPulseStyles.forEach((old, target) => {
        if (old.scale)
          target.style.setProperty("--manga-pulse-scale", old.scale);
        else target.style.removeProperty("--manga-pulse-scale");
        if (old.ring)
          target.style.setProperty("--manga-ripple-opacity", old.ring);
        else target.style.removeProperty("--manga-ripple-opacity");
        if (old.delay) target.style.setProperty("--beat-delay", old.delay);
        else target.style.removeProperty("--beat-delay");
      });

    // Beat is sampled globally and assigned per widget with an index-based phase offset.
    const beatMs = 60_000 / 90;
    const clockStart = performance.now();
    rememberVariable("--manga-phase");
    rememberVariable("--manga-stagger");
    const tickClock = (now: number) => {
      if (cancelled) return;
      const phase = ((now - clockStart) / beatMs) % 1;
      root.style.setProperty("--manga-phase", phase.toFixed(4));
      root.style.setProperty("--manga-stagger", (phase * 0.18).toFixed(4));
      const velocity = Math.min(
        1,
        Math.abs(Number(root.style.getPropertyValue("--manga-velocity")) || 0)
      );
      pulseTargets.forEach((target, index) => {
        const local = ((now - clockStart) / beatMs + (index % 12) / 12) % 1;
        const beat = (1 - Math.cos(local * Math.PI * 2)) / 2;
        target.style.setProperty(
          "--manga-pulse-scale",
          (1 + beat * (0.06 + velocity * 0.015)).toFixed(3)
        );
        target.style.setProperty(
          "--manga-ripple-opacity",
          (beat * (0.45 + velocity * 0.25)).toFixed(3)
        );
      });
      clockFrame = window.requestAnimationFrame(tickClock);
    };
    clockFrame = window.requestAnimationFrame(tickClock);

    void (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          const setDocVar = (name: string, value: string) => {
            rememberVariable(name);
            root.style.setProperty(name, value);
          };
          const updateVelocity = (self: { getVelocity: () => number }) => {
            const velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 1300);
            setDocVar("--manga-velocity", velocity.toFixed(4));
            setDocVar(
              "--manga-skew",
              `${gsap.utils.clamp(-1.5, 1.5, velocity * 1.5)}deg`
            );
            setDocVar(
              "--manga-speed-opacity",
              (Math.abs(velocity) * 0.18).toFixed(4)
            );
            setDocVar(
              "--manga-background-x",
              `${(velocity * 16).toFixed(2)}px`
            );
            setDocVar(
              "--manga-cape-angle",
              `${(velocity * 3.6).toFixed(2)}deg`
            );
            setDocVar(
              "--manga-garou-angle",
              `${(velocity * 2.8).toFixed(2)}deg`
            );
            setDocVar("--manga-garou-flow", `${(velocity * 8).toFixed(2)}px`);
          };
          // One document-wide velocity reader keeps print texture, speed lines and the beat in sync.
          ScrollTrigger.create({
            start: 0,
            end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
            onUpdate: updateVelocity,
            onRefresh: updateVelocity,
            onLeaveBack: () => {
              setDocVar("--manga-velocity", "0");
              setDocVar("--manga-skew", "0deg");
              setDocVar("--manga-speed-opacity", "0");
              setDocVar("--manga-speed-scale", "1");
              setDocVar("--manga-cape-angle", "0deg");
              setDocVar("--manga-garou-angle", "0deg");
              setDocVar("--manga-garou-flow", "0px");
            },
          });

          const whiteFlash = document.querySelector<HTMLElement>(
            ".chapter-flash--white"
          );
          const blackFlash = document.querySelector<HTMLElement>(
            ".chapter-flash--black"
          );
          const darkPanels =
            gsap.utils.toArray<HTMLElement>("[data-manga-dark]");
          darkPanels.forEach(panel => {
            if (!whiteFlash || !blackFlash) return;
            const transition = gsap.timeline({
              scrollTrigger: {
                trigger: panel,
                start: "top 88%",
                end: "top 58%",
                scrub: 0.35,
              },
            });
            transition
              .fromTo(
                whiteFlash,
                { autoAlpha: 0 },
                { autoAlpha: 0.92, duration: 0.035 }
              )
              .to(whiteFlash, { autoAlpha: 0, duration: 0.07 })
              .fromTo(
                blackFlash,
                { autoAlpha: 0 },
                { autoAlpha: 0.96, duration: 0.035 }
              )
              .to(blackFlash, { autoAlpha: 0, duration: 0.17 });
          });

          const wirePanels = (mobile: boolean) => {
            gsap.utils
              .toArray<HTMLElement>("[data-manga-panel]")
              .forEach((panel, index) => {
                const direction = (
                  panel.dataset.mangaWipe ||
                  ["left", "right", "top", "bottom"][index % 4]
                ).toLowerCase();
                const clipping =
                  direction === "top" || direction === "bottom"
                    ? {
                        clipPath:
                          direction === "top"
                            ? "inset(0 0 100% 0)"
                            : "inset(100% 0 0 0)",
                      }
                    : {
                        clipPath:
                          direction === "right"
                            ? "inset(0 0 0 100%)"
                            : "inset(0 100% 0 0)",
                      };
                gsap.fromTo(
                  panel,
                  {
                    ...clipping,
                    rotate: index % 2 ? 1.7 : -1.7,
                    y: mobile ? 18 : 10,
                    scale: mobile ? 0.99 : 0.985,
                  },
                  {
                    clipPath: "inset(0% 0% 0% 0%)",
                    rotate: 0,
                    y: 0,
                    scale: 1,
                    ease: "back.out(1.5)",
                    scrollTrigger: {
                      trigger: panel,
                      start: mobile ? "top 96%" : "top 88%",
                      end: mobile ? "top 62%" : "top 38%",
                      scrub: 0.65,
                      invalidateOnRefresh: true,
                    },
                  }
                );
              });

            gsap.utils
              .toArray<HTMLElement>(".section-index[data-manga-onomatopoeia]")
              .forEach(card => {
                gsap.fromTo(
                  card,
                  { scale: 2.6, rotate: -10, autoAlpha: 0, y: 30 },
                  {
                    scale: 1,
                    rotate: 0,
                    autoAlpha: 1,
                    y: 0,
                    ease: "back.out(2.2)",
                    scrollTrigger: {
                      trigger: card,
                      start: "top 96%",
                      end: "top 64%",
                      scrub: 0.5,
                    },
                  }
                );
              });

            // Foreground copy, screen-tone and cutout characters travel at distinct depths.
            gsap.utils
              .toArray<HTMLElement>(
                ".about-copy, .about-character-breakout, #skills .section-heading, .constellation, .hunter-scene, .experience-character, .timeline-rank, .project-art, .creative-copy, .clash-figures"
              )
              .forEach((layer, index) => {
                const parent =
                  layer.closest<HTMLElement>("[data-manga-chapter]") || layer;
                const depth = index % 3 === 0 ? 34 : index % 3 === 1 ? -22 : 14;
                gsap.fromTo(
                  layer,
                  { y: depth },
                  {
                    y: -depth * 0.28,
                    ease: "none",
                    scrollTrigger: {
                      trigger: parent,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 0.45,
                      invalidateOnRefresh: true,
                    },
                  }
                );
              });
          };

          ScrollTrigger.matchMedia({
            "(min-width: 900px)": () => {
              const home = document.querySelector<HTMLElement>("#home");
              if (home) {
                const earth = home.querySelector<HTMLElement>(
                  "[data-manga-earth], .hero-earth"
                );
                const figure = home.querySelector<HTMLElement>(
                  ".hero-character-turn"
                );
                const letters =
                  home.querySelectorAll<HTMLElement>(".hero-name-letter");
                const warp = home.querySelector<HTMLElement>(
                  "[data-manga-warp], .earth-warp-lines"
                );
                const flash = home.querySelector<HTMLElement>(
                  "[data-manga-flash], .impact-flash"
                );
                const shakeLayers = home.querySelectorAll<HTMLElement>(
                  ".hero-content, .hero-scene"
                );
                const heroTimeline = gsap.timeline({
                  scrollTrigger: {
                    trigger: home,
                    start: "top top",
                    end: () => `+=${Math.round(window.innerHeight * 1.5)}`,
                    pin: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: self => {
                      const velocity = gsap.utils.clamp(
                        -1,
                        1,
                        self.getVelocity() / 1200
                      );
                      setDocVar("--manga-progress", self.progress.toFixed(4));
                      setDocVar("--manga-velocity", velocity.toFixed(4));
                      setDocVar(
                        "--manga-skew",
                        `${gsap.utils.clamp(-1.5, 1.5, velocity * 1.5)}deg`
                      );
                      setDocVar(
                        "--manga-speed-opacity",
                        (Math.abs(velocity) * 0.18).toFixed(4)
                      );
                      setDocVar(
                        "--manga-speed-scale",
                        (1 + Math.abs(velocity) * 0.42).toFixed(3)
                      );
                      setDocVar(
                        "--manga-cape-angle",
                        `${(velocity * 3.6).toFixed(2)}deg`
                      );
                      setDocVar(
                        "--manga-garou-angle",
                        `${(velocity * 2.8).toFixed(2)}deg`
                      );
                      setDocVar(
                        "--manga-garou-flow",
                        `${(velocity * 8).toFixed(2)}px`
                      );
                    },
                    onLeave: () => setDocVar("--manga-skew", "0deg"),
                    onEnterBack: () => setDocVar("--manga-skew", "0deg"),
                  },
                });
                // A genuine Three.js camera dolly is synchronized with this 1.5-screen orbit pin.
                if (earth)
                  heroTimeline.to(
                    earth,
                    { scale: 1.12, xPercent: 4, yPercent: -2, ease: "none" },
                    0
                  );
                if (figure)
                  heroTimeline.to(
                    figure,
                    { rotateY: 180, transformPerspective: 900, ease: "none" },
                    0
                  );
                if (warp)
                  heroTimeline.fromTo(
                    warp,
                    { autoAlpha: 0, scale: 0.65 },
                    { autoAlpha: 1, scale: 1.2, ease: "power2.in" },
                    0.08
                  );
                if (letters.length)
                  heroTimeline.fromTo(
                    letters,
                    { yPercent: 20, scale: 0.8, rotate: -4 },
                    {
                      yPercent: -28,
                      scale: 1.12,
                      rotate: 0,
                      stagger: 0.035,
                      ease: "back.in(1.8)",
                    },
                    0.25
                  );
                if (flash)
                  heroTimeline.fromTo(
                    flash,
                    { autoAlpha: 0 },
                    {
                      autoAlpha: 0.9,
                      duration: 0.035,
                      yoyo: true,
                      repeat: 1,
                      ease: "steps(1)",
                    },
                    0.58
                  );
                shakeLayers.forEach((layer, index) =>
                  heroTimeline.fromTo(
                    layer,
                    { x: 0, y: 0 },
                    {
                      x: index ? -4 : 4,
                      y: -2,
                      duration: 0.028,
                      yoyo: true,
                      repeat: 5,
                      ease: "steps(1)",
                    },
                    0.58
                  )
                );
                heroTimeline.eventCallback("onReverseComplete", () => {
                  setDocVar("--manga-progress", "0");
                  setDocVar("--manga-velocity", "0");
                  setDocVar("--manga-skew", "0deg");
                  setDocVar("--manga-speed-opacity", "0");
                });
              }
              wirePanels(false);

              gsap.utils
                .toArray<HTMLElement>("[data-manga-pin]")
                .forEach(container => {
                  const track =
                    container.querySelector<HTMLElement>("[data-manga-track]");
                  if (!track) return;
                  const distance = () =>
                    Math.max(0, track.scrollWidth - container.clientWidth);
                  if (distance() <= 0) return;
                  const rail = gsap.to(track, {
                    x: () => -distance(),
                    ease: "none",
                    scrollTrigger: {
                      trigger: container,
                      start: "top top",
                      end: () => `+=${distance()}`,
                      pin: true,
                      scrub: 0.8,
                      invalidateOnRefresh: true,
                      anticipatePin: 1,
                    },
                  });
                  gsap.utils
                    .toArray<HTMLElement>(
                      ".experience-card, .project-card",
                      track
                    )
                    .forEach((panel, index) => {
                      gsap.fromTo(
                        panel,
                        { scale: 0.9, rotate: index % 2 ? 2.6 : -2.6, y: 18 },
                        {
                          scale: 1,
                          rotate: 0,
                          y: 0,
                          ease: "power1.out",
                          scrollTrigger: {
                            trigger: panel,
                            containerAnimation: rail,
                            start: "left 86%",
                            end: "center 53%",
                            scrub: 0.55,
                            invalidateOnRefresh: true,
                          },
                        }
                      );
                    });
                });
            },
            "(max-width: 899px)": () => {
              const home = document.querySelector<HTMLElement>("#home");
              if (home) {
                const earth = home.querySelector<HTMLElement>(
                  "[data-manga-earth], .hero-earth"
                );
                const figure = home.querySelector<HTMLElement>(
                  ".hero-character-turn"
                );
                const warp = home.querySelector<HTMLElement>(
                  "[data-manga-warp], .earth-warp-lines"
                );
                const flash = home.querySelector<HTMLElement>(
                  "[data-manga-flash], .impact-flash"
                );
                const letters =
                  home.querySelectorAll<HTMLElement>(".hero-name-letter");
                const shakeLayers = home.querySelectorAll<HTMLElement>(
                  ".hero-content, .hero-scene"
                );
                const heroTimeline = gsap.timeline({
                  scrollTrigger: {
                    trigger: home,
                    start: "top top",
                    end: () => `+=${Math.round(window.innerHeight * 1.5)}`,
                    scrub: 0.7,
                    invalidateOnRefresh: true,
                  },
                });
                if (earth)
                  heroTimeline.to(
                    earth,
                    { scale: 1.12, xPercent: 4, yPercent: -2, ease: "none" },
                    0
                  );
                if (figure)
                  heroTimeline.to(
                    figure,
                    { rotateY: 180, transformPerspective: 900, ease: "none" },
                    0
                  );
                if (warp)
                  heroTimeline.fromTo(
                    warp,
                    { autoAlpha: 0, scale: 0.65 },
                    { autoAlpha: 1, scale: 1.2, ease: "power2.in" },
                    0.08
                  );
                if (letters.length)
                  heroTimeline.fromTo(
                    letters,
                    { yPercent: 20, scale: 0.8, rotate: -4 },
                    {
                      yPercent: -28,
                      scale: 1.12,
                      rotate: 0,
                      stagger: 0.035,
                      ease: "back.in(1.8)",
                    },
                    0.25
                  );
                if (flash)
                  heroTimeline.fromTo(
                    flash,
                    { autoAlpha: 0 },
                    {
                      autoAlpha: 0.9,
                      duration: 0.035,
                      yoyo: true,
                      repeat: 1,
                      ease: "steps(1)",
                    },
                    0.58
                  );
                shakeLayers.forEach((layer, index) =>
                  heroTimeline.fromTo(
                    layer,
                    { x: 0, y: 0 },
                    {
                      x: index ? -4 : 4,
                      y: -2,
                      duration: 0.028,
                      yoyo: true,
                      repeat: 5,
                      ease: "steps(1)",
                    },
                    0.58
                  )
                );
                heroTimeline.eventCallback("onReverseComplete", () => {
                  setDocVar("--manga-progress", "0");
                  setDocVar("--manga-speed-scale", "1");
                });
              }
              wirePanels(true);
              gsap.utils
                .toArray<HTMLElement>(".experience-card, .project-card")
                .forEach((panel, index) => {
                  gsap.fromTo(
                    panel,
                    { y: 24, rotate: index % 2 ? 1.2 : -1.2, scale: 0.98 },
                    {
                      y: 0,
                      rotate: 0,
                      scale: 1,
                      ease: "back.out(1.3)",
                      scrollTrigger: {
                        trigger: panel,
                        start: "top 94%",
                        end: "top 60%",
                        scrub: 0.5,
                      },
                    }
                  );
                });
            },
          });
        });

        cleanup = () => {
          ctx.revert();
          originalVars.forEach((value, name) => {
            if (value) root.style.setProperty(name, value);
            else root.style.removeProperty(name);
          });
        };
        if (cancelled) cleanup();
      } catch (error) {
        if (!cancelled)
          console.error(
            "[MangaScrollFX] Unable to initialize scroll effects:",
            error
          );
      }
    })();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(clockFrame);
      cleanup?.();
      restorePulses();
      originalVars.forEach((value, name) => {
        if (value) root.style.setProperty(name, value);
        else root.style.removeProperty(name);
      });
    };
  }, [enabled]);

  return null;
}
