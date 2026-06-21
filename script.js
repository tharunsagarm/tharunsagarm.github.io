/* ============================================
   THARUN SAGAR PORTFOLIO — SCRIPT.JS
   3D Animations, Particles, Interactions
   ============================================ */

// ---- DOM READY ----
document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. LOADER
  // ============================================
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
    startHeroAnimations();
  }, 2000);

  // ============================================
  // 2. CUSTOM CURSOR
  // ============================================
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Smooth follower
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effects
  const hoverEls = document.querySelectorAll('a, button, .service-card, .work-card, .filter-btn');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      cursorFollower.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      cursorFollower.classList.remove('active');
    });
  });

  // ============================================
  // 3. NAVBAR SCROLL
  // ============================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close nav on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ============================================
  // 4. THREE.JS HERO PARTICLE CANVAS
  // ============================================
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Particles
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Cherry Red + soft gray on white background
      const rand = Math.random();
      if (rand > 0.75) {
        // Cherry Red
        colors[i3] = 0.86;
        colors[i3 + 1] = 0.08;
        colors[i3 + 2] = 0.24;
      } else if (rand > 0.5) {
        // Light cherry pink
        colors[i3] = 0.95;
        colors[i3 + 1] = 0.5;
        colors[i3 + 2] = 0.6;
      } else {
        // Soft gray
        colors[i3] = 0.75;
        colors[i3 + 1] = 0.75;
        colors[i3 + 2] = 0.75;
      }
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animated lines (connections)
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = [];
    for (let i = 0; i < 60; i++) {
      const x1 = (Math.random() - 0.5) * 16;
      const y1 = (Math.random() - 0.5) * 16;
      const z1 = (Math.random() - 0.5) * 8;
      const x2 = x1 + (Math.random() - 0.5) * 4;
      const y2 = y1 + (Math.random() - 0.5) * 4;
      linePositions.push(x1, y1, z1, x2, y2, z1);
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xDC143C, opacity: 0.12, transparent: true });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Mouse interaction
    let mouseInfluence = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
      mouseInfluence.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      mouseInfluence.y = -(e.clientY / window.innerHeight - 0.5) * 0.5;
    });

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animate
    function animate() {
      requestAnimationFrame(animate);
      const t = Date.now() * 0.0003;
      particles.rotation.y = t * 0.2 + mouseInfluence.x;
      particles.rotation.x = t * 0.1 + mouseInfluence.y;
      lines.rotation.y = t * 0.1;
      lines.rotation.x = t * 0.05;
      renderer.render(scene, camera);
    }
    animate();
  }

  // Wait for Three.js
  if (typeof THREE !== 'undefined') {
    initHeroCanvas();
  } else {
    const checkThree = setInterval(() => {
      if (typeof THREE !== 'undefined') {
        clearInterval(checkThree);
        initHeroCanvas();
      }
    }, 100);
  }

  // ============================================
  // 5. HERO ANIMATIONS (Stats counter)
  // ============================================
  function startHeroAnimations() {
    animateCounters();
  }

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-num[data-target]');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      let current = 0;
      const duration = 2000;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current);
      }, 16);
    });
  }

  // ============================================
  // 6. ABOUT CARD 3D TILT
  // ============================================
  const aboutCard = document.getElementById('aboutCard');
  if (aboutCard) {
    aboutCard.addEventListener('mousemove', (e) => {
      const rect = aboutCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -y / rect.height * 20;
      const rotateY = x / rect.width * 20;
      aboutCard.querySelector('.about-card-inner').style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    aboutCard.addEventListener('mouseleave', () => {
      aboutCard.querySelector('.about-card-inner').style.transform = '';
    });
  }

  // ============================================
  // 7. SKILL BARS ANIMATION
  // ============================================
  function animateSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');
    skillFills.forEach(fill => {
      const width = fill.getAttribute('data-width');
      fill.style.width = width + '%';
    });
  }

  // ============================================
  // 8. SCROLL OBSERVER (Intersection Observer)
  // ============================================
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Skill bars
        if (entry.target.closest('.about')) {
          animateSkillBars();
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add fade-up to sections
  const animateSections = document.querySelectorAll('.service-card, .work-card, .testimonial-card, .contact-item, .section-title, .section-desc, .about-visual, .about-text');
  animateSections.forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });

  // Process steps
  const processSteps = document.querySelectorAll('.process-step');
  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 150);
        processObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  processSteps.forEach(step => processObserver.observe(step));

  // Skills animation
  const aboutSection = document.querySelector('.about');
  if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateSkillBars();
        aboutObserver.disconnect();
      }
    }, { threshold: 0.3 });
    aboutObserver.observe(aboutSection);
  }

  // ============================================
  // 9. WORK FILTER
  // ============================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      workCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          // Bug fix: using opacity:0.2 left cards in the grid flow creating gaps.
          // Using display:'' restores the card and grid-auto-flow:dense fills gaps.
          card.style.display = '';
          card.style.pointerEvents = 'auto';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          card.style.pointerEvents = 'none';
          setTimeout(() => { card.style.display = 'none'; }, 350);
        }
      });
    });
  });

  // ============================================
  // 10. SERVICE CARDS 3D EFFECT
  // ============================================
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -6;
      const rotateY = (x - centerX) / centerX * 6;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });
  });

  // ============================================
  // 11. CONTACT FORM
  // ============================================
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('formSubmitBtn');
      const originalText = btn.querySelector('span').textContent;
      btn.querySelector('span').textContent = 'Sending...';
      btn.disabled = true;

      const name = document.getElementById('formName').value;
      const email = document.getElementById('formEmail').value;
      const service = document.getElementById('formService').value;
      const message = document.getElementById('formMessage').value;

      fetch("https://formsubmit.co/ajax/tharunsagarm96@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Portfolio Message from ${name}`,
          Name: name,
          Email: email,
          Service: service,
          Message: message
        })
      })
      .then(response => response.json())
      .then(data => {
        contactForm.reset();
        formSuccess.classList.add('visible');
        btn.querySelector('span').textContent = originalText;
        btn.disabled = false;
        setTimeout(() => formSuccess.classList.remove('visible'), 5000);
      })
      .catch(err => {
        console.error(err);
        btn.querySelector('span').textContent = 'Error! Try Again';
        btn.disabled = false;
        setTimeout(() => {
          btn.querySelector('span').textContent = originalText;
        }, 3000);
      });
    });
  }

  // ============================================
  // 12. SMOOTH PARALLAX ON HERO
  // ============================================
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    const heroBadge = document.querySelector('.hero-badge');
    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
      heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
    }
  });

  // ============================================
  // 13. ACTIVE NAV LINK ON SCROLL
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinksAll.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--red)';
      }
    });
  });

  // ============================================
  // 14. WORK CARDS 3D HOVER
  // ============================================
  workCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y / rect.height - 0.5) * -8;
      const rotateY = (x / rect.width - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ============================================
  // 15. FLOATING SHAPES PARALLAX
  // ============================================
  document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const mouseXRatio = e.clientX / window.innerWidth;
    const mouseYRatio = e.clientY / window.innerHeight;
    shapes.forEach((shape, i) => {
      const factor = (i + 1) * 15;
      const x = (mouseXRatio - 0.5) * factor;
      const y = (mouseYRatio - 0.5) * factor;
      shape.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  // ============================================
  // 16. BUTTON RIPPLE EFFECT
  // ============================================
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        width: 10px; height: 10px;
        top: ${e.clientY - rect.top - 5}px;
        left: ${e.clientX - rect.left - 5}px;
        animation: rippleAnim 0.6s ease forwards;
        pointer-events: none;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Ripple keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(30); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // 17. TESTIMONIAL CARDS STAGGER
  // ============================================
  const testCards = document.querySelectorAll('.testimonial-card');
  const testObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 150);
        testObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  testCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    testObserver.observe(card);
  });

  // ============================================
  // 18. SECTION TITLE ANIMATION
  // ============================================
  const sectionTitles = document.querySelectorAll('.section-title');
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sectionTitles.forEach(title => {
    title.style.opacity = '0';
    title.style.transform = 'translateY(20px)';
    title.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    titleObserver.observe(title);
  });

  console.log('%c✨ Portfolio Loaded — Tharun Sagar', 'color: #DC143C; font-size: 16px; font-weight: bold;');
});
