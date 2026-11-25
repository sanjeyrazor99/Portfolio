import * as T from "three";

export function createOrbitalEffects(scene: T.Scene, compact: boolean) {
  const orbit = new T.Group();
  orbit.position.z = -2.4;
  scene.add(orbit);

  const rockGeometry = new T.IcosahedronGeometry(1, 0);
  const rockMaterial = new T.MeshStandardMaterial({
    color: "#817790",
    roughness: 0.86,
    metalness: 0.24,
    flatShading: true,
  });
  const count = compact ? 30 : 96;
  const debris = new T.InstancedMesh(rockGeometry, rockMaterial, count);
  debris.frustumCulled = false;
  orbit.add(debris);

  const paths = new T.Group();
  const orbitMaterial = new T.LineBasicMaterial({
    color: "#ffad59",
    transparent: true,
    opacity: 0.54,
    depthWrite: false,
    blending: T.AdditiveBlending,
  });
  const pathGeometry = new T.BufferGeometry();
  const pathVertices: number[] = [];
  for (let i = 0; i < 180; i++) {
    if (i % 45 > 31 && i % 5 > 0) continue;
    for (const step of [i, i + 1]) {
      const angle = step * Math.PI / 90;
      pathVertices.push(Math.cos(angle) * 4.1, Math.sin(angle) * 2.2, 0);
    }
  }
  pathGeometry.setAttribute("position", new T.Float32BufferAttribute(pathVertices, 3));
  const upper = new T.LineSegments(pathGeometry, orbitMaterial);
  const lower = new T.LineSegments(pathGeometry, orbitMaterial);
  upper.rotation.set(0.52, -0.4, 0.29);
  lower.rotation.set(-0.65, 0.24, -0.42);
  lower.scale.setScalar(0.91);
  paths.add(upper, lower);
  orbit.add(paths);

  const waveGeometry = new T.RingGeometry(0.87, 1, 96);
  const waveMaterial = new T.MeshBasicMaterial({
    color: "#ffd19b",
    side: T.DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
  });
  const wave = new T.Mesh(waveGeometry, waveMaterial);
  wave.position.z = -0.7;
  wave.rotation.x = -0.22;
  wave.visible = false;
  scene.add(wave);

  const particle = new T.Object3D();
  const fragments = Array.from({ length: count }, (_, i) => ({
    angle: i * 2.39996,
    radius: 2.8 + ((i * 17) % 31) / 16,
    size: 0.035 + ((i * 13) % 23) / 155,
    speed: 0.065 + (i % 7) * 0.011,
    depth: ((i * 11) % 19) / 7 - 1.4,
  }));

  let wasPunching = false;
  let impactTime = -Infinity;

  return {
    update(time: number, x: number, y: number, punchScale: number, garou: boolean) {
      const punching = punchScale > 1.18;
      if (punching && !wasPunching) impactTime = time;
      wasPunching = punching;

      const age = time - impactTime;
      const pulse = age < 0.95 ? 1 - age / 0.95 : 0;
      wave.visible = pulse > 0;
      if (wave.visible) {
        wave.scale.setScalar(1.3 + 5.4 * (1 - pulse ** 2));
        waveMaterial.opacity = 0.8 * pulse ** 2;
      }
      const energyColor = garou ? "#bb97ff" : "#ffad59";
      waveMaterial.color.set(energyColor);
      orbitMaterial.color.set(energyColor);
      paths.rotation.z = time * 0.12;
      orbit.rotation.x = y * 0.11;
      orbit.rotation.y = x * 0.2;

      fragments.forEach(({ angle, radius, size, speed, depth }, index) => {
        const theta = angle + time * speed;
        const distance = radius + pulse * (0.65 + index % 4 * 0.22);
        particle.position.set(
          Math.cos(theta) * distance,
          Math.sin(theta) * distance * 0.7,
          depth + Math.sin(theta + angle) * 0.66
        );
        particle.rotation.set(theta, angle - time * 0.3, theta * 0.7);
        particle.scale.set(size * 1.25, size * 0.8, size);
        particle.updateMatrix();
        debris.setMatrixAt(index, particle.matrix);
      });
      debris.instanceMatrix.needsUpdate = true;
      return pulse;
    },
    dispose() {
      scene.remove(orbit, wave);
      debris.dispose();
      for (const resource of [rockGeometry, rockMaterial, pathGeometry, orbitMaterial, waveGeometry, waveMaterial]) {
        resource.dispose();
      }
    },
  };
}
