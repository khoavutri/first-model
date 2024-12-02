import * as THREE from "three";

const canvas: any = document.getElementById("canvas");
const width = 512;
const height = 512;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
//cube
const geometry = new THREE.BoxGeometry();
const materials = [
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  new THREE.MeshBasicMaterial({ color: 0x0000ff }),
  new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  new THREE.MeshBasicMaterial({ color: 0xff00ff }),
  new THREE.MeshBasicMaterial({ color: 0x00ffff }),
];
const cube = new THREE.Mesh(geometry, materials);
cube.castShadow = true;
scene.add(cube);

//plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x888888,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2 + 1;
plane.position.y = -2;
plane.receiveShadow = true;
scene.add(plane);

const clock = new THREE.Clock();
const mixer = new THREE.AnimationMixer(cube);

const rotationXTrack = new THREE.KeyframeTrack(
  ".rotation[x]",
  [0, 1, 2],
  [0, Math.PI, Math.PI * 2]
);

const rotationYTrack = new THREE.KeyframeTrack(
  ".rotation[y]",
  [0, 1, 2],
  [0, Math.PI, Math.PI * 2]
);

const rotationZTrack = new THREE.KeyframeTrack(
  ".rotation[z]",
  [0, 1, 2],
  [0, Math.PI, Math.PI * 2]
);

const clip = new THREE.AnimationClip("rotate", 2, [
  rotationXTrack,
  rotationYTrack,
  rotationZTrack,
]);

const action = mixer.clipAction(clip);
action.timeScale = 0.6;
action.time = 0;
action.play();

camera.position.z = 5;

function animate() {
  const delta = clock.getDelta();
  mixer.update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

animate();

(document.getElementById("play-stop") as any).addEventListener("click", () => {
  action.paused = !action.paused;
});
