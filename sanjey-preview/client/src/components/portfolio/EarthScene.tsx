import { useEffect, useRef } from "react";
import type * as Three from "three";

export interface EarthSceneProps {
  mode?: "saitama" | "garou";
  ambient?: boolean;
  onReady?: (webgl: boolean) => void;
}

/** Transparent, original procedural Earth/star enhancement; the page owns its fallback. */
export default function EarthScene({
  mode = "saitama",
  ambient = false,
  onReady,
}: EarthSceneProps) {
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const mountRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onReady);
  callbackRef.current = onReady;

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    let cancelled = false;
    let renderer: Three.WebGLRenderer | undefined;
    let frame = 0;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let contextCanvas: HTMLCanvasElement | undefined;
    const geometries = new Set<Three.BufferGeometry>();
    const materials = new Set<Three.Material>();
    const textures = new Set<Three.Texture>();
    const notify = (value: boolean) => callbackRef.current?.(value);

    const hiddenByPreference =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let pageVisible = !document.hidden;
    let inView = true;
    let running = false;
    let rendered = false;
    let scrollProgress = 0;
    const hero = document.getElementById("home");
    let heroStart = hero?.offsetTop ?? 0;
    let scene: Three.Scene | undefined;
    let camera: Three.PerspectiveCamera | undefined;
    let earth: Three.Mesh | undefined;
    let stars: Three.Points | undefined;
    let orbit: Three.Line | undefined;

    const setRunning = () => {
      const shouldRun =
        !cancelled &&
        pageVisible &&
        inView &&
        !hiddenByPreference &&
        !!renderer;
      if (shouldRun && !running) {
        running = true;
        frame = requestAnimationFrame(draw);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };
    const draw = (time: number) => {
      if (!running || !renderer || !scene || !camera) return;
      const p = ambient ? 0 : scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
      // A smoothed 3D dolly aims directly at the procedural Earth as the pinned comic opening scrolls.
      const cameraTargetX = 0.25 * p;
      const cameraTargetY = 0.92 * p;
      const cameraTargetZ = 6.5 - 3.65 * p;
      camera.position.x += (cameraTargetX - camera.position.x) * 0.075;
      camera.position.y += (cameraTargetY - camera.position.y) * 0.075;
      camera.position.z += (cameraTargetZ - camera.position.z) * 0.075;
      camera.lookAt(cameraTargetX, cameraTargetY, 0);
      if (earth && !hiddenByPreference) earth.rotation.y = time * 0.000035;
      if (orbit) {
        const material = orbit.material as Three.LineBasicMaterial;
        material.color.set(
          modeRef.current === "garou" ? 0xc0c6d4 : 0xffd400
        );
        material.opacity = modeRef.current === "garou" ? 0.42 : 0.62;
      }
      if (
        stars &&
        stars.material instanceof Object &&
        "opacity" in stars.material
      ) {
        const mat = stars.material as Three.PointsMaterial;
        mat.opacity = 0.65 + Math.sin(time * 0.00045) * 0.17;
      }
      renderer.render(scene, camera);
      if (!rendered) {
        rendered = true;
        notify(true);
      }
      frame = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      pageVisible = !document.hidden;
      setRunning();
    };
    const onScroll = () => {
      scrollProgress = Math.max(
        0,
        Math.min(
          1,
          (window.scrollY - heroStart) / Math.max(1, window.innerHeight * 1.5)
        )
      );
    };
    const onWindowResize = () => {
      heroStart = hero?.offsetTop ?? heroStart;
      onScroll();
    };
    onScroll();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onWindowResize, { passive: true });
    intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(entries => {
            inView = entries[0]?.isIntersecting ?? true;
            setRunning();
          })
        : undefined;
    intersectionObserver?.observe(host);

    const initialize = async () => {
      try {
        const T = await import("three");
        if (cancelled) return;
        const webgl = new T.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        renderer = webgl;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none";
        host.appendChild(renderer.domElement);
        contextCanvas = renderer.domElement;
        scene = new T.Scene();
        camera = new T.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0, 6.5);
        scene.add(new T.AmbientLight(0x8ebcff, 1.1));
        const sun = new T.DirectionalLight(0xe5f5ff, 2.7);
        sun.position.set(-3, 2, 5);
        scene.add(sun);
        const rim = new T.PointLight(0x238dff, 2.8, 12);
        rim.position.set(2.8, -1.4, -3);
        scene.add(rim);

        // Deterministic, hand-drawn procedural map texture: no downloaded maps/artwork.
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas texture unavailable");
        const ocean = ctx.createLinearGradient(0, 0, 0, 512);
        ocean.addColorStop(0, "#1264ad");
        ocean.addColorStop(0.5, "#167dc1");
        ocean.addColorStop(1, "#073d83");
        ctx.fillStyle = ocean;
        ctx.fillRect(0, 0, 1024, 512);
        // Subtle latitude/longitude currents.
        ctx.strokeStyle = "rgba(114,204,255,.12)";
        ctx.lineWidth = 2;
        for (let y = 40; y < 512; y += 72) {
          ctx.beginPath();
          ctx.ellipse(512, 256, 505, y * 0.72, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        let seed = 918273;
        const rand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        const land = (
          cx: number,
          cy: number,
          rx: number,
          ry: number,
          count: number
        ) => {
          ctx.beginPath();
          for (let i = 0; i <= count; i++) {
            const a = (i / count) * Math.PI * 2;
            const wobble = 0.78 + rand() * 0.4;
            const x = cx + Math.cos(a) * rx * wobble;
            const y = cy + Math.sin(a) * ry * wobble;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          const green = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry);
          green.addColorStop(0, "#a0c779");
          green.addColorStop(1, "#367d5a");
          ctx.fillStyle = green;
          ctx.fill();
          ctx.strokeStyle = "rgba(198,232,151,.45)";
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.fillStyle = "rgba(222,199,136,.38)";
          for (let n = 0; n < 9; n++) {
            ctx.beginPath();
            ctx.ellipse(
              cx + (rand() - 0.5) * rx,
              cy + (rand() - 0.5) * ry,
              8 + rand() * 22,
              4 + rand() * 12,
              rand(),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        };
        land(205, 170, 100, 125, 34);
        land(278, 337, 53, 112, 29);
        land(503, 167, 167, 78, 42);
        land(539, 306, 91, 134, 35);
        land(760, 177, 198, 104, 43);
        land(874, 345, 66, 52, 25);
        land(89, 414, 88, 31, 26);
        ctx.fillStyle = "rgba(240,248,255,.72)";
        ctx.beginPath();
        ctx.ellipse(512, 18, 245, 23, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(512, 494, 245, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        const mapTexture = new T.CanvasTexture(canvas);
        mapTexture.colorSpace = T.SRGBColorSpace;
        textures.add(mapTexture);

        const atmosphere = new T.Mesh(
          new T.SphereGeometry(1.09, 48, 32),
          new T.MeshBasicMaterial({
            color: 0x4bbdff,
            transparent: true,
            opacity: 0.13,
            side: T.BackSide,
            depthWrite: false,
            blending: T.AdditiveBlending,
          })
        );
        // Keep the orbital globe high-right in its full-screen overlay so it never covers recruiter copy.
        atmosphere.position.set(0.25, 0.92, 0);
        atmosphere.scale.setScalar(0.66);
        geometries.add(atmosphere.geometry);
        materials.add(atmosphere.material);
        scene.add(atmosphere);
        const earthMaterial = new T.MeshPhongMaterial({
          map: mapTexture,
          shininess: 20,
          specular: 0x4b9dcc,
        });
        earth = new T.Mesh(new T.SphereGeometry(1, 64, 48), earthMaterial);
        earth.position.set(0.25, 0.92, 0);
        earth.scale.setScalar(0.66);
        geometries.add(earth.geometry);
        materials.add(earthMaterial);
        scene.add(earth);

        const orbitPoints: Three.Vector3[] = [];
        for (let i = 0; i <= 128; i++) {
          const a = (i / 128) * Math.PI * 2;
          orbitPoints.push(
            new T.Vector3(
              Math.cos(a) * 1.62,
              Math.sin(a) * 0.53,
              Math.sin(a) * 0.18
            )
          );
        }
        const orbitGeo = new T.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMat = new T.LineBasicMaterial({
          color: 0x78caff,
          transparent: true,
          opacity: 0.52,
        });
        geometries.add(orbitGeo);
        materials.add(orbitMat);
        orbit = new T.LineLoop(orbitGeo, orbitMat);
        orbit.position.set(0.25, 0.92, 0);
        orbit.scale.setScalar(0.66);
        orbit.rotation.x = -0.22;
        orbit.rotation.y = -0.18;
        scene.add(orbit);

        const starPositions = new Float32Array(480 * 3);
        const starSizes = new Float32Array(480);
        for (let i = 0; i < 480; i++) {
          const z = rand() * 2 - 1,
            a = rand() * Math.PI * 2,
            r = 3.3 + rand() * 9;
          const q = Math.sqrt(1 - z * z);
          starPositions[i * 3] = Math.cos(a) * q * r;
          starPositions[i * 3 + 1] = z * r;
          starPositions[i * 3 + 2] = Math.sin(a) * q * r;
          starSizes[i] = 0.018 + rand() * 0.045;
        }
        const starGeo = new T.BufferGeometry();
        starGeo.setAttribute(
          "position",
          new T.BufferAttribute(starPositions, 3)
        );
        starGeo.setAttribute("size", new T.BufferAttribute(starSizes, 1));
        const starMat = new T.PointsMaterial({
          color: 0xc9e6ff,
          size: 0.035,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
          sizeAttenuation: true,
        });
        geometries.add(starGeo);
        materials.add(starMat);
        stars = new T.Points(starGeo, starMat);
        scene.add(stars);

        const resize = () => {
          if (!renderer || !camera) return;
          const w = Math.max(1, host.clientWidth),
            h = Math.max(1, host.clientHeight);
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resizeObserver =
          typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(resize)
            : undefined;
        resizeObserver?.observe(host);
        resize();
        const onLost = (event: Event) => {
          event.preventDefault();
          running = false;
          cancelAnimationFrame(frame);
          notify(false);
        };
        contextCanvas.addEventListener("webglcontextlost", onLost);
        contextCleanup = () =>
          contextCanvas?.removeEventListener("webglcontextlost", onLost);
        setRunning();
        if (hiddenByPreference) {
          // Reduced motion still gets a single stable transparent render.
          renderer.render(scene, camera);
          rendered = true;
          notify(true);
        }
      } catch {
        if (!cancelled) notify(false);
      }
    };
    let contextCleanup = () => {};
    void initialize();

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onWindowResize);
      contextCleanup();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      textures.forEach(t => t.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="webgl-earth"
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
}
