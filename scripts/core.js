// Core functionality for all pages
class Portfolio {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.initTheme();
        this.initVisitCounter();
        this.initMobileMenu();
        this.initSmoothScroll();
        this.initAnimations();
    }

    // Theme management
    initTheme() {
        this.currentTheme = localStorage.getItem('portfolio-theme') || 'light';
        this.applyTheme(this.currentTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    applyTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        this.currentTheme = theme;
        localStorage.setItem('portfolio-theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    // Visit counter
    initVisitCounter() {
        let visits = parseInt(localStorage.getItem('portfolio-visits') || '0');
        visits++;
        localStorage.setItem('portfolio-visits', visits.toString());
        
        const counter = document.getElementById('visitCounter');
        if (counter) {
            counter.textContent = `👁️ ${visits}`;
        }
    }

    // Mobile menu
    initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.querySelector('.nav');
        
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                nav.classList.toggle('nav-open');
                menuBtn.textContent = nav.classList.contains('nav-open') ? '✕' : '☰';
            });
        }
    }

    // Smooth scroll
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Animations
    initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.skill-item, .project-card, .stat-card').forEach(el => {
            observer.observe(el);
        });
    }

       // Utility methods
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    openSocial(platform) {
        const urls = {
            github: 'https://github.com/ivan-ivanov',
            telegram: 'https://t.me/ivan_ivanov',
            linkedin: 'https://linkedin.com/in/ivan-ivanov'
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank');
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Modal management
    initModal(modalId, closeBtnId) {
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeBtnId);
        
        if (modal && closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modalId));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
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

    // Form handling
    async handleFormSubmit(formId, endpoint) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="btn-loading">🔄 Отправка...</div>';
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Show success
                this.showMessage('success', 'Сообщение успешно отправлено!');
                form.reset();
                
            } catch (error) {
                this.showMessage('error', 'Ошибка при отправке. Попробуйте еще раз.');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    showMessage(type, text) {
        // Create or update message element
        let messageEl = document.getElementById('formMessage');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'formMessage';
            document.querySelector('form').appendChild(messageEl);
        }
        
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = text;
        messageEl.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    // Local storage helpers
    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage error:', error);
        }
    }

    // Animation helpers
    animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (range * progress);
            element.textContent = Math.floor(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }
        
        requestAnimationFrame(updateValue);
    }
}

// Initialize portfolio instance
const portfolio = new Portfolio();

// Export for use in other files
window.portfolio = portfolio;