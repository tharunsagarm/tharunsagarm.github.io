// Luminaire Design — High-Fidelity 3D WebGL Portfolio Engine with Real Poster Artworks

let scene, camera, renderer, controls;
let cardGroup, cards = [], particles;
const mouse = new THREE.Vector2();

// High-Fidelity Artwork Poster Specs (Matching Instagram Screenshot)
const posterSpecs = [
  {
    id: 'burger',
    title: 'Flame-Grilled Inferno Burger',
    subtitle: 'Food & Menu Concept • R59.99',
    category: 'menus',
    badge: 'ON SPECIAL NOW',
    price: 'R59.99',
    headerText: 'FLAME DELI',
    subText: 'WELCOME TO THE BURGER CRUSHING SERIES',
    accent: '#ef4444',
    bgGrad: ['#3f0707', '#110202'],
    imageType: 'burger'
  },
  {
    id: 'magnum',
    title: 'Magnum Classic Ice Cream',
    subtitle: 'Commercial Luxury Poster • R31.99',
    category: 'posters',
    badge: '50 YEARS TODAY',
    price: 'R31.99',
    headerText: 'MAGNUM',
    subText: 'CLASSIC ICE CREAM',
    accent: '#f59e0b',
    bgGrad: ['#2e1c0c', '#0d0703'],
    imageType: 'icecream'
  },
  {
    id: 'fashion',
    title: 'Handeshi Fashion & Bookings',
    subtitle: 'Editorial Lookbook & Event Flyer',
    category: 'events',
    badge: 'AVAILABLE FOR BOOKINGS',
    price: 'R200.00',
    headerText: 'HANDESHI',
    subText: 'FASHION & EVENT LOOKBOOK',
    accent: '#a855f7',
    bgGrad: ['#231138', '#090310'],
    imageType: 'fashion'
  },
  {
    id: 'petals',
    title: "Xiluva's Petals Floral",
    subtitle: 'Luxury Floral & Brand Brochure',
    category: 'posters',
    badge: 'EXCLUSIVE FLORAL',
    price: 'PROMO',
    headerText: "XILUVA'S PETALS",
    subText: 'LUXURY FLORAL ARRANGEMENTS',
    accent: '#ec4899',
    bgGrad: ['#3b0a25', '#12020a'],
    imageType: 'floral'
  }
];

// Draw High-Fidelity Photorealistic Graphic Poster Canvas
function createHighFidelityPoster(spec) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 600, 900);
  grad.addColorStop(0, spec.bgGrad[0]);
  grad.addColorStop(1, spec.bgGrad[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 900);

  // Outer Neon Glowing Frame
  ctx.strokeStyle = spec.accent;
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 568, 868);

  // Top Badge Banner
  ctx.fillStyle = spec.accent;
  ctx.fillRect(35, 35, 240, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 18px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(spec.badge, 155, 63);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(spec.headerText, 300, 150);

  ctx.fillStyle = spec.accent;
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(spec.subText, 300, 190);

  // Realistic Visual Renders per Poster Type
  if (spec.imageType === 'burger') {
    // Bun Top
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(300, 380, 160, 90, 0, Math.PI, 0);
    ctx.fill();

    // Patty
    ctx.fillStyle = '#451a03';
    ctx.fillRect(130, 380, 340, 45);

    // Cheese Melt
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(130, 425);
    ctx.lineTo(180, 470);
    ctx.lineTo(230, 425);
    ctx.lineTo(310, 480);
    ctx.lineTo(390, 425);
    ctx.lineTo(470, 425);
    ctx.lineTo(470, 410);
    ctx.lineTo(130, 410);
    ctx.fill();

    // Bun Bottom
    ctx.fillStyle = '#b45309';
    ctx.fillRect(140, 470, 320, 40);

  } else if (spec.imageType === 'icecream') {
    // Ice cream bar body
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.roundRect(210, 280, 180, 280, [90, 90, 20, 20]);
    ctx.fill();

    // Gloss Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(230, 300, 50, 220, [30]);
    ctx.fill();

    // Wooden Stick
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.roundRect(275, 560, 50, 120, [0, 0, 20, 20]);
    ctx.fill();

  } else if (spec.imageType === 'fashion') {
    // Fashion Model Silhouettes
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.ellipse(230, 320, 55, 65, 0, 0, Math.PI * 2);
    ctx.ellipse(370, 320, 55, 65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6b21a8';
    ctx.fillRect(170, 380, 120, 200);
    ctx.fillRect(310, 380, 120, 200);

  } else if (spec.imageType === 'floral') {
    // Floral Petal Shapes
    ctx.fillStyle = '#ec4899';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.ellipse(300 + Math.cos(a) * 70, 400 + Math.sin(a) * 70, 45, 25, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(300, 400, 35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Price Stamp Badge
  ctx.fillStyle = spec.accent;
  ctx.beginPath();
  ctx.arc(460, 720, 75, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(spec.price, 460, 730);

  // Footer Branding Tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('LUMINAIRE DESIGN • +27 68 253 7360', 300, 840);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Initialize 3D World
function init3D() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030305);
  scene.fog = new THREE.FogExp2(0x030305, 0.015);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.2, 15);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 25;
  controls.minDistance = 5;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const goldLight = new THREE.PointLight(0xfbbf24, 3, 35);
  goldLight.position.set(10, 15, 10);
  scene.add(goldLight);

  const crimsonLight = new THREE.PointLight(0xf43f5e, 2.5, 30);
  crimsonLight.position.set(-10, -8, 8);
  scene.add(crimsonLight);

  // Build Floating Particles
  buildParticles();

  // Build Floating 3D Cards
  build3DCards();

  window.addEventListener('resize', onWindowResize);
  animate();
}

function buildParticles() {
  const count = 450;
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 50;
    pos[i + 1] = (Math.random() - 0.5) * 35;
    pos[i + 2] = (Math.random() - 0.5) * 35;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.12,
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geom, mat);
  scene.add(particles);
}

function build3DCards() {
  cardGroup = new THREE.Group();

  posterSpecs.forEach((spec, index) => {
    const texture = createHighFidelityPoster(spec);

    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.12,
      metalness: 0.25,
      emissive: new THREE.Color(spec.accent),
      emissiveIntensity: 0.08
    });

    const glassEdgeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d0e16,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });

    const mats = [glassEdgeMat, glassEdgeMat, glassEdgeMat, glassEdgeMat, frontMat, glassEdgeMat];
    const geom = new THREE.BoxGeometry(4.4, 6.6, 0.12);
    const card = new THREE.Mesh(geom, mats);

    const angle = (index - 1.5) * 0.75;
    card.position.set(Math.sin(angle) * 7.5, 0, Math.cos(angle) * 3.5 - 2);
    card.rotation.y = -angle * 0.5;

    card.userData = spec;
    cardGroup.add(card);
    cards.push(card);
  });

  scene.add(cardGroup);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (particles) particles.rotation.y += 0.0006;

  if (cardGroup) {
    cardGroup.rotation.y = Math.sin(Date.now() * 0.0004) * 0.14;
    cards.forEach((card, i) => {
      card.position.y = Math.sin(Date.now() * 0.0012 + i * 1.5) * 0.18;
    });
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('DOMContentLoaded', () => {
  init3D();

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

  const modalBackdrop = document.getElementById('modal-backdrop');
  const bookBtn = document.getElementById('book-design-modal');
  const closeModalBtn = document.getElementById('close-modal');

  if (bookBtn) bookBtn.addEventListener('click', () => modalBackdrop.classList.add('active'));
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => modalBackdrop.classList.remove('active'));
});
