// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('compact');
    } else {
        header.classList.remove('compact');
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Scroll Animation
const animateElements = () => {
    const elements = document.querySelectorAll('.service-card, .about-image, .about-text, .team-member, .gallery-item, .testimonial, .booking-content, .contact-info, .contact-form');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.classList.add('in-view');
        }
    });
};

window.addEventListener('scroll', animateElements);
window.addEventListener('load', animateElements);

// Testimonial Slider
const testimonialTrack = document.getElementById('testimonial-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentIndex = 0;

// Clone the first testimonial for infinite loop
const firstTestimonial = testimonialTrack.firstElementChild.cloneNode(true);
testimonialTrack.appendChild(firstTestimonial);

// Add 2 more testimonials
const testimonial2 = document.createElement('div');
testimonial2.classList.add('testimonial');
testimonial2.innerHTML = `
    <div class="testimonial-content">
        <div class="testimonial-text">
            "Die Atmosphäre ist entspannt, das Team super freundlich und meine Haare sehen immer fabelhaft aus. Was will man mehr? TimeTocut ist meine absolute Empfehlung für alle, die Wert auf Qualität legen."
        </div>
    </div>
    <div class="testimonial-author">
        <img src="/api/placeholder/100/100" alt="Author">
        <div class="author-info">
            <h4>Thomas H.</h4>
            <p>Stammkunde seit 2020</p>
        </div>
    </div>
`;

const testimonial3 = document.createElement('div');
testimonial3.classList.add('testimonial');
testimonial3.innerHTML = `
    <div class="testimonial-content">
        <div class="testimonial-text">
            "Endlich ein Salon, der meine Haarstruktur versteht! Die Beratung ist kompetent, die Produkte hochwertig und die Ergebnisse sprechen für sich. Ich komme immer wieder gerne."
        </div>
    </div>
    <div class="testimonial-author">
        <img src="/api/placeholder/100/100" alt="Author">
        <div class="author-info">
            <h4>Julia F.</h4>
            <p>Stammkundin seit 2021</p>
        </div>
    </div>
`;

// Insert new testimonials
testimonialTrack.insertBefore(testimonial2, firstTestimonial);
testimonialTrack.insertBefore(testimonial3, firstTestimonial);

const testimonialCount = testimonialTrack.children.length - 1; // -1 because of the clone

const updateSlider = () => {
    testimonialTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
};

nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex > testimonialCount) {
        testimonialTrack.style.transition = 'none';
        currentIndex = 0;
        updateSlider();
        setTimeout(() => {
            testimonialTrack.style.transition = 'transform 0.5s ease';
        }, 10);
    } else {
        testimonialTrack.style.transition = 'transform 0.5s ease';
        updateSlider();
    }
});

prevBtn.addEventListener('click', () => {
    currentIndex--;
    if (currentIndex < 0) {
        testimonialTrack.style.transition = 'none';
        currentIndex = testimonialCount;
        updateSlider();
        setTimeout(() => {
            testimonialTrack.style.transition = 'transform 0.5s ease';
        }, 10);
    } else {
        testimonialTrack.style.transition = 'transform 0.5s ease';
        updateSlider();
    }
});

// Form Submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Vielen Dank für Ihre Nachricht! Wir werden uns in Kürze bei Ihnen melden.');
    contactForm.reset();
});