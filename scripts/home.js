// Home page specific functionality
class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.initDownloadResume();
        this.initViewProjects();
        this.initFeaturedProjects();
        this.initStatsAnimation();
    }

    // Download resume functionality
    initDownloadResume() {
        const downloadBtn = document.getElementById('downloadResume');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                // Simulate download
                this.showDownloadToast();
                
                // Create and trigger download
                const link = document.createElement('a');
                link.href = 'assets/resume.pdf';
                link.download = 'Иван_Иванов_Резюме.pdf';
                link.click();
            });
        }
    }

    showDownloadToast() {
        const toast = document.createElement('div');
        toast.className = 'download-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span>✅ Резюме скачивается...</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // View projects navigation
    initViewProjects() {
        const viewProjectsBtn = document.getElementById('viewProjects');
        if (viewProjectsBtn) {
            viewProjectsBtn.addEventListener('click', () => {
                window.location.href = 'pages/projects.html';
            });
        }
    }

    // Load featured projects
    initFeaturedProjects() {
        const projectsGrid = document.getElementById('featuredProjects');
        if (!projectsGrid) return;

        const featuredProjects = [
            {
                id: 1,
                title: "E-Commerce Platform",
                description: "Полнофункциональная платформа интернет-магазина с корзиной и платежами",
                technologies: ["React", "Node.js", "MongoDB"],
                category: "fullstack",
                image: "🛒",
                demoUrl: "#",
                githubUrl: "#",
                featured: true
            },
            {
                id: 2,
                title: "Task Management App",
                description: "Приложение для управления задачами с drag-and-drop функционалом",
                technologies: ["React", "TypeScript", "Redux"],
                category: "react",
                image: "✅",
                demoUrl: "#",
                githubUrl: "#",
                featured: true
            },
            {
                id: 3,
                title: "Weather Dashboard",
                description: "Панель управления погодой с прогнозами и интерактивными картами",
                technologies: ["JavaScript", "API", "Chart.js"],
                category: "javascript",
                image: "🌤️",
                demoUrl: "#",
                githubUrl: "#",
                featured: true
            }
        ];

        this.renderProjects(projectsGrid, featuredProjects);
    }

    renderProjects(container, projects) {
        container.innerHTML = projects.map(project => `
            <div class="project-card" data-category="${project.category}">
                <div class="project-image">
                    <div class="project-icon">${project.image}</div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-technologies">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-small" onclick="homePage.viewProject(${project.id})">
                            Подробнее
                        </button>
                        <button class="btn btn-outline btn-small" onclick="homePage.openDemo(${project.id})">
                            Демо
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    viewProject(projectId) {
        // Navigate to projects page with project ID
        window.location.href = `pages/projects.html?project=${projectId}`;
    }

    openDemo(projectId) {
        // Open project demo
        portfolio.showMessage('info', `Открывается демо проекта #${projectId}`);
    }

    // Stats animation
    initStatsAnimation() {
        const stats = [
            { element: document.querySelector('[data-target="24"]'), target: 24 },
            { element: document.querySelector('[data-target="1500"]'), target: 1500 },
            { element: document.querySelector('[data-target="999"]'), target: 999 },
            { element: document.querySelector('[data-target="100"]'), target: 100 }
        ];

        stats.forEach(stat => {
            if (stat.element) {
                portfolio.animateValue(stat.element, 0, stat.target, 2000);
            }
        });
    }

    // Update visitor count in footer
    updateVisitorCount() {
        const totalVisitors = localStorage.getItem('portfolio-visits') || '1';
        const visitorElement = document.getElementById('totalVisitors');
        if (visitorElement) {
            visitorElement.textContent = totalVisitors;
        }
    }
}

// Initialize home page
const homePage = new HomePage();
window.homePage = homePage;