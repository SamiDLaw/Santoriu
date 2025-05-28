// Script pour la galerie d'images du produit Santoriu

document.addEventListener('DOMContentLoaded', () => {
  initProductGallery();
});

function initProductGallery() {
  const galleryMain = document.querySelector('.product-gallery-main img');
  const galleryThumbs = document.querySelectorAll('.product-thumb');
  
  if (!galleryMain || galleryThumbs.length === 0) return;
  
  // Ajouter la classe active à la première miniature
  galleryThumbs[0].classList.add('active');
  
  // Ajouter les écouteurs d'événements pour chaque miniature
  galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', function() {
      // Mettre à jour l'image principale
      const newSrc = this.getAttribute('src');
      const newAlt = this.getAttribute('alt');
      
      // Animation simple de transition
      galleryMain.style.opacity = '0';
      
      setTimeout(() => {
        galleryMain.setAttribute('src', newSrc);
        galleryMain.setAttribute('alt', newAlt);
        galleryMain.style.opacity = '1';
      }, 300);
      
      // Mettre à jour la classe active
      galleryThumbs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Ajouter une loupe au survol de l'image principale (optionnel)
  if (window.innerWidth > 768) { // Seulement sur les écrans larges
    const zoomFactor = 1.5;
    
    galleryMain.addEventListener('mousemove', function(e) {
      const { left, top, width, height } = this.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      this.style.transformOrigin = `${x * 100}% ${y * 100}%`;
      this.style.transform = `scale(${zoomFactor})`;
    });
    
    galleryMain.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  }
}

// Fonction pour précharger les images (améliore l'expérience utilisateur)
function preloadImages() {
  const galleryThumbs = document.querySelectorAll('.product-thumb');
  
  galleryThumbs.forEach(thumb => {
    const img = new Image();
    img.src = thumb.getAttribute('src');
  });
}

// Précharger les images après le chargement de la page
window.addEventListener('load', preloadImages);
