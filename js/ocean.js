import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { Water } from 'https://threejs.org/examples/jsm/objects/Water.js';
import { Sky } from 'https://threejs.org/examples/jsm/objects/Sky.js';
import { CCDIKSolver, CCDIKHelper } from 'https://threejs.org/examples/jsm/animation/CCDIKSolver.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

function SceneManager(canvas) {
    const scene = buildScene();
    const renderer = buildRenderer(canvas);
    const camera = buildCamera();
    const sphere = buildSphere();
    const sky = buildSky();
    const sun = buildSun();
    const water = buildWater();
    const orbitCon = setOrbitControls();
    let character = null;
    let ikSolver = null;

    async function loadCharacter() {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('models/character.glb');
        character = gltf.scene;

        // Setup IK system
        const iks = [{
            target: 0, // Target bone index
            effector: 1, // Effector bone index
            links: [{
                index: 2,
                rotationMin: new THREE.Vector3(-Math.PI, 0, 0),
                rotationMax: new THREE.Vector3(Math.PI, 0, 0)
            }]
        }];

        ikSolver = new CCDIKSolver(character, iks);
        const ikHelper = new CCDIKHelper(character, iks, 0.01);
        scene.add(ikHelper);
        scene.add(character);
    }

    function buildScene() {
        const scene = new THREE.Scene();
        return scene;
    }

    function buildRenderer(canvas) {
        const renderer = new THREE.WebGLRenderer({canvas: canvas});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        return renderer;
    }

    function buildCamera() {
        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
        camera.position.set(30, 30, 100);
        return camera;
    }

    function buildSphere() {
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        return sphere;
    }

    function buildSky() {
        const sky = new Sky();
        sky.scale.setScalar(10000);
        scene.add(sky);
        return sky;
    }

    function buildSun() {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const sun = new THREE.Vector3();
        
        const phi = THREE.MathUtils.degToRad(88);
        const theta = THREE.MathUtils.degToRad(180);
        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        scene.environment = pmremGenerator.fromScene(sky).texture;
        
        return sun;
    }

    function buildWater() {
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
        const water = new Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function(texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
        });
        water.rotation.x = -Math.PI / 2;
        scene.add(water);
        return water;
    }

    function setOrbitControls() {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.minDistance = 40.0;
        controls.maxDistance = 200.0;
        controls.target.set(0, 10, 0);
        controls.update();
        return controls;
    }

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    this.update = function() {
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

        const time = performance.now() * 0.001;
        sphere.position.y = Math.sin( time ) * 2;
        sphere.rotation.x = time * 0.3;
        sphere.rotation.z = time * 0.3;

        if (ikSolver) {
            ikSolver.update();
        }
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    // Initialize character
    loadCharacter();
}

const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

function animate() {
    requestAnimationFrame(animate);
    sceneManager.update();
}
animate();
