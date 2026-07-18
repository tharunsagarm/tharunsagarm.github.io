// Luminaire Design — 3D Visual Portfolio & Booking Engine

let scene, camera, renderer, controls;
let cardGroup, cards = [];

// Visual Showcase Data Items (From Luminaire Design Instagram Feed)
const visualItems = [
  { id: 'burger', title: 'Flame-Grilled Inferno Burger', category: 'menus', color: 0xe11d48, sub: 'Food Ad & Menu Concept' },
  { id: 'magnum', title: 'Magnum Classic Ice Cream', category: 'posters', color: 0xf59e0b, sub: 'Commercial Poster Visual' },
  { id: 'fashion', title: 'Handeshi Fashion & Bookings', category: 'events', color: 0x9333ea, sub: 'Model & Booking Flyer' },
  { id: 'petals', title: "Xiluva's Petals Floral", category: 'posters', color: 0xec4899, sub: 'Brand & Floral Brochure' }
];

function init3D() {
  const container = document.getElementById('canvas-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x09090b);
  scene.fog = new THREE.FogExp2(0x09090b, 0.02);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 18);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 30;
  controls.minDistance = 8;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const spotLight = new THREE.PointLight(0xf59e0b, 3, 30);
  spotLight.position.set(10, 15, 10);
  scene.add(spotLight);

  const crimsonLight = new THREE.PointLight(0xe11d48, 2, 25);
  crimsonLight.position.set(-10, -5, 10);
  scene.add(crimsonLight);

  // Build Floating 3D Artwork Showcase Cards
  build3DCards();

  // Window Resize
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
}

function build3DCards() {
  cardGroup = new THREE.Group();

  visualItems.forEach((item, index) => {
    // 3D Canvas Artwork Mesh Card
    const geometry = new THREE.BoxGeometry(4.5, 6, 0.15);
    const material = new THREE.MeshStandardMaterial({
      color: item.color,
      roughness: 0.2,
      metalness: 0.4,
      emissive: item.color,
      emissiveIntensity: 0.15
    });

    const cardMesh = new THREE.Mesh(geometry, material);
    
    // Position cards in a floating 3D arc
    const angle = (index - 1.5) * 0.7;
    cardMesh.position.set(Math.sin(angle) * 8, 0, Math.cos(angle) * 4 - 2);
    cardMesh.rotation.y = -angle * 0.6;
    
    cardMesh.userData = item;
    cardGroup.add(cardMesh);
    cards.push(cardMesh);
  });

  scene.add(cardGroup);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Gentle 3D floating animation
  if (cardGroup) {
    cardGroup.rotation.y = Math.sin(Date.now() * 0.0004) * 0.15;
    cards.forEach((card, i) => {
      card.position.y = Math.sin(Date.now() * 0.001 + i) * 0.2;
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

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.btn-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.category;
      cards.forEach(card => {
        if (cat === 'all' || card.userData.category === cat) {
          gsap.to(card.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
        } else {
          gsap.to(card.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.5 });
        }
      });
    });
  });

  // Item Cards Click Listener
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
          y: targetMesh.position.y + 0.5,
          z: targetMesh.position.z + 8,
          duration: 1.5,
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
