// Animation and interactive effects
class PortfolioAnimations {
    constructor() {
        this.initTypingEffect();
        this.initScrollAnimations();
        this.initCounterAnimations();
        this.initSkillAnimations();
    }

    // Typing effect for hero section
    initTypingEffect() {
        const typedElement = document.getElementById('typedTitle');
        if (!typedElement) return;

        const texts = [
            "Привет, я Иван Иванов",
            "Frontend Developer",
            "React Enthusiast",
            "Problem Solver"
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typedElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typedElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                typingSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500; // Pause before next text
            }

            setTimeout(type, typingSpeed);
        }

        // Start typing effect
        setTimeout(type, 1000);
    }

    // Scroll animations
    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animate counters if element has data-target
                    const counters = entry.target.querySelectorAll('[data-target]');
                    counters.forEach(counter => {
                        const target = parseInt(counter.getAttribute('data-target'));
                        this.animateCounter(counter, 0, target, 2000);
                    });
                    
                    // Animate skills
                    const skills = entry.target.querySelectorAll('[data-level]');
                    skills.forEach(skill => {
                        const level = parseInt(skill.getAttribute('data-level'));
                        this.animateSkill(skill, level);
                    });
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all animate-able elements
        document.querySelectorAll('.skill-item, .project-card, .stat-card, .section-title').forEach(el => {
            observer.observe(el);
        });
    }

    // Counter animations
    initCounterAnimations() {
        const counters = document.querySelectorAll('[data-target]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            this.animateCounter(counter, 0, target, 2000);
        });
    }

    animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString();
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Skill bar animations
    initSkillAnimations() {
        const skills = document.querySelectorAll('[data-level]');
        skills.forEach(skill => {
            const level = parseInt(skill.getAttribute('data-level'));
            this.animateSkill(skill, level);
        });
    }

    animateSkill(skillElement, targetLevel) {
        let currentLevel = 0;
        const duration = 1500;
        const increment = targetLevel / (duration / 16); // 60fps
        
        const animate = () => {
            currentLevel += increment;
            if (currentLevel >= targetLevel) {
                currentLevel = targetLevel;
            }
            
            skillElement.style.width = currentLevel + '%';
            
            if (currentLevel < targetLevel) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Parallax effect for hero section
    initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Hover effects for interactive elements
    initHoverEffects() {
        // Project cards hover effect
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioAnimations();
});