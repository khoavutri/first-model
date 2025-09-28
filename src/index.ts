import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('container') as HTMLDivElement;
const width = 600, height = 500;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xd4b9ff, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(2, 5, 2);
dir.castShadow = true;
scene.add(dir);

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader(draco);

let mixer: THREE.AnimationMixer | null = null;
const clock = new THREE.Clock();

function frameObject(camera: THREE.PerspectiveCamera, object: THREE.Object3D) {
  const bbox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bbox.getSize(size);
  bbox.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const aspect = camera.aspect;

  const distV = (maxDim / 2) / Math.tan(fov / 2) * 1.2;
  const horizFOV = 2 * Math.atan(Math.tan(fov / 2) * aspect);
  const distH = (maxDim / 2) / Math.tan(horizFOV / 2) * 1.2;
  const dist = Math.max(distV, distH);

  const dirVec = new THREE.Vector3(1, 1, 1).normalize();
  camera.position.copy(center.clone().add(dirVec.multiplyScalar(dist)));
  camera.near = Math.max(0.01, dist / 100);
  camera.far = dist * 10;
  camera.updateProjectionMatrix();
  camera.lookAt(center);

  object.position.sub(center);

  if ((controls as any)?.target) {
    controls.target.set(0, 0, 0);
    controls.update();
  }
}

loader.load(
  'public/level-react-draco.glb',
  (gltf) => {
    const model = gltf.scene;
    model.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        console.log(obj);
      }
    });

    scene.add(model);

    frameObject(camera, model);
  },
  undefined,
  (err) => {
    console.error('Load GLB failed:', err);
  }
);

function onResize() {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
addEventListener('resize', onResize);

function animate() {
  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
