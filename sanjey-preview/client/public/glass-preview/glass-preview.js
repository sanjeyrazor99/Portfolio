window.glassControls = { blurRadius: 7, edgeIntensity: 0.033, rimIntensity: 0.06 };

const panels = [...document.querySelectorAll("[data-glass]")];
const slider = document.querySelector("#glass-blur");
const readout = document.querySelector("#blur-value");
const containers = [];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

if (!reducedMotion.matches && typeof Container === "function" && typeof html2canvas === "function") {
  for (const panel of panels) {
    const glass = new Container({
      type: panel.dataset.glass,
      borderRadius: parseFloat(getComputedStyle(panel).borderTopLeftRadius),
      tintOpacity: 0.2,
    });
    glass.element.setAttribute("aria-hidden", "true");
    panel.prepend(glass.element);
    glass.updateSizeFromDOM();
    containers.push(glass);
  }
}

slider.addEventListener("input", () => {
  const blurRadius = Number(slider.value);
  readout.value = String(blurRadius);
  window.glassControls.blurRadius = blurRadius;
  document.documentElement.style.setProperty("--glass-blur", blurRadius + "px");

  for (const glass of containers) {
    const { gl, blurRadiusLoc } = glass.gl_refs;
    if (!gl || !glass.render) continue;
    gl.uniform1f(blurRadiusLoc, blurRadius);
    glass.render();
  }
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  if (!containers.length) return;
  resizeTimer = setTimeout(async () => {
    try {
      const snapshot = await html2canvas(document.body, {
        scale: 1,
        ignoreElements: element => element.classList.contains("glass-container"),
      });
      Container.pageSnapshot = snapshot;
      for (const glass of containers) {
        glass.updateSizeFromDOM();
        const { gl, texture, textureSizeLoc, pageHeightLoc, viewportHeightLoc } = glass.gl_refs;
        if (!gl || !glass.render) continue;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshot);
        gl.uniform2f(textureSizeLoc, snapshot.width, snapshot.height);
        gl.uniform1f(pageHeightLoc, snapshot.height);
        gl.uniform1f(viewportHeightLoc, innerHeight);
        requestAnimationFrame(glass.render);
      }
    } catch (error) {
      console.warn("Could not refresh the glass backdrop", error);
    }
  }, 180);
});
