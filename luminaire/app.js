// Luminaire Design — Ultra-Premium Awwwards-Level 3D WebGL Portfolio Engine

let scene, camera, renderer, controls;
let cardGroup, cards = [], particles;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Visual Poster Data with Procedural High-Res Canvas Textures
const posterData = [
  {
    id: 'burger',
    title: 'Flame-Grilled Inferno Burger',
    subtitle: 'Special Menu Promo Ad • R59.99',
    category: 'menus',
    bgColor: '#180202',
    accentColor: '#ef4444',
    tag: 'R59.99',
    text1: 'FLAME DELI',
    text2: 'INFERNO BURGER',
    icon: '🍔'
  },
  {
    id: 'magnum',
    title: 'Magnum Classic Ice Cream',
    subtitle: 'Commercial Luxury Poster • R31.99',
    category: 'posters',
    bgColor: '#1c1305',
    accentColor: '#f59e0b',
    tag: 'R31.99',
    text1: 'MAGNUM',
    text2: 'CLASSIC BAR',
    icon: '🍦'
  },
  {
    id: 'fashion',
    title: 'Handeshi Fashion & Bookings',
    subtitle: 'Editorial Lookbook & Event Flyer',
    category: 'events',
    bgColor: '#130c1e',
    accentColor: '#a855f7',
    tag: 'BOOKINGS',
    text1: 'HANDESHI',
    text2: 'LOOKBOOK 2026',
    icon: '✨'
  },
  {
    id: 'petals',
    title: "Xiluva's Petals Floral",
    subtitle: 'Luxury Floral & Brand Brochure',
    category: 'posters',
    bgColor: '#1f0714',
    accentColor: '#ec4899',
    tag: 'FLORAL',
    text1: "XILUVA'S",
    text2: 'PETALS DESIGN',
    icon: '🌸'
  }
];

// 1. Generate High-Res Procedural Artwork Canvas Textures
function createPosterTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, data.bgColor);
  grad.addColorStop(1, '#09090b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  // Decorative Border
  ctx.strokeStyle = data.accentColor;
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, 472, 728);

  // Top Header Tag
  ctx.fillStyle = data.accentColor;
  ctx.fillRect(40, 50, 160, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Outfit", sans-serif';
  ctx.fillText('LUMINAIRE', 55, 77);

  // Large Central Icon Graphic
  ctx.font = '120px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.icon, 256, 320);

  // Main Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px "Outfit", sans-serif';
  ctx.fillText(data.text1, 256, 460);

  ctx.fillStyle = data.accentColor;
  ctx.font = '700 24px "Outfit", sans-serif';
  ctx.fillText(data.text2, 256, 500);

  // Price Tag Badge
  ctx.fillStyle = data.accentColor;
  ctx.beginPath();
  ctx.arc(256, 620, 55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Outfit", sans-serif';
  ctx.fillText(data.tag, 256, 628);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 2. Initialize 3D WebGL World
function init3D() {
  const container = document.getElementById('canvas-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050508);
  scene.fog = new THREE.FogExp2(0x050508, 0.018);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 16);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 28;
  controls.minDistance = 6;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;

  // Ambient & Dynamic Point Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const goldSpot = new THREE.PointLight(0xf59e0b, 3.5, 40);
  goldSpot.position.set(12, 18, 12);
  scene.add(goldSpot);

  const crimsonSpot = new THREE.PointLight(0xe11d48, 3, 35);
  crimsonSpot.position.set(-12, -8, 10);
  scene.add(crimsonSpot);

  // 3D Particles Ambient Dust
  buildParticles();

  // Floating 3D Artwork Cards
  build3DCards();

  // Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('pointermove', onPointerMove);

  // Start Render Loop
  animate();
}

// 3. Ambient 3D Glowing Dust Particles
function buildParticles() {
  const particleCount = 400;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 60;
    positions[i + 1] = (Math.random() - 0.5) * 40;
    positions[i + 2] = (Math.random() - 0.5) * 40;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: 0.12,
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

// 4. Build 3D Floating Artwork Cards Arc
function build3DCards() {
  cardGroup = new THREE.Group();

  posterData.forEach((data, index) => {
    const texture = createPosterTexture(data);

    // Front Material (Artwork Texture)
    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.15,
      metalness: 0.3,
      emissive: new THREE.Color(data.accentColor),
      emissiveIntensity: 0.1
    });

    // Back & Sides Material (Dark Glass Specular)
    const sideMat = new THREE.MeshPhysicalMaterial({
      color: 0x12141d,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat];
    const geometry = new THREE.BoxGeometry(4.2, 6.3, 0.12);

    const cardMesh = new THREE.Mesh(geometry, materials);

    // Arrange in semi-circle arc
    const angle = (index - 1.5) * 0.75;
    cardMesh.position.set(Math.sin(angle) * 7.5, 0, Math.cos(angle) * 3.5 - 2);
    cardMesh.rotation.y = -angle * 0.5;

    cardMesh.userData = data;
    cardGroup.add(cardMesh);
    cards.push(cardMesh);
  });

  scene.add(cardGroup);
}

// 5. Pointer Hover Effect
function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// 6. Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Particles drift
  if (particles) {
    particles.rotation.y += 0.0005;
  }

  // Smooth floating motion
  if (cardGroup) {
    cardGroup.rotation.y = Math.sin(Date.now() * 0.0003) * 0.12;

    cards.forEach((card, i) => {
      card.position.y = Math.sin(Date.now() * 0.001 + i * 1.5) * 0.18;
    });
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// UI Interactions
document.addEventListener('DOMContentLoaded', () => {
  init3D();

  // Category Filter Buttons
  const filterBtns = document.querySelectorAll('.btn-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.category;
      cards.forEach(card => {
        if (cat === 'all' || card.userData.category === cat) {
          gsap.to(card.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(1.7)" });
        } else {
          gsap.to(card.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 0.4 });
        }
      });
    });
  });

  // Sidebar List Selection
  const itemCards = document.querySelectorAll('.item-card');
  itemCards.forEach(card => {
    card.addEventListener('click', () => {
      itemCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const itemId = card.dataset.item;
      const targetMesh = cards.find(c => c.userData.id === itemId);

      if (targetMesh) {
        gsap.to(camera.position, {
          x: targetMesh.position.x,
          y: targetMesh.position.y + 0.3,
          z: targetMesh.position.z + 7.5,
          duration: 1.4,
          ease: "power2.inOut"
        });
      }
    });
  });

  // Modal Dialog Listeners
  const modalBackdrop = document.getElementById('modal-backdrop');
  const bookBtn = document.getElementById('book-design-modal');
  const closeModalBtn = document.getElementById('close-modal');

  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      modalBackdrop.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });
  }
});
