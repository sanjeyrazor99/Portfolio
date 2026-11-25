/** Original deterministic planet atlas, inspired by the supplied blue-Earth reference.
 * No fetched imagery: coastlines, terrain, ocean and clouds are generated locally. */
type EarthAtlas = { surface: HTMLCanvasElement; clouds: HTMLCanvasElement; relief: HTMLCanvasElement; water: HTMLCanvasElement };
const atlases = new Map<number,EarthAtlas>();
export function createEarthTextures(width = 1536): EarthAtlas {
  const cached=atlases.get(width); if(cached)return cached;
  const height = width / 2;
  const make = () => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  };
  const surface = make(),
    clouds = make(),
    relief = make(),
    water = make(),
    mask = make();
  const ctx = surface.getContext("2d")!,
    cc = clouds.getContext("2d")!,
    rc = relief.getContext("2d")!,
    wc = water.getContext("2d")!,
    mc = mask.getContext("2d")!;
  // Original simplified continent silhouettes, with noisy coastal detail below.
  const continents = [
    [
      [0.06, 0.2],
      [0.12, 0.12],
      [0.2, 0.14],
      [0.26, 0.23],
      [0.22, 0.32],
      [0.18, 0.37],
      [0.17, 0.46],
      [0.12, 0.39],
      [0.08, 0.3],
    ],
    [
      [0.19, 0.44],
      [0.25, 0.46],
      [0.29, 0.55],
      [0.28, 0.63],
      [0.25, 0.72],
      [0.23, 0.83],
      [0.2, 0.72],
      [0.19, 0.59],
    ],
    [
      [0.43, 0.26],
      [0.46, 0.19],
      [0.52, 0.22],
      [0.55, 0.28],
      [0.52, 0.34],
      [0.47, 0.35],
    ],
    [
      [0.44, 0.35],
      [0.52, 0.32],
      [0.57, 0.42],
      [0.54, 0.53],
      [0.52, 0.65],
      [0.47, 0.68],
      [0.44, 0.55],
      [0.41, 0.43],
    ],
    [
      [0.52, 0.21],
      [0.6, 0.14],
      [0.71, 0.17],
      [0.81, 0.23],
      [0.86, 0.31],
      [0.8, 0.38],
      [0.74, 0.39],
      [0.69, 0.47],
      [0.65, 0.37],
      [0.59, 0.35],
      [0.55, 0.29],
    ],
    [
      [0.74, 0.6],
      [0.81, 0.57],
      [0.86, 0.64],
      [0.84, 0.73],
      [0.77, 0.74],
      [0.73, 0.67],
    ],
    [
      [0.28, 0.1],
      [0.32, 0.08],
      [0.35, 0.15],
      [0.32, 0.23],
      [0.29, 0.19],
    ],
  ];
  mc.fillStyle = "white";
  for (const polygon of continents) {
    mc.beginPath();
    polygon.forEach(([x, y], i) =>
      i ? mc.lineTo(x * width, y * height) : mc.moveTo(x * width, y * height)
    );
    mc.closePath();
    mc.fill();
  }
  const maskData = mc.getImageData(0, 0, width, height).data;
  const hash = (x: number, y: number) => {
    let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  function noise(x: number, y: number) {
    const ix = Math.floor(x),
      iy = Math.floor(y);
    let fx = x - ix,
      fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy),
      b = hash(ix + 1, iy),
      c = hash(ix, iy + 1),
      d = hash(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  function fbm(x: number, y: number) {
    let sum = 0,
      amp = 0.55;
    for (let o = 0; o < 5; o++) {
      sum += noise(x, y) * amp;
      x = x * 2.03 + 7.1;
      y = y * 2.03 + 3.3;
      amp *= 0.48;
    }
    return sum;
  }
  const image = ctx.createImageData(width, height),
    cloud = cc.createImageData(width, height),
    bump = rc.createImageData(width, height),
    spec = wc.createImageData(width, height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4,
        u = x / width,
        v = y / height,
        latitude = Math.abs(v - 0.5) * 2;
      const terrain = fbm(u * 65, v * 42),
        broad = fbm(u * 12, v * 9);
      const mx = Math.max(
          0,
          Math.min(width - 1, Math.round(x + (terrain - 0.5) * width * 0.018))
        ),
        my = Math.max(
          0,
          Math.min(height - 1, Math.round(y + (broad - 0.5) * height * 0.02))
        );
      const land = maskData[(my * width + mx) * 4] > 0;
      let r = 5 + terrain * 8,
        g = 22 + terrain * 24,
        b = 90 + terrain * 75;
      let altitude = 8 + terrain * 12;
      if (land) {
        const arid =
          Math.max(0, 1 - Math.abs(v - 0.4) * 9) *
          Math.max(0, broad - 0.38) *
          2;
        const ridge = Math.pow(1 - Math.abs(terrain * 2 - 1), 9) * broad;
        r = 30 + terrain * 62 + arid * 92 + ridge * 36;
        g = 57 + terrain * 66 + arid * 50 + ridge * 29;
        b = 31 + terrain * 40 + arid * 24 + ridge * 27;
        altitude = 65 + terrain * 125 + ridge * 55;
      }
      const ice = Math.max(0, (latitude - 0.86) * 7);
      r = r * (1 - ice) + 220 * ice;
      g = g * (1 - ice) + 236 * ice;
      b = b * (1 - ice) + 246 * ice;
      image.data.set([r, g, b, 255], i);
      bump.data.set([altitude, altitude, altitude, 255], i);
      spec.data.set(land ? [20, 20, 20, 255] : [205, 205, 205, 255], i);
      const swirl = fbm(
        u * 28 + Math.sin(v * 25) * 1.1,
        v * 23 + Math.sin(u * 19) * 0.9
      );
      const bands = 0.05 * Math.sin(v * 49 + Math.sin(u * 22) * 2);
      const density = Math.min(1, Math.max(0, (swirl + bands - 0.48) * 5));
      cloud.data.set([246, 251, 255, Math.round(density * 235)], i);
    }
  ctx.putImageData(image, 0, 0);
  cc.putImageData(cloud, 0, 0);
  rc.putImageData(bump, 0, 0);
  wc.putImageData(spec, 0, 0);
  const atlas={ surface, clouds, relief, water };atlases.set(width,atlas);return atlas;
}

/** Lit spherical projection used by the low-power/reduced-motion fallback. */
export function paintEarthPoster(
  canvas: HTMLCanvasElement,
  atlas: ReturnType<typeof createEarthTextures>
) {
  const size = canvas.width,
    ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = atlas.surface.width,
    h = atlas.surface.height;
  const surface = atlas.surface.getContext("2d")!.getImageData(0, 0, w, h).data;
  const cloud = atlas.clouds.getContext("2d")!.getImageData(0, 0, w, h).data;
  const out = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const nx = (x - size / 2) / (size * 0.485),
        ny = (size / 2 - y) / (size * 0.485),
        rr = nx * nx + ny * ny;
      if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr),
        u = (((Math.atan2(nx, nz) / (Math.PI * 2) + 0.53) % 1) + 1) % 1,
        v = 0.5 - Math.asin(ny) / Math.PI;
      const index =
          (Math.min(h - 1, Math.floor(v * h)) * w + Math.floor(u * w)) * 4,
        i = (y * size + x) * 4;
      const light = Math.max(0, -nx * 0.45 + ny * 0.5 + nz * 0.74),
        shade = 0.12 + light * 0.94;
      const alpha = cloud[index + 3] / 255,
        fresnel = Math.pow(1 - nz, 4) * 0.65;
      for (let c = 0; c < 3; c++) {
        const color =
          surface[index + c] * (1 - alpha) + cloud[index + c] * alpha;
        out.data[i + c] = Math.min(
          255,
          color * shade + [18, 85, 240][c] * fresnel
        );
      }
      out.data[i + 3] = Math.min(255, (1 - Math.sqrt(rr)) * size * 255);
    }
  ctx.putImageData(out, 0, 0);
}
