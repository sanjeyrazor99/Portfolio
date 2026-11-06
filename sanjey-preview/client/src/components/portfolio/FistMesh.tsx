import { createName } from "./NameWorld";
import { useEffect, useRef } from "react";
import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export default function FistMesh({
  ready,
  paused = false,
}: {
  ready: (active: boolean) => void;
  paused?: boolean;
}) {
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = host.current;
    const stage = element?.closest<HTMLElement>(".fist-stage");
    const button = element?.closest<HTMLButtonElement>("button");
    if (!element || !stage || !button) return;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(
      Math.min(
        devicePixelRatio,
        matchMedia("(max-width:760px)").matches ? 1.5 : 2
      )
    );
    element.append(renderer.domElement);

    const scene = new T.Scene();
    const starPositions=new Float32Array(6000);
    for(let i=0;i<6000;i++){
      const seed=Math.sin(i*173.37+5)*43758.5453;
      starPositions[i]=(seed-Math.floor(seed)-.5)*(i%3===2?24:52);
      if(i%3===2)starPositions[i]-=15;
    }
    const starGeometry=new T.BufferGeometry();
    starGeometry.setAttribute("position",new T.BufferAttribute(starPositions,3));
    const starMaterial=new T.PointsMaterial({color:"#c9c9d1",size:.025,transparent:true,opacity:.45});
    scene.add(new T.Points(starGeometry,starMaterial));

    const camera = new T.PerspectiveCamera(39, 1, 0.1, 60);
    camera.position.set(0, 0, 7.5);
    camera.lookAt(0, 0, 0);
    const fist = new T.Group();

    scene.add(fist);
    scene.add(new T.HemisphereLight("#f5f1e6", "#7a0f0f", 2.5));
    const fireLight = new T.PointLight("#ff8a1f", 18, 15);
    fireLight.position.set(0, 0.3, 2);
    scene.add(fireLight);
    const rimLight = new T.DirectionalLight("#f7dda0", 2.2);
    rimLight.position.set(0, -3, 2);
    scene.add(rimLight);
    let name: Awaited<ReturnType<typeof createName>> | undefined;
    let disposed = false;
    void createName(scene, camera)
      .then(value => {
        if (disposed) value.dispose();
        else name = value;
      })
      .catch(() => ready(false));

    const skin = new T.ShaderMaterial({
      uniforms: { beat: { value: 0 }, boil: { value: 0 } },
      vertexShader: `
        varying vec3 n, eye, local;
        void main(){
          local=position; n=normalize(normalMatrix*normal);
          vec4 p=modelViewMatrix*vec4(position,1.);
          eye=normalize(-p.xyz); gl_Position=projectionMatrix*p;
        }`,
      fragmentShader: `
        uniform float beat,boil;
        varying vec3 n, eye, local;
        void main(){
          vec3 normal=normalize(n);
          float light=dot(normal,normalize(vec3(-.45,.67,.75)));
          vec3 c=vec3(.48,.038,.055);
          if(light>.03)c=vec3(.70,.07,.065);
          if(light>.43)c=vec3(.83,.12,.08);
          if(light>.79)c=vec3(1.,.27,.13);
          float rim=pow(1.-abs(dot(normal,normalize(eye))),2.);
          c=mix(c,vec3(.97,.86,.63),clamp(rim*max(0.,-normal.y)*(1.6+beat*.7),0.,1.));
          c+=vec3(.08,.08,.2)*max(0.,normal.x)*rim;
          float dots=1.-smoothstep(.13,.23,length(fract(gl_FragCoord.xy/5.)-.5));
          c*=1.-dots*.27*(1.-smoothstep(.25,.8,light));
          float hatch=step(.8,fract(local.y*26.+local.z*8.+boil*.14));
          c*=1.-hatch*.63*smoothstep(.28,.86,abs(normal.x))*(1.-smoothstep(.05,.43,light));
          if(local.y>.25 && light>.5 && light<.87 && sin(local.x*17.)+sin(local.z*12.)>-.2)c*=.2;
          float glint=pow(max(0.,dot(normal,normalize(vec3(-.26,.68,.69)))),32.);
          c+=vec3(.25,.1,.045)*glint*(.65+beat);
          gl_FragColor=vec4(c,1.);
        }`,
    });
    const ink = new T.MeshBasicMaterial({ color: "#0b0b0f", side: T.BackSide });
    const sphere = new T.SphereGeometry(1, 32, 24);
    const rounded = new RoundedBoxGeometry(1, 1, 1, 5, 0.21);
    const segment = new T.CapsuleGeometry(1, 0.55, 8, 20);
    const parts: T.Group[] = [];
    function form(
      geometry: T.BufferGeometry,
      x: number,
      y: number,
      z: number,
      sx: number,
      sy: number,
      sz: number,
      roll = 0
    ) {
      const piece = new T.Group();
      piece.position.set(x, y, z);
      piece.rotation.z = roll;
      const body = new T.Mesh(geometry, skin);
      body.scale.set(sx, sy, sz);
      const outline = new T.Mesh(geometry, ink);
      outline.scale.copy(body.scale).multiplyScalar(1.035);
      piece.add(body, outline);
      fist.add(piece);
      return piece;
    }
    form(rounded, 0, -0.12, -0.5, 3.55, 2.5, 1.55, -0.08);
    form(rounded, 0.45, -1.0, -1.08, 2.4, 1.12, 1.45, -0.31);
    form(rounded, 0.5, -1.13, -1.52, 2.52, 1.17, 0.42, -0.31);
    [-1.36, -0.49, 0.44, 1.33].forEach((x, i) => {
      const high = [0, 0.26, 0.34, 0.09][i];
      const depth = [0.02, 0.29, 0.38, 0.15][i];
      const width = [0.48, 0.52, 0.55, 0.53][i];
      parts.push(
        form(sphere, x, 0.54 + high, 0.59 + depth, width, 0.73, 0.62, -0.12)
      );
      form(
        segment,
        x - 0.07,
        -0.04 + high,
        0.8 + depth,
        width,
        0.59,
        0.59,
        -0.14
      );
      form(
        sphere,
        x - 0.15,
        -0.69 + high,
        0.58 + depth,
        width * 0.93,
        0.55,
        0.59,
        -0.2
      );
    });
    form(segment, 0.57, -1.12, 0.66, 0.41, 0.72, 0.48, 1.28);
    form(segment, 1.32, -1.0, 0.5, 0.42, 0.58, 0.46, -0.56);

    const fireMaterial = new T.ShaderMaterial({
      uniforms: { time: { value: 0 }, heat: { value: 0.5 } },
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      blending: T.AdditiveBlending,
      vertexShader: `
        varying vec2 flameUV;
        void main() {
          flameUV=uv;
          vec4 p=vec4(position,1.);
          #ifdef USE_INSTANCING
          p=instanceMatrix*p;
          #endif
          gl_Position=projectionMatrix*modelViewMatrix*p;
        }`,
      fragmentShader: `
        uniform float time, heat;
        varying vec2 flameUV;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){
          vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
        }
        void main(){
          vec2 uv=flameUV;
          float turbulence=noise(vec2(uv.x*5.,uv.y*7.-time*2.))* .6
            + noise(vec2(uv.x*12.,uv.y*16.-time*4.))*.25;
          float taper=(1.-uv.y)*.48;
          float edge=taper-abs(uv.x-.5)+(turbulence-.4)*.25;
          float alpha=smoothstep(-.04,.06,edge)*smoothstep(0.,.13,uv.y)*(1.-uv.y);
          vec3 red=vec3(.88,.06,.015), orange=vec3(1.,.36,.025), core=vec3(1.,.95,.63);
          vec3 c=mix(red,orange,clamp((1.-uv.y)*1.4,0.,1.));
          c=mix(c,core,clamp((1.-uv.y)*heat-.35,0.,.8));
          c*=mix(.25,1.,step(.018,edge));
          float hatch=step(.75,fract(uv.x*28.+uv.y*18.));
          c*=1.-hatch*.16;
          gl_FragColor=vec4(c,alpha*(.55+heat*.3));
        }`,
    });
    const flameGeometry = new T.PlaneGeometry(1, 1);
    const flames = new T.InstancedMesh(flameGeometry, fireMaterial, 28);
    flames.frustumCulled = false;
    fist.add(flames);
    const flameDummy = new T.Object3D();
    const flameShell = new T.Mesh(sphere, fireMaterial);
    flameShell.scale.set(2.08, 1.92, 1.25);
    flameShell.position.set(0, 0, -0.6);
    fist.add(flameShell);
    const emberCount = matchMedia("(max-width:760px)").matches ? 160 : 420;
    const emberGeometry = new T.TetrahedronGeometry(0.034);
    const emberMaterial = new T.MeshBasicMaterial({ color: "#ff562e" });
    const embers = new T.InstancedMesh(
      emberGeometry,
      emberMaterial,
      emberCount
    );
    embers.frustumCulled = false;
    scene.add(embers);
    const dummy = new T.Object3D();
    const resize = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = element;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    });
    resize.observe(element);
    let x = 0,
      y = 0,
      spinX = 0,
      spinY = 0,
      vx = 0,
      vy = 0,
      drag = false,
      hover = false;
    let suppressClick = false;
    let travel = 0;
    let letterDrag = false;
    function move(event: PointerEvent) {
      const box = stage!.getBoundingClientRect();
      x = (event.clientX - box.left) / box.width - 0.5;
      y = (event.clientY - box.top) / box.height - 0.5;
      name?.hover(
        name.pick(
          event.clientX,
          event.clientY,
          element!.getBoundingClientRect()
        )
      );
      if (letterDrag) {
        name?.drag(
          event.clientX,
          event.clientY,
          element!.getBoundingClientRect()
        );
        return;
      }
      if (drag) {
        travel += Math.abs(event.movementX) + Math.abs(event.movementY);
        vx = event.movementY * 0.012;
        vy = event.movementX * 0.012;
        spinX += vx;
        spinY += vy;
      }
    }
    function down(event: PointerEvent) {
      const picked =
        name?.pick(
          event.clientX,
          event.clientY,
          element!.getBoundingClientRect()
        ) ?? -1;
      if (picked >= 0) {
        name?.grab(picked);
        letterDrag = true;
        button!.setPointerCapture(event.pointerId);
        return;
      }
      drag = true;
      travel = 0;
      button!.setPointerCapture(event.pointerId);
    }
    function up() {
      drag = false;
      suppressClick = letterDrag || travel > 7;
      name?.release();
      letterDrag = false;
    }
    function click(event: MouseEvent) {
      if (suppressClick && event.detail) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
      suppressClick = false;
    }
    function enter() {
      hover = true;
    }
    function leave() {
      hover = false;
      x = y = 0;
    }
    function lost(event: Event) {
      event.preventDefault();
      ready(false);
      renderer.setAnimationLoop(null);
    }
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
    button.addEventListener("pointerenter", enter);
    button.addEventListener("pointerleave", leave);
    button.addEventListener("click", click, true);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    let rendered = false;
    let pauseApplied = false;
    renderer.setAnimationLoop(ms => {
      if (
        document.hidden ||
        stage.getBoundingClientRect().bottom < 0 ||
        !element.clientWidth ||
        !element.clientHeight
      )
        return;

      const t = ms / 1000;
      if (pausedRef.current && rendered) {
        if (!pauseApplied) {
          name?.update(t, 0, 0.45, true);
          renderer.render(scene, camera);
          pauseApplied = true;
        }
        return;
      }
      pauseApplied = false;
      const charge = Number(stage.style.getPropertyValue("--charge")) || 0;
      const beat = Math.pow(1 - ((t * 1.5) % 1), 3);
      const shake = 0.009 + charge * 0.037;

      const heat = Number(stage.style.getPropertyValue("--heat")) || 0.45;
      const punchScale =
        Number(stage.style.getPropertyValue("--punch-scale")) || 1;
      fireLight.intensity = 12 + heat * 10;
      name?.update(t, charge, heat, pausedRef.current);
      fireMaterial.uniforms.time.value = t;
      fireMaterial.uniforms.heat.value = heat + charge * 0.4;
      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        flameDummy.position.set(
          Math.cos(angle) * 1.65,
          Math.sin(angle) * 1.1 - 0.1,
          -0.14
        );
        flameDummy.rotation.z = -Math.cos(angle) * 0.65;
        flameDummy.scale.set(
          0.55 + (i % 4) * 0.08,
          1.05 + heat * 0.42 + Math.sin(t * 3 + i) * 0.14,
          1
        );
        flameDummy.updateMatrix();
        flames.setMatrixAt(i, flameDummy.matrix);
      }
      flames.instanceMatrix.needsUpdate = true;
      skin.uniforms.beat.value = beat + charge * 0.6;
      skin.uniforms.boil.value = Math.floor(t * 10) % 8;
      if (!drag) {
        spinX = (spinX + vx) * 0.955;
        spinY = (spinY + vy) * 0.955;
        vx *= 0.84;
        vy *= 0.84;
      }
      fist.rotation.y = T.MathUtils.lerp(
        fist.rotation.y,
        -0.14 + x * 0.87 + spinY + Math.sin(t * 0.65) * 0.09,
        0.12
      );
      fist.rotation.x = T.MathUtils.lerp(
        fist.rotation.x,
        -0.11 + y * 0.52 + spinX,
        0.12
      );
      fist.rotation.z = Math.sin(t * 0.8) * 0.044;
      fist.position.y = Math.sin(t * 1.85) * 0.12 + Math.sin(t * 67) * shake;
      fist.position.x = Math.sin(t * 61) * shake;
      fist.scale.setScalar(
        (matchMedia("(max-width:760px)").matches ? 0.63 : 0.83) *
          (1 + beat * 0.04) *
          punchScale *
          (1 + charge)
      );
      for (const knuckle of parts)
        knuckle.scale.lerp(dummy.scale.setScalar(hover ? 1.065 : 1), 0.12);
      for (let i = 0; i < emberCount; i++) {
        const angle = i * 2.4 + t * (0.23 + (i % 6) * 0.12);
        const r = 2.2 + (i % 11) * 0.085;
        dummy.position.set(
          Math.cos(angle) * r,
          Math.sin(angle) * r * 0.77,
          Math.sin(i + t) * 1.5
        );
        dummy.rotation.set(angle, angle * 0.7, angle * 0.3);
        dummy.scale.setScalar(0.55 + (i % 8) * 0.15);
        dummy.updateMatrix();
        embers.setMatrixAt(i, dummy.matrix);
      }
      embers.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      if (!rendered && name && renderer.domElement.width > 1) {
        rendered = true;
        ready(true);
      }
    });
    return () => {
      disposed = true;
      name?.dispose();
      renderer.setAnimationLoop(null);
      resize.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
      button.removeEventListener("pointerdown", down);
      button.removeEventListener("pointerup", up);
      button.removeEventListener("pointercancel", up);
      button.removeEventListener("pointerenter", enter);
      button.removeEventListener("pointerleave", leave);
      button.removeEventListener("click", click, true);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      [
        sphere,
        rounded,
        segment,
        skin,
        ink,
        emberGeometry,
        emberMaterial,
        flameGeometry,
        fireMaterial,
      ].forEach(resource => resource.dispose());
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      ready(false);
    };
  }, [ready]);

  return <span className="fist-webgl" ref={host} aria-hidden="true" />;
}
