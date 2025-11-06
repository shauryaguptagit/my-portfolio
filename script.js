document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SCROLL REVEAL ANIMATION ---
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('hidden');
        }
      });
    });
  
    // Find all hidden elements (including the new one)
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    
    // --- 2. TYPEWRITER EFFECT ---
    const typewriterElement = document.getElementById('typewriter-text');
    const words = ["a Full-Stack Developer", "a Precision Engineer", "an AI Enthusiast"]; 
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 150;
    const erasingSpeed = 100;
    const delay = 2000;

    function type() {
        const currentWord = words[wordIndex];
        
        let displayText;
        if (isDeleting) {
            displayText = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            displayText = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        typewriterElement.textContent = displayText;
        let speed = isDeleting ? erasingSpeed : typingSpeed;

        if (!isDeleting && charIndex === currentWord.length) {
            speed = delay;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = typingSpeed;
        }

        setTimeout(type, speed);
    }
    type();
});