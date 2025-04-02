let scene, camera, renderer, waterSystem;
const particles = [];

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    const container = document.getElementById('modelView');
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create water pipe
    createWaterSystem();

    // Add controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Hide loading indicator
    document.getElementById('loadingIndicator').style.display = 'none';

    // Start animation
    animate();
}

function createWaterSystem() {
    // Create pipe
    const pipeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32, 1, true);
    const pipeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x808080,
        transparent: true,
        opacity: 0.3,
        roughness: 0.2,
        metalness: 0.8
    });
    waterSystem = new THREE.Mesh(pipeGeometry, pipeMaterial);
    scene.add(waterSystem);

    // Create water particles
    const particleCount = 200;
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2
    });

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        resetParticle(particle);
        particles.push(particle);
        scene.add(particle);
    }
}

function resetParticle(particle) {
    particle.position.y = Math.random() * 4 - 2;
    particle.position.x = (Math.random() - 0.5) * 0.3;
    particle.position.z = (Math.random() - 0.5) * 0.3;
}

function animate() {
    requestAnimationFrame(animate);

    // Update particles
    const flowRate = document.getElementById('flowRate').value;
    particles.forEach(particle => {
        particle.position.y -= (flowRate / 1000) * 2;
        if (particle.position.y < -2) {
            resetParticle(particle);
        }
    });

    // Update pressure display
    document.getElementById('pressureValue').textContent = 
        `${(flowRate / 25).toFixed(1)} bar`;

    renderer.render(scene, camera);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

window.addEventListener('resize', () => {
    const container = document.getElementById('modelView');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Control panel functionality
document.getElementById('qualitySelector').addEventListener('change', (e) => {
    const colors = {
        excellent: 0x00aaff,
        moderate: 0xffaa00,
        poor: 0xff0000
    };
    particles.forEach(particle => {
        particle.material.color.setHex(colors[e.target.value]);
    });
});

document.getElementById('cameraLeft').addEventListener('click', () => {
    waterSystem.rotation.y += 0.5;
});

document.getElementById('cameraRight').addEventListener('click', () => {
    waterSystem.rotation.y -= 0.5;
});

document.getElementById('cameraReset').addEventListener('click', () => {
    waterSystem.rotation.y = 0;
});
