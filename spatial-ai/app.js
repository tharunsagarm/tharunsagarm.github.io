// Spatial AI 3D WebGL Scene & AI Lead Agent Engine

let scene, camera, renderer, controls;
let villaGroup, mainLights, ambientLight, sunLight;

// 1. Initialize Three.js 3D Scene
function init3D() {
  const container = document.getElementById('canvas-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x09090b);
  scene.fog = new THREE.FogExp2(0x09090b, 0.015);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(22, 14, 26);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // Orbit Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below floor
  controls.minDistance = 10;
  controls.maxDistance = 60;

  // Lights
  ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
  sunLight.position.set(20, 40, 15);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  // Build Procedural Modern Villa
  buildModernVilla();

  // Resize Listener
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
}

// 2. Build Procedural 3D Architectural Villa Model
function buildModernVilla() {
  villaGroup = new THREE.Group();

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.1 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6, metalness: 0.1 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, roughness: 0.1, transmission: 0.9, thickness: 0.5 });
  const poolMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, metalness: 0.8, emissive: 0x0284c7, emissiveIntensity: 0.2 });
  const lawnMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 });

  // Ground Lawn Base
  const lawn = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 60), lawnMat);
  lawn.position.y = -0.2;
  lawn.receiveShadow = true;
  villaGroup.add(lawn);

  // Main Concrete Foundation Structure
  const baseBox = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 12), concreteMat);
  baseBox.position.set(0, 2.5, 0);
  baseBox.castShadow = true;
  baseBox.receiveShadow = true;
  villaGroup.add(baseBox);

  // Upper Floating Cantilever Box (Wood Accent)
  const upperBox = new THREE.Mesh(new THREE.BoxGeometry(18, 4.5, 10), woodMat);
  upperBox.position.set(2, 7.25, -1);
  upperBox.castShadow = true;
  upperBox.receiveShadow = true;
  villaGroup.add(upperBox);

  // Glass Front Facade
  const glassFacade = new THREE.Mesh(new THREE.BoxGeometry(15.8, 4.5, 0.2), glassMat);
  glassFacade.position.set(0, 2.5, 6.05);
  villaGroup.add(glassFacade);

  // Infinity Pool
  const pool = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 8), poolMat);
  pool.position.set(-2, 0.05, 12);
  villaGroup.add(pool);

  // Pool Deck Surround
  const deck = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 12), concreteMat);
  deck.position.set(-2, 0.01, 12);
  deck.receiveShadow = true;
  villaGroup.add(deck);

  // Interior Warm Glow Spotlights
  const interiorLight = new THREE.PointLight(0xf59e0b, 3, 20);
  interiorLight.position.set(0, 3, 2);
  villaGroup.add(interiorLight);

  scene.add(villaGroup);
}

// 3. Lighting Presets (Day, Sunset, Night)
function setLightingPreset(preset) {
  if (preset === 'day') {
    gsap.to(scene.background, { r: 9/255, g: 9/255, b: 11/255, duration: 1.5 });
    gsap.to(ambientLight, { intensity: 0.8, duration: 1.5 });
    gsap.to(sunLight, { intensity: 2.5, duration: 1.5 });
    sunLight.color.setHex(0xfff5ea);
    sunLight.position.set(20, 40, 15);
  } else if (preset === 'sunset') {
    gsap.to(scene.background, { r: 24/255, g: 15/255, b: 24/255, duration: 1.5 });
    gsap.to(ambientLight, { intensity: 0.5, duration: 1.5 });
    gsap.to(sunLight, { intensity: 3.0, duration: 1.5 });
    sunLight.color.setHex(0xf97316); // Golden orange
    sunLight.position.set(30, 8, 5);
  } else if (preset === 'night') {
    gsap.to(scene.background, { r: 4/255, g: 4/255, b: 8/255, duration: 1.5 });
    gsap.to(ambientLight, { intensity: 0.2, duration: 1.5 });
    gsap.to(sunLight, { intensity: 0.4, duration: 1.5 });
    sunLight.color.setHex(0x38bdf8); // Moonlight blue
    sunLight.position.set(-15, 30, -15);
  }
}

// 4. Camera View Transitions
function moveCameraTo(viewName) {
  if (viewName === 'hero' || viewName === 'day') {
    gsap.to(camera.position, { x: 22, y: 14, z: 26, duration: 2, ease: "power2.inOut" });
  } else if (viewName === 'pool') {
    gsap.to(camera.position, { x: -2, y: 5, z: 22, duration: 2, ease: "power2.inOut" });
  } else if (viewName === 'bedroom' || viewName === 'upper') {
    gsap.to(camera.position, { x: 8, y: 10, z: 12, duration: 2, ease: "power2.inOut" });
  }
}

// 5. Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Gentle villa idle hover
  if (villaGroup) {
    villaGroup.rotation.y = Math.sin(Date.now() * 0.0003) * 0.08;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 6. Interactive AI Lead Agent Logic
document.addEventListener('DOMContentLoaded', () => {
  init3D();

  // Preset Button Listeners
  const presetBtns = document.querySelectorAll('.btn-preset');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setLightingPreset(btn.dataset.preset);
    });
  });

  // AI Drawer Logic
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');

  function handleUserMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Append User Message
    appendMessage(text, 'user');
    userInput.value = '';

    // Process Gemini AI Function Call Intent
    setTimeout(() => {
      processSpatialIntent(text);
    }, 600);
  }

  sendBtn.addEventListener('click', handleUserMessage);
  userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleUserMessage(); });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'message-user' : 'message-ai');
    msgDiv.innerHTML = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Gemini AI Function Calling Processor
  function processSpatialIntent(input) {
    const lower = input.toLowerCase();

    if (lower.includes('sunset')) {
      setLightingPreset('sunset');
      appendMessage('I have switched the 3D scene to Golden Hour Sunset mood! Would you like to check the infinity pool view next?', 'ai');
    } else if (lower.includes('night')) {
      setLightingPreset('night');
      appendMessage('Night lighting activated with interior accent spotlights! Anything else I can adjust for you?', 'ai');
    } else if (lower.includes('pool')) {
      moveCameraTo('pool');
      appendMessage('Moved camera to the Infinity Pool deck. The pool features built-in hydro-heating and ambient LED glow.', 'ai');
    } else if (lower.includes('book') || lower.includes('viewing') || lower.includes('appointment')) {
      appendMessage('I would be delighted to schedule a private viewing of Aura Villa for you! What is your preferred day and phone number?', 'ai');
    } else {
      setLightingPreset('day');
      moveCameraTo('hero');
      appendMessage(`I understand you're interested in "${input}". I have reset the 3D camera to the main view. Would you like to schedule a viewing appointment?`, 'ai');
    }
  }
});
