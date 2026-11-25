// Container edge-normal / exponential refraction approach adapted from
// dashersw/liquid-glass-js (MIT). See THIRD-PARTY-NOTICES.md.
import {
  subscribeWorldFrames,
  subscribeGradientFrames,
} from "./worldGlassSource";

const vertex = `attribute vec2 position; varying vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
varying vec2 uv;uniform sampler2D image;uniform vec2 viewport;
uniform vec4 rect;uniform vec3 tint;uniform float blur;uniform float strength;
uniform float radius;uniform float tintOpacity;
void main(){
 vec2 p=vec2(uv.x,1.-uv.y);vec2 pixel=p*rect.zw;
 vec2 centered=pixel-rect.zw*.5;
 vec2 q=abs(centered)-(rect.zw*.5-radius);
 float edge=-(length(max(q,0.))+min(max(q.x,q.y),0.)-radius);
 vec2 n=q.x>0.&&q.y>0.?sign(centered)*normalize(q+vec2(.0001)):
   (q.x>q.y?vec2(sign(centered.x),0.):vec2(0.,sign(centered.y)));
 float bend=exp(-max(edge,0.)*.10)*strength;
 vec2 coord=(rect.xy+pixel+n*bend)/viewport;
 vec2 stepSize=vec2(blur)/viewport;
 vec4 c=texture2D(image,coord)*.2;
 c+=texture2D(image,coord+vec2(stepSize.x,0.))*.12;
 c+=texture2D(image,coord-vec2(stepSize.x,0.))*.12;
 c+=texture2D(image,coord+vec2(0.,stepSize.y))*.12;
 c+=texture2D(image,coord-vec2(0.,stepSize.y))*.12;
 c+=texture2D(image,coord+stepSize)*.08;
 c+=texture2D(image,coord-stepSize)*.08;
 c+=texture2D(image,coord+vec2(stepSize.x,-stepSize.y))*.08;
 c+=texture2D(image,coord+vec2(-stepSize.x,stepSize.y))*.08;
 vec3 color=mix(c.rgb,tint,tintOpacity);
 color+=vec3(exp(-max(edge,0.)*.65)*.11);
 gl_FragColor=vec4(color,1.);
}`;

/** One shared GPU context for every Container. Text is never sampled or filtered. */
export function createGlassContainers(
  root: HTMLElement,
  onFailure: () => void
) {
  const output = document.createElement("canvas");
  const gl = output.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("Glass WebGL unavailable");
  const shaders: WebGLShader[] = [];
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Glass shader allocation failed");
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
      throw new Error("Glass shader compilation failed");
    return shader;
  }
  const program = gl.createProgram();
  if (!program) throw new Error("Glass program unavailable");
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error("Glass program link failed");
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, "image"), 0);
  const uniforms = Object.fromEntries(
    [
      "viewport",
      "rect",
      "tint",
      "blur",
      "strength",
      "radius",
      "tintOpacity",
    ].map(name => [name, gl.getUniformLocation(program, name)])
  );
  const source = document.createElement("canvas");
  const gradient = document.createElement("canvas");
  let lastGradient = 0;
  const stopGradient = subscribeGradientFrames(canvas => {
    if (performance.now() - lastGradient < 80 || document.hidden) return;
    lastGradient = performance.now();
    gradient.width = Math.ceil(innerWidth * 0.5);
    gradient.height = Math.ceil(innerHeight * 0.5);
    gradient
      .getContext("2d")
      ?.drawImage(canvas, 0, 0, gradient.width, gradient.height);
  });
  const context = source.getContext("2d");
  if (!context) throw new Error("Glass source unavailable");
  const panels = new Map<HTMLElement, HTMLCanvasElement>();
  function discover() {
    for (const [element, canvas] of panels)
      if (!root.contains(element)) {
        canvas.remove();
        panels.delete(element);
      }
    root
      .querySelectorAll<HTMLElement>("[data-liquid-glass]")
      .forEach(element => {
        if (panels.has(element)) return;
        const canvas = document.createElement("canvas");
        canvas.className = "liquid-glass-layer";
        canvas.setAttribute("aria-hidden", "true");
        element.classList.add("liquid-glass-container");
        element.prepend(canvas);
        panels.set(element, canvas);
      });
  }
  discover();
  const observer = new MutationObserver(discover);
  observer.observe(root, { childList: true, subtree: true });
  let last = 0;
  let disposed = false;
  const unsubscribe = subscribeWorldFrames(earth => {
    const now = performance.now();
    if (disposed || document.hidden || now - last < 80) return;
    last = now;
    try {
      const width = innerWidth,
        height = innerHeight;
      // Half-resolution source and capped per-panel pixels keep upload/fill cost bounded.
      if (
        source.width !== Math.ceil(width * 0.5) ||
        source.height !== Math.ceil(height * 0.5)
      ) {
        source.width = Math.ceil(width * 0.5);
        source.height = Math.ceil(height * 0.5);
      }
      context.setTransform(0.5, 0, 0, 0.5, 0, 0);
      const isDark = root.classList.contains("mode-garou");
      const space = context.createRadialGradient(
        width * 0.25,
        height * 0.4,
        0,
        width * 0.25,
        height * 0.4,
        width
      );
      space.addColorStop(0, "#27213d");
      space.addColorStop(1, "#0b0b14");
      context.fillStyle = space;
      context.fillRect(0, 0, width, height);
      {
        const warm = context.createLinearGradient(0, 0, width, height);
        warm.addColorStop(0, isDark ? "#0F0D17" : "#FAF7F2");
        warm.addColorStop(0.48, isDark ? "#5B21B6" : "#D97757");
        warm.addColorStop(1, isDark ? "#C4B5FD" : "#B84A4A");
        context.fillStyle = warm;
        context.fillRect(0, 0, width, height);
        if (gradient.width > 0 && lastGradient > 0)
          context.drawImage(gradient, 0, 0, width, height);
      }
      context.fillStyle = "#c4b5fd";
      for (let i = 0; i < 95; i++)
        context.fillRect((i * 137) % width, (i * 83) % height, 1.2, 1.2);
      const earthRect = earth.getBoundingClientRect();
      context.drawImage(
        earth,
        earthRect.left,
        earthRect.top,
        earthRect.width,
        earthRect.height
      );
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source
      );
      gl.uniform2f(uniforms.viewport, width, height);
      const style = getComputedStyle(root);
      gl.uniform1f(
        uniforms.blur,
        parseFloat(style.getPropertyValue("--glass-blur")) || 10
      );
      gl.uniform1f(
        uniforms.strength,
        parseFloat(style.getPropertyValue("--glass-refraction")) || 12
      );
      const dark = root.classList.contains("mode-garou");
      gl.uniform3f(
        uniforms.tint,
        ...((dark ? [0.059, 0.051, 0.09] : [0.98, 0.969, 0.949]) as [
          number,
          number,
          number,
        ])
      );
      let count = 0;
      for (const [element, canvas] of panels) {
        const rect = element.getBoundingClientRect();
        if (
          rect.bottom < 0 ||
          rect.top > height ||
          rect.right < 0 ||
          rect.left > width ||
          rect.width < 1 ||
          rect.height < 1 ||
          getComputedStyle(element).visibility === "hidden" ||
          element.getAttribute("aria-hidden") === "true"
        )
          continue;
        if (++count > 8) break;
        const scale = Math.min(0.75, 800 / rect.width, 650 / rect.height);
        const w = Math.max(1, Math.round(rect.width * scale)),
          h = Math.max(1, Math.round(rect.height * scale));
        if (output.width !== w || output.height !== h) {
          output.width = w;
          output.height = h;
        }
        gl.viewport(0, 0, w, h);
        const panelStyle = getComputedStyle(element);
        // Navigation has its own translucent crimson tint in either theme.
        const panelTint = element.dataset.liquidGlass === "nav"
          ? (dark ? [91 / 255, 33 / 255, 182 / 255] : [194 / 255, 31 / 255, 31 / 255])
          : dark ? [0.059, 0.051, 0.09] : [0.98, 0.969, 0.949];
        gl.uniform3f(uniforms.tint, panelTint[0], panelTint[1], panelTint[2]);
        gl.uniform1f(
          uniforms.radius,
          Math.min(
            parseFloat(panelStyle.borderTopLeftRadius) || 0,
            rect.width * 0.5,
            rect.height * 0.5
          )
        );
        gl.uniform1f(
          uniforms.tintOpacity,
          parseFloat(panelStyle.getPropertyValue("--glass-tint")) || 0.72
        );
        gl.uniform4f(
          uniforms.rect,
          rect.left,
          rect.top,
          rect.width,
          rect.height
        );
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        canvas.getContext("2d")?.drawImage(output, 0, 0);
        element.dataset.glass = "webgl";
      }
    } catch {
      onFailure();
    }
  });
  const lost = (event: Event) => {
    event.preventDefault();
    onFailure();
  };
  output.addEventListener("webglcontextlost", lost);
  return () => {
    disposed = true;
    unsubscribe();
    stopGradient();
    observer.disconnect();
    output.removeEventListener("webglcontextlost", lost);
    panels.forEach((canvas, element) => {
      canvas.remove();
      element.classList.remove("liquid-glass-container");
      delete element.dataset.glass;
    });
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}


