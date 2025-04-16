document.addEventListener('DOMContentLoaded', () => {
    // Mettre en évidence le lien de navigation actif
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.style.fontWeight = 'bold';
            link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }
    });

    // Animation simple pour les messages de succès
    const thanksMessage = document.querySelector('.thanks-message');
    if (thanksMessage) {
        thanksMessage.style.animation = 'fadeIn 1s ease-in';
    }

    // Fonction de validation du formulaire de contact
    const contactForm = document.querySelector('form[action="/contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const emailInput = contactForm.querySelector('#email');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(emailInput.value)) {
                e.preventDefault();
                alert('Veuillez entrer une adresse email valide.');
            }
        });
    }
});
// Filtrage des cours
document.addEventListener('DOMContentLoaded', () => {
    const courseCards = document.querySelectorAll('.course-card');
    const levelFilter = document.getElementById('level-filter');
    const priceFilter = document.getElementById('price-filter');
  
    function filterCourses() {
      const level = levelFilter.value;
      const priceRange = priceFilter.value;
  
      courseCards.forEach(card => {
        const cardLevel = card.querySelector('.level').textContent;
        const cardPrice = parseInt(card.querySelector('.price').textContent);
  
        const levelMatch = !level || cardLevel === level;
        let priceMatch = true;
  
        if (priceRange === '0-200') priceMatch = cardPrice < 200;
        else if (priceRange === '200-300') priceMatch = cardPrice >= 200 && cardPrice <= 300;
        else if (priceRange === '300+') priceMatch = cardPrice > 300;
  
        card.style.display = (levelMatch && priceMatch) ? 'block' : 'none';
      });
    }
  
    levelFilter.addEventListener('change', filterCourses);
    priceFilter.addEventListener('change', filterCourses);
  });