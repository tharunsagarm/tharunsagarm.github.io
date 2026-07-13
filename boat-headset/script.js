/* ==========================================================================
   boAt ANIMATED LANDING PAGE - INTERACTIONS SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const columns = document.querySelectorAll('.color-column');
  const heroSection = document.querySelector('.hero-section');
  const bgBrandText = document.getElementById('bgBrandText');

  // Map of column color identifiers to background branding text names
  const brandNames = {
    blue: 'NIRVANA',
    pink: 'AIR',
    green: 'EARTH',
    grey: 'PRO'
  };

  // 1. INITIALIZE COLUMNS BACKGROUNDS & SYNC DEFAULT STATE
  columns.forEach(column => {
    const bg = column.getAttribute('data-bg');
    if (bg) {
      column.style.backgroundColor = bg;
    }
  });

  // Set initial watermark text based on default active column
  const initialActive = document.querySelector('.color-column.active');
  if (initialActive) {
    const initialColor = initialActive.getAttribute('data-color');
    if (brandNames[initialColor]) {
      bgBrandText.textContent = brandNames[initialColor];
    }
  }

  // 2. CLICK TO ACTIVATE COLUMN & SYNC COLOR
  columns.forEach(column => {
    column.addEventListener('click', () => {
      // Avoid re-triggering if already active
      if (column.classList.contains('active')) return;

      // Remove active states
      columns.forEach(col => col.classList.remove('active'));

      // Add active state to clicked column
      column.classList.add('active');

      // Sync primary background color variable
      const targetColor = column.getAttribute('data-bg');
      heroSection.style.setProperty('--theme-bg', targetColor);

      // Sync background watermark text based on active color
      const colorId = column.getAttribute('data-color');
      if (brandNames[colorId]) {
        bgBrandText.style.opacity = '0';
        setTimeout(() => {
          bgBrandText.textContent = brandNames[colorId];
          bgBrandText.style.opacity = '1';
        }, 300); // match fade transition
      }
    });
  });

  // 2. SCROLL REVEAL INTERSECTION OBSERVER
  const scrollCards = document.querySelectorAll('.reveal-on-scroll');
  
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px'
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  scrollCards.forEach(card => {
    scrollObserver.observe(card);
  });
});
