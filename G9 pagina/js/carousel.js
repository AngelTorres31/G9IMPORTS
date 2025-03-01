// JavaScript para el carrusel
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    let currentIndex = 0;
    const itemCount = items.length;
    
    // Función para mostrar un slide específico
    function showSlide(index) {
        if (index < 0) {
            currentIndex = itemCount - 1;
        } else if (index >= itemCount) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    // Event listeners para los botones
    prevBtn.addEventListener('click', () => {
        showSlide(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        showSlide(currentIndex + 1);
    });
    
    // Auto-play del carrusel
    setInterval(() => {
        showSlide(currentIndex + 1);
    }, 2500);
});