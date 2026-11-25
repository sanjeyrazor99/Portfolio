import * as T from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { FontLoader, type FontData } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import typeface from "@/data/anton.typeface.json";

export async function createName(scene: T.Scene, camera: T.PerspectiveCamera) {
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  const font = new FontLoader().parse(typeface as unknown as FontData);
  const gradient = new T.DataTexture(
    new Uint8Array([55, 145, 255]),
    3,
    1,
    T.RedFormat
  );
  gradient.needsUpdate = true;
  gradient.minFilter = gradient.magFilter = T.NearestFilter;
  const face = new T.MeshToonMaterial({
    color: "#f5f1e6",
    gradientMap: gradient,
  });
  const side = new T.MeshToonMaterial({
    color: "#c21f1f",
    gradientMap: gradient,
  });
  const outline = new T.MeshBasicMaterial({
    color: "#0b0b0f",
    side: T.BackSide,
  });
  const letters: {
    mesh: T.Group;
    body: RAPIER.RigidBody;
    geometry: TextGeometry;
    home: T.Vector3;
    width: number;
    height: number;
    velocity: T.Vector3;
  }[] = [];
  for (const [row, word] of ["SANJEY", "MANIAN"].entries()) {
    const geometry = word
      .split("")
      .map(
        char =>
          new TextGeometry(char, {
            font,
            size: 1,
            depth: 0.38,
            curveSegments: 5,
            bevelEnabled: true,
            bevelSize: 0.014,
            bevelThickness: 0.02,
            bevelSegments: 2,
          })
      );
    let width = 0;
    const dimensions = geometry.map(g => {
      g.computeBoundingBox();
      const size = g.boundingBox!.getSize(new T.Vector3());
      return size;
    });
    width = dimensions.reduce((sum, size) => sum + size.x + 0.08, 0) - 0.08;
    const viewWidth =
      2 *
      Math.tan(T.MathUtils.degToRad(camera.fov / 2)) *
      camera.position.z *
      camera.aspect;
    const scale = (viewWidth * 0.85) / width;
    const verticalScale = Math.min(scale, 1.5);
    let cursor = (-width * scale) / 2;
    geometry.forEach((g, i) => {
      const size = dimensions[i];
      const box = g.boundingBox!;
      g.translate(-box.min.x - size.x / 2, -box.min.y - size.y / 2, -0.19);
      g.scale(scale, verticalScale, verticalScale);
      const home = new T.Vector3(
        cursor + (size.x * scale) / 2,
        row === 0 ? 1.94 : -1.98,
        [-0.58, -0.35, 0.06, -0.42, 0.14, -0.26][i]
      );
      cursor += (size.x + 0.08) * scale;
      const mesh = new T.Group();
      mesh.add(new T.Mesh(g, [face, side]));
      const ink = new T.Mesh(g, outline);
      ink.scale.setScalar(1.032);
      mesh.add(ink);
      mesh.position.copy(home);
      scene.add(mesh);
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(home.x, home.y, home.z)
          .setLinearDamping(4)
          .setAngularDamping(5)
          .setCcdEnabled(true)
      );
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(
          size.x * scale * 0.46,
          size.y * verticalScale * 0.46,
          0.19 * verticalScale
        )
          .setRestitution(0.25)
          .setFriction(0.2),
        body
      );
      letters.push({
        mesh,
        body,
        geometry: g,
        home,
        width: size.x * scale,
        height: size.y * verticalScale,
        velocity: new T.Vector3(),
      });
    });
  }

  const halfWidth =
    Math.tan(T.MathUtils.degToRad(camera.fov / 2)) *
    camera.position.z *
    camera.aspect;
  for (const [x, y, sx, sy] of [
    [-halfWidth, 0, 0.1, 4],
    [halfWidth, 0, 0.1, 4],
    [0, 3.15, halfWidth, 0.1],
    [0, -3.15, halfWidth, 0.1],
  ]) {
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(sx, sy, 3)
        .setTranslation(x, y, 0)
        .setRestitution(0.2)
    );
  }
  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  let grabbed = -1;
  let hovered = -1;
  let lastBurst = 0;
  function pick(clientX: number, clientY: number, rect: DOMRect) {
    pointer.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      (-(clientY - rect.top) / rect.height) * 2 + 1
    );
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(
      letters.map(l => l.mesh),
      true
    )[0];
    return hit ? letters.findIndex(l => l.mesh === hit.object.parent) : -1;
  }
  function burst(strength = 1) {
    letters.forEach((letter, i) => {
      const direction = new T.Vector3(
        letter.home.x,
        letter.home.y,
        0.2
      ).normalize();
      letter.body.applyImpulse(
        {
          x: direction.x * 1.5 * strength,
          y: direction.y * 1.5 * strength,
          z: 0.5 * strength,
        },
        true
      );
      letter.body.applyTorqueImpulse(
        {
          x: Math.sin(i * 7.2) * 0.4 * strength,
          y: Math.cos(i * 4.3) * 0.4 * strength,
          z: direction.x * 0.25 * strength,
        },
        true
      );
    });
  }
  function update(t: number, charge: number, heat: number, paused: boolean) {
    const strike = heat > 1.32;
    if (strike && t - lastBurst > 0.8) {
      burst(1 + charge);
      lastBurst = t;
    }
    for (const [i, l] of letters.entries()) {
      if (paused) {
        l.body.setTranslation(l.home, true);
        l.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        l.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        l.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      } else if (i !== grabbed) {
        const pos = l.body.translation(),
          vel = l.body.linvel();
        const lift = i === hovered ? 0.35 : 0;
        l.body.applyImpulse(
          {
            x: (l.home.x - pos.x) * 0.12 - vel.x * 0.035,
            y:
              (l.home.y + Math.sin(t * 1.2 + i) * 0.025 - pos.y) * 0.12 -
              vel.y * 0.035,
            z: (l.home.z + lift - pos.z) * 0.12 - vel.z * 0.035,
          },
          true
        );
        const q = l.body.rotation(),
          angular = l.body.angvel();
        l.body.applyTorqueImpulse(
          {
            x: -q.x * 0.13 - angular.x * 0.025,
            y: -q.y * 0.13 - angular.y * 0.025,
            z: -q.z * 0.13 - angular.z * 0.025,
          },
          true
        );
        if (Math.abs(pos.x) > 7 || Math.abs(pos.y) > 4)
          l.body.setTranslation(l.home, true);
      }
    }
    world.step();
    for (const l of letters) {
      l.mesh.position.copy(l.body.translation());
      l.mesh.quaternion.copy(l.body.rotation());
    }
  }
  return {
    update,
    burst,
    hover(index: number) {
      hovered = index;
    },
    pick,
    grab(index: number) {
      grabbed = index;
    },
    drag(clientX: number, clientY: number, rect: DOMRect) {
      if (grabbed < 0) return;
      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        (-(clientY - rect.top) / rect.height) * 2 + 1
      );
      ray.setFromCamera(pointer, camera);
      const plane = new T.Plane(new T.Vector3(0, 0, 1), 0);
      const target = new T.Vector3();
      ray.ray.intersectPlane(plane, target);
      const l = letters[grabbed],
        p = l.body.translation();
      l.velocity.set(target.x - p.x, target.y - p.y, 0).multiplyScalar(10);
      l.body.setTranslation(target, true);
      l.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    },
    release() {
      if (grabbed >= 0) {
        const l = letters[grabbed];
        l.body.setLinvel(l.velocity, true);
      }
      grabbed = -1;
    },
    dispose() {
      letters.forEach(l => {
        scene.remove(l.mesh);
        l.geometry.dispose();
      });
      face.dispose();
      side.dispose();
      outline.dispose();
      gradient.dispose();
      world.free();
    },
  };
}
