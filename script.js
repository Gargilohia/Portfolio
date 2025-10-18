// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navigation').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navigation background on scroll
const nav = document.querySelector('.navigation');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.style.boxShadow = '0 2px 12px rgba(42, 42, 42, 0.08)';
    } else {
        nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Active navigation link based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.timeline-item, .project-card, .blog-link-card, .contact-link').forEach(el => {
    observer.observe(el);
});

// Typewriter effect for hero title (subtle)
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const originalText = heroTitle.innerHTML;
    heroTitle.style.opacity = '0';

    setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroTitle.style.transition = 'opacity 0.8s ease-in';
    }, 300);
}

// Add hover effect to project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.borderColor = 'var(--color-accent-light)';
    });

    card.addEventListener('mouseleave', function() {
        if (!this.classList.contains('featured')) {
            this.style.borderColor = 'var(--color-border)';
        }
    });
});

// Interactive stats counter
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const statNumber = entry.target.querySelector('.stat-number');
            const statLabel = entry.target.querySelector('.stat-label');
            const targetText = statNumber.textContent;

            // Check if this is the subscriptions stat
            const isSubscriptions = statLabel.textContent.toLowerCase().includes('subscription');

            // Only animate numeric values
            if (!isNaN(parseInt(targetText))) {
                const targetNumber = parseInt(targetText);
                const isCountingUp = !isSubscriptions;
                let currentNumber = isCountingUp ? 0 : 50;
                const totalSteps = 50;
                const increment = isCountingUp ? targetNumber / totalSteps : (50 - targetNumber) / totalSteps;

                const counter = setInterval(() => {
                    if (isCountingUp) {
                        currentNumber += increment;
                        if (currentNumber >= targetNumber) {
                            statNumber.textContent = targetText;
                            clearInterval(counter);
                        } else {
                            statNumber.textContent = Math.floor(currentNumber) + (targetText.includes('+') ? '+' : '');
                        }
                    } else {
                        currentNumber -= increment;
                        if (currentNumber <= targetNumber) {
                            statNumber.textContent = targetText;
                            clearInterval(counter);
                        } else {
                            statNumber.textContent = Math.floor(currentNumber);
                        }
                    }
                }, 30);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / 600);
    }
});

// Reading time estimator (if blog section is expanded)
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
}

// Dynamic year in footer
const footerCopy = document.querySelector('.footer-copy');
if (footerCopy) {
    const currentYear = new Date().getFullYear();
    footerCopy.innerHTML = footerCopy.innerHTML.replace('2024', currentYear);
}

// Git commit graph background animation
class GitGraph {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            pointer-events: none;
            z-index: 0;
            opacity: 0.15;
        `;

        // Insert canvas at the beginning of the hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.position = 'relative';
            heroSection.insertBefore(this.canvas, heroSection.firstChild);
        } else {
            document.body.prepend(this.canvas);
        }

        this.commits = [];
        this.branches = [];
        this.connections = [];
        this.commitMessages = [
            'feat: add authentication',
            'fix: resolve memory leak',
            'refactor: optimize queries',
            'chore: update dependencies',
            'docs: add API examples',
            'perf: improve load time',
            'test: add unit tests',
            'style: format code',
            'feat: implement caching',
            'fix: handle edge cases',
            'feat: add logging',
            'refactor: split modules',
            'fix: race condition',
            'feat: websocket support'
        ];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateCommitHash() {
        return Math.random().toString(16).substring(2, 9);
    }

    init() {
        const numBranches = 8;
        const branchSpacing = 120;
        const leftMargin = 80;

        // Create branches
        const branchNames = ['main', 'develop', 'feature/auth', 'feature/ui', 'hotfix/bug', 'feature/api', 'release/v2', 'feature/db'];
        const branchColors = ['#8b7355', '#a89279', '#7a6a55', '#9a8a75', '#6a5a45', '#5a5a5a', '#8a7a65', '#7a6555'];

        for (let i = 0; i < numBranches; i++) {
            this.branches.push({
                name: branchNames[i],
                x: leftMargin + (i * branchSpacing),
                color: branchColors[i],
                commits: [],
                lane: i
            });
        }

        // Generate commits - many more for density
        const commitSpacing = 50;
        const totalHeight = this.canvas.height;
        const commitsPerBranch = Math.floor(totalHeight / commitSpacing) - 2;

        this.branches.forEach((branch, branchIdx) => {
            const startY = 100 + (branchIdx * 30); // Stagger start positions
            const numCommits = commitsPerBranch + Math.floor((Math.random() - 0.5) * 10);

            for (let i = 0; i < numCommits; i++) {
                const y = startY + (i * commitSpacing) + (Math.random() - 0.5) * 20;

                if (y < totalHeight - 50) {
                    const commit = {
                        x: branch.x,
                        y: y,
                        radius: 12,
                        color: branch.color,
                        opacity: 0,
                        targetOpacity: 1,
                        delay: (branchIdx * 150) + (i * 50), // Stagger animation by branch and commit
                        branch: branch,
                        hash: this.generateCommitHash(),
                        message: this.commitMessages[Math.floor(Math.random() * this.commitMessages.length)],
                        showLabel: Math.random() > 0.88,
                        lane: branch.lane
                    };

                    this.commits.push(commit);
                    branch.commits.push(commit);
                }
            }
        });

        // Generate dense connections
        this.generateDenseConnections();

        this.animationStartTime = Date.now();
        this.animate();
    }

    generateDenseConnections() {
        // Connect commits within each branch
        this.branches.forEach(branch => {
            for (let i = 0; i < branch.commits.length - 1; i++) {
                this.connections.push({
                    from: branch.commits[i],
                    to: branch.commits[i + 1],
                    type: 'branch',
                    color: branch.color
                });
            }
        });

        // Create many cross-branch connections (merges and branches)
        for (let i = 0; i < this.branches.length - 1; i++) {
            const branch1 = this.branches[i];
            const branch2 = this.branches[i + 1];

            // Multiple connection points between adjacent branches
            const connectionPoints = [0.2, 0.35, 0.5, 0.65, 0.8];

            connectionPoints.forEach(point => {
                const idx1 = Math.floor(branch1.commits.length * point);
                const idx2 = Math.floor(branch2.commits.length * point) + Math.floor((Math.random() - 0.5) * 3);

                if (branch1.commits[idx1] && branch2.commits[idx2]) {
                    this.connections.push({
                        from: branch1.commits[idx1],
                        to: branch2.commits[idx2],
                        type: 'merge',
                        color: branch1.color
                    });
                }
            });

            // Add reverse connections for more density
            const reversePoints = [0.25, 0.55, 0.75];
            reversePoints.forEach(point => {
                const idx1 = Math.floor(branch2.commits.length * point);
                const idx2 = Math.floor(branch1.commits.length * point) + Math.floor((Math.random() - 0.5) * 4);

                if (branch2.commits[idx1] && branch1.commits[idx2]) {
                    this.connections.push({
                        from: branch2.commits[idx1],
                        to: branch1.commits[idx2],
                        type: 'merge',
                        color: branch2.color
                    });
                }
            });
        }

        // Add some long-distance connections (skip branches)
        for (let i = 0; i < this.branches.length - 2; i++) {
            const branch1 = this.branches[i];
            const branch2 = this.branches[i + 2];

            const longConnections = [0.3, 0.6, 0.85];
            longConnections.forEach(point => {
                const idx1 = Math.floor(branch1.commits.length * point);
                const idx2 = Math.floor(branch2.commits.length * point);

                if (branch1.commits[idx1] && branch2.commits[idx2]) {
                    this.connections.push({
                        from: branch1.commits[idx1],
                        to: branch2.commits[idx2],
                        type: 'merge',
                        color: branch1.color
                    });
                }
            });
        }
    }

    animate() {
        const elapsed = Date.now() - this.animationStartTime;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update commit opacities based on delay
        this.commits.forEach(commit => {
            if (elapsed > commit.delay) {
                commit.opacity += (commit.targetOpacity - commit.opacity) * 0.05;
            }
        });

        // Draw branch names with fade in
        const branchOpacity = Math.min(1, elapsed / 1000);
        this.ctx.font = 'bold 16px monospace';
        this.ctx.globalAlpha = 0.9 * branchOpacity;
        this.branches.forEach(branch => {
            this.ctx.fillStyle = branch.color;
            this.ctx.fillText(branch.name, branch.x - 50, 50);
        });

        // Draw all connections
        this.connections.forEach(connection => {
            const minOpacity = Math.min(connection.from.opacity, connection.to.opacity);

            if (minOpacity > 0.01) {
                this.ctx.globalAlpha = 0.5 * minOpacity;
                this.ctx.beginPath();
                this.ctx.strokeStyle = connection.color;

                if (connection.type === 'branch') {
                    // Straight lines for same-branch connections
                    this.ctx.lineWidth = 4;
                    this.ctx.moveTo(connection.from.x, connection.from.y);
                    this.ctx.lineTo(connection.to.x, connection.to.y);
                } else {
                    // Curved lines for merges
                    this.ctx.lineWidth = 3;
                    const fromX = connection.from.x;
                    const fromY = connection.from.y;
                    const toX = connection.to.x;
                    const toY = connection.to.y;

                    const controlX1 = fromX + (toX - fromX) * 0.5;
                    const controlY1 = fromY;
                    const controlX2 = fromX + (toX - fromX) * 0.5;
                    const controlY2 = toY;

                    this.ctx.moveTo(fromX, fromY);
                    this.ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, toX, toY);
                }

                this.ctx.stroke();
            }
        });

        // Draw commit nodes
        this.commits.forEach(commit => {
            if (commit.opacity > 0.01) {
                this.ctx.globalAlpha = 0.85 * commit.opacity;
                this.ctx.beginPath();
                this.ctx.fillStyle = commit.color;
                this.ctx.arc(commit.x, commit.y, commit.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Outer ring
                this.ctx.strokeStyle = commit.color;
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();

                // Draw labels for selected commits
                if (commit.showLabel && commit.opacity > 0.8) {
                    this.ctx.font = 'bold 14px monospace';
                    this.ctx.fillStyle = commit.color;
                    this.ctx.globalAlpha = 0.9 * commit.opacity;

                    const label = `${commit.hash}`;
                    this.ctx.fillText(label, commit.x + 18, commit.y - 10);

                    this.ctx.font = '12px monospace';
                    this.ctx.globalAlpha = 0.75 * commit.opacity;
                    this.ctx.fillText(commit.message, commit.x + 18, commit.y + 6);
                }
            }
        });

        this.ctx.globalAlpha = 1;

        // Continue animation until all commits are visible
        if (this.commits.some(c => c.opacity < 0.99)) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Initialize git graph only on larger screens
if (window.innerWidth > 768) {
    const gitGraph = new GitGraph();
}

// Console easter egg for fellow developers
console.log(`
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    "I took a deep breath and listened to the old brag
     of my heart. I am, I am, I am."
                                        — Sylvia Plath

    Thanks for peeking! Built with care and curiosity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
%c`,
'color: #8b7355; font-family: serif; font-size: 14px; line-height: 1.6;',
'');

// Accessibility: Keyboard navigation enhancement
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// Add CSS for keyboard navigation
const style = document.createElement('style');
style.textContent = `
    .keyboard-nav *:focus {
        outline: 2px solid var(--color-accent) !important;
        outline-offset: 4px !important;
    }
`;
document.head.appendChild(style);

// Lazy loading for potential future images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Performance: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll-heavy functions
window.addEventListener('scroll', debounce(updateActiveNav, 100));
