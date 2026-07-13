/* ==========================================================================
   boAt ANIMATED LANDING PAGE - INTERACTIONS SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const columns = document.querySelectorAll('.color-column');
  const columnsContainer = document.querySelector('.columns-container');
  const heroSection = document.querySelector('.hero-section');
  const bgBrandText = document.getElementById('bgBrandText');

  // Map of column color identifiers to background branding text names
  const brandNames = {
    blue: 'NIRVANA',
    pink: 'AIR',
    green: 'EARTH',
    grey: 'PRO'
  };

  const defaultBg = '#121214'; // Neutral dark theme when none active
  const defaultText = 'BOAT';

  // 1. INITIALIZE COLUMNS BACKGROUNDS
  columns.forEach(column => {
    const bg = column.getAttribute('data-bg');
    if (bg) {
      column.style.backgroundColor = bg;
    }
  });

  // Set initial default theme background
  heroSection.style.setProperty('--theme-bg', defaultBg);
  bgBrandText.textContent = defaultText;

  // 2. HOVER (MOUSEENTER) ON COLUMNS TO ACTIVATE
  columns.forEach(column => {
    column.addEventListener('mouseenter', () => {
      // Remove active states
      columns.forEach(col => col.classList.remove('active'));

      // Add active state to hovered column
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
        }, 150);
      }
    });
  });

  // 3. MOUSELEAVE CONTAINER TO RESET ACCORDION TO EQUAL WIDTHS
  columnsContainer.addEventListener('mouseleave', () => {
    // Remove active states from all columns
    columns.forEach(col => col.classList.remove('active'));

    // Reset background color and text
    heroSection.style.setProperty('--theme-bg', defaultBg);
    
    bgBrandText.style.opacity = '0';
    setTimeout(() => {
      bgBrandText.textContent = defaultText;
      bgBrandText.style.opacity = '1';
    }, 150);
  });

  // 4. SCROLL REVEAL INTERSECTION OBSERVER
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
