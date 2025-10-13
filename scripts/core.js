// Core functionality - simplified and working
class Portfolio {
    constructor() {
        this.init();
    }

    init() {
        this.initTheme();
        this.initVisitCounter();
        this.initMobileMenu();
        this.initSmoothScroll();
    }

    // Theme management
    initTheme() {
        const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                const isDark = document.body.classList.contains('dark-theme');
                localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
            });
        }
    }

    // Visit counter
    initVisitCounter() {
        let visits = localStorage.getItem('portfolio-visits') || 0;
        visits = parseInt(visits) + 1;
        localStorage.setItem('portfolio-visits', visits);
        
        const counter = document.getElementById('visitCounter');
        if (counter) {
            counter.textContent = `👁 ${visits}`;
        }
    }

    // Mobile menu
    initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.querySelector('.nav');
        
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    }

    // Smooth scroll
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Modal functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Show message
    showMessage(type, text) {
        alert(text); // Simple alert for now
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.portfolio = new Portfolio();
});