import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertex = `
varying vec3 point;
varying vec3 normalView;
void main() {
  point = position;
  normalView = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;
const fragment = `
varying vec3 point;
varying vec3 normalView;
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
float noise(vec3 p) {
  vec3 i=floor(p), f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
  mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
void main() {
  vec3 p = normalize(point);
  float land = .63*noise(p*3.)+.25*noise(p*7.)+.12*noise(p*18.);
  float cloud = smoothstep(.53,.77, noise(p*9.)*.75+noise(p*25.)*.25);
  vec3 ocean = mix(vec3(.012,.07,.21),vec3(.05,.39,.75),smoothstep(.25,.55,land));
  vec3 ground = mix(vec3(.13,.30,.22),vec3(.60,.62,.40),smoothstep(.54,.73,land));
  vec3 color = mix(ocean,ground,smoothstep(.53,.55,land));
  color = mix(color, vec3(.84,.93,1.),cloud*.74);
  float light = smoothstep(-.32,.65,dot(normalView,normalize(vec3(-.56,.75,.8))));
  float rim = pow(1.-max(normalView.z,0.),3.);
  gl_FragColor=vec4(color*(.19+.91*light)+rim*vec3(.1,.42,.81)*(.3+.7*light),1.);
}`;

function World({ hit, hunter, punch }: { hit: number; hunter: boolean; punch: () => void }) {
  const earth = useRef<THREE.Mesh>(null);
  const stars = useRef<THREE.Points>(null);
  const hero = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const lastHit = useRef(0);
  const age = useRef(3);
  const positions = useMemo(() => Float32Array.from({length: 5100}, (_, i) => {
    const r = Math.sin(i * 748.13) * 13758.5453;
    return (r - Math.floor(r) - .5) * (i % 3 === 2 ? 21 : 45);
  }), []);
  useFrame(({ clock, pointer, camera }, dt) => {
    const t = clock.elapsedTime;
    if (lastHit.current !== hit) { lastHit.current = hit; age.current = 0; }
    age.current += dt;
    const kick = Math.max(0, 1 - age.current * 2);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * .24 + Math.sin(t * 85) * kick * .12, .06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * .15, .06);
    if (earth.current) {
      earth.current.rotation.y += dt * .15;
      earth.current.scale.setScalar(1 - kick * .08);
    }
    if (hero.current) { hero.current.position.y = -2.55 + Math.sin(t * 1.7) * .045; hero.current.rotation.z = Math.sin(t) * .012; }
    if (stars.current) stars.current.rotation.z = t * .014;
    if (ring.current) {
      ring.current.visible = age.current < .8;
      ring.current.scale.setScalar(.7 + age.current * 7);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - age.current * 1.25);
    }
  });
  return <>
    <ambientLight intensity={1.45} /><directionalLight position={[-2, 5, 5]} intensity={2.2} color="#d3e4ff"/>
    <points ref={stars}><bufferGeometry><bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3}/></bufferGeometry><pointsMaterial color={hunter ? "#bf9cff" : "#cbe8ff"} size={.035} transparent opacity={.82}/></points>
    <group position={[1.55, 1.25, -1.5]}>
      <mesh ref={earth} onClick={punch}><sphereGeometry args={[1.95,64,48]}/><shaderMaterial vertexShader={vertex} fragmentShader={fragment}/></mesh>
      <mesh ref={ring} position={[0,0,2]}><ringGeometry args={[.88,1,80]}/><meshBasicMaterial color="#a5e8ff" transparent depthWrite={false}/></mesh>
    </group>
    <group ref={hero} position={[1.8,-2.55,1]}>
      <mesh position={[0,1.14,0]} scale={[.64,.72,.58]}><sphereGeometry args={[1,32,24]}/><meshStandardMaterial color={hunter ? "#c3b4d9" : "#d5a681"} roughness={.9}/></mesh>
      <mesh scale={[1.46,.97,.49]}><sphereGeometry args={[1,32,24]}/><meshStandardMaterial color="#111728"/></mesh>
      <mesh position={[0,.44,.25]} rotation={[.18,0,0]} scale={[1,.65,1]}><torusGeometry args={[.66,.073,12,44]}/><meshStandardMaterial color="#e5e8ee"/></mesh>
      <mesh position={[.8,-.53,.3]} rotation={[.15,0,.29]}><coneGeometry args={[.55,1.9,4]}/><meshStandardMaterial color="#dce5f6"/></mesh>
    </group>
  </>;
}
export default function Scene(props: { hit: number; hunter: boolean; punch: () => void }) {
  return <div className="scene" aria-hidden="true"><Canvas dpr={[1,1.5]} camera={{position:[0,0,8],fov:48}}><color attach="background" args={[props.hunter ? "#11091e" : "#050814"]}/><World {...props}/></Canvas></div>;
}
