let scene, camera, renderer, model;

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    const canvas = document.getElementById('modelCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Load model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'models/your-3d-model.gltf', // Replace with your model path
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            document.getElementById('loadingIndicator').style.display = 'none';
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened:', error);
            document.getElementById('loadingIndicator').innerHTML = 'Error loading model';
        }
    );

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.005;
    }
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
