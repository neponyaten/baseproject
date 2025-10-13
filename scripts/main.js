// Основные функции сайта
class Portfolio {
    constructor() {
        this.init();
    }

    init() {
        this.initTheme();
        this.initVisitCounter();
        this.initModalWindows();
        this.initFormValidation();
        this.initSmoothScroll();
        this.initAnimations();
    }

    // Инициализация темы
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        document.querySelector('.theme-toggle')?.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // Счетчик посещений
    initVisitCounter() {
        let visits = localStorage.getItem('pageVisits') || 0;
        visits = parseInt(visits) + 1;
        localStorage.setItem('pageVisits', visits);
        
        const counter = document.querySelector('.visit-counter');
        if (counter) {
            counter.textContent = `Посещений: ${visits}`;
        }
    }

    // Модальные окна
    initModalWindows() {
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || 
                e.target.classList.contains('close-modal')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });

        // Открытие проектов в модальном окне
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openProjectModal(card);
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('fade-in');
        }
    }

    closeModal(modal) {
        modal.style.display = 'none';
        modal.classList.remove('fade-in');
    }

    openProjectModal(projectCard) {
        const projectTitle = projectCard.querySelector('h3, h4').textContent;
        const projectDesc = projectCard.querySelector('p').textContent;
        
        const modalHtml = `
            <div id="projectModal" class="modal fade-in">
                <div class="modal-content slide-in">
                    <button class="close-modal">&times;</button>
                    <h2>${projectTitle}</h2>
                    <p>${projectDesc}</p>
                    <div class="project-details">
                        <h4>Технологии:</h4>
                        <ul>
                            <li>HTML5</li>
                            <li>CSS3</li>
                            <li>JavaScript</li>
                            <li>React</li>
                        </ul>
                        <div class="project-links">
                            <button onclick="portfolio.openDemo('${projectTitle}')">Демо</button>
                            <button onclick="portfolio.openGitHub('${projectTitle}')">GitHub</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    openDemo(projectName) {
        alert(`Открываем демо проекта: ${projectName}`);
    }

    openGitHub(projectName) {
        alert(`Открываем GitHub проекта: ${projectName}`);
    }

    // Валидация форм
    initFormValidation() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateForm(contactForm);
            });
        }
    }

    validateForm(form) {
        const formData = new FormData(form);
        const messageDiv = document.querySelector('.form-message');
        
        // Простая валидация
        let isValid = true;
        form.querySelectorAll('input, textarea').forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ff4444';
            } else {
                field.style.borderColor = '#00aa00';
            }
        });

        if (isValid) {
            this.showFormMessage('Сообщение отправлено успешно!', 'success');
            form.reset();
            
            // Имитация отправки
            setTimeout(() => {
                this.showFormMessage('', 'success');
            }, 3000);
        } else {
            this.showFormMessage('Пожалуйста, заполните все поля', 'error');
        }
    }

    showFormMessage(message, type) {
        const messageDiv = document.querySelector('.form-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `form-message ${type}`;
            messageDiv.style.display = 'block';
        }
    }

    // Плавная прокрутка
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Анимации при скролле
    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('slide-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.project-card, .skill-item').forEach(el => {
            observer.observe(el);
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new Portfolio();
});