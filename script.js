// VoteWise - Interactive JavaScript Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive components
    initScrollAnimations();
    initStickyHeader();
    initSmoothScrolling();
    initToggleReadMore();
    initShareButtons();
    initTooltips();
    initImageZoom();
    initCountdownTimer();
    initMobileNavigation();
    initBackToTop();
    
    // Show the page with a fade-in effect
    document.body.classList.add('loaded');
});

// Scroll-triggered animations
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
    
    // Convert existing animate elements to scroll-triggered
    document.querySelectorAll('.animate-fadeIn, .animate-slideInLeft, .animate-slideInRight')
        .forEach(el => {
            if (!el.classList.contains('animated')) {
                el.classList.add('animate-on-scroll');
                el.classList.remove('animate-fadeIn', 'animate-slideInLeft', 'animate-slideInRight');
                observer.observe(el);
            }
        });
}

// Sticky header on scroll
function initStickyHeader() {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.hero');
    
    if (!header || !heroSection) return;
    
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > heroBottom - 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
        
        // Parallax effect for hero section
        if (window.scrollY < heroBottom) {
            const parallaxOffset = window.scrollY * 0.4;
            heroSection.style.backgroundPositionY = `-${parallaxOffset}px`;
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            // Close mobile menu if open
            const navToggle = document.getElementById('nav-toggle');
            if (navToggle && navToggle.checked) {
                navToggle.checked = false;
            }
            
            const headerOffset = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - headerOffset - 20;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL hash after scrolling
            history.pushState(null, null, targetId);
        });
    });
}

// Toggle "Read More" functionality for long articles
function initToggleReadMore() {
    document.querySelectorAll('.article-content').forEach(article => {
        // Only apply to longer articles
        if (article.offsetHeight > 500) {
            article.classList.add('collapsed');
            
            const readMoreBtn = document.createElement('button');
            readMoreBtn.className = 'read-more-btn';
            readMoreBtn.textContent = 'Read More';
            
            readMoreBtn.addEventListener('click', function() {
                if (article.classList.contains('collapsed')) {
                    article.classList.remove('collapsed');
                    this.textContent = 'Show Less';
                } else {
                    article.classList.add('collapsed');
                    this.textContent = 'Read More';
                    
                    // Scroll back to article start
                    article.scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            article.after(readMoreBtn);
        }
    });
}

// Interactive share buttons
function initShareButtons() {
    document.querySelectorAll('.share-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.classList[1];
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            let shareUrl;
            
            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${title}&body=Check out this article: ${url}`;
                    break;
                default:
                    return;
            }
            
            // Display a success message instead of opening a new window
            const articleSection = this.closest('.article-section');
            if (articleSection) {
                const shareMessage = document.createElement('div');
                shareMessage.className = 'share-message';
                shareMessage.textContent = 'Article link copied! Share link: ' + window.location.href;
                
                // Remove any existing messages
                const existingMessage = articleSection.querySelector('.share-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                // Add the new message
                this.parentNode.after(shareMessage);
                
                // Copy to clipboard
                navigator.clipboard.writeText(window.location.href).catch(err => {
                    console.error('Could not copy text: ', err);
                });
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    shareMessage.classList.add('fade-out');
                    setTimeout(() => shareMessage.remove(), 500);
                }, 3000);
            }
        });
    });
}

// Interactive tooltips
function initTooltips() {
    const terms = {
        'Electoral College': 'A body of electors established by the United States Constitution, which forms every four years for the sole purpose of electing the president and vice president.',
        'Gerrymandering': 'The practice of drawing electoral district boundaries to favor one political party.',
        'Voter Suppression': 'Strategies to discourage or prevent specific groups of people from voting.',
        'Ballot Initiative': 'A process that enables citizens to bypass their state legislature by placing proposed laws on the ballot.',
        'Provisional Ballot': 'A ballot provided to voters who are unable to vote a regular ballot due to questions about their eligibility.',
        "Primary Election": "An election in which registered voters select a candidate that they believe should be a political party's candidate for office.",
    };
    
    // Find these terms in the text and add tooltip functionality
    const articles = document.querySelectorAll('.article-content');
    
    articles.forEach(article => {
        for (const [term, definition] of Object.entries(terms)) {
            const regex = new RegExp(`\\b${term}\\b`, 'g');
            
            // Convert the HTML to a DOM object for safe manipulation
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.innerHTML;
            
            // Process text nodes to add the tooltips
            findAndProcessTextNodes(tempDiv, regex, term, definition);
            
            // Update the article content
            article.innerHTML = tempDiv.innerHTML;
        }
    });
    
    function findAndProcessTextNodes(element, regex, term, definition) {
        if (element.nodeType === Node.TEXT_NODE) {
            // Check if the text contains the term
            if (regex.test(element.textContent)) {
                const fragment = document.createDocumentFragment();
                const parts = element.textContent.split(regex);
                
                for (let i = 0; i < parts.length; i++) {
                    // Add the text before the term
                    fragment.appendChild(document.createTextNode(parts[i]));
                    
                    // Add the term with tooltip, except after the last part
                    if (i < parts.length - 1) {
                        const span = document.createElement('span');
                        span.className = 'tooltip-term';
                        span.textContent = term;
                        
                        const tooltip = document.createElement('span');
                        tooltip.className = 'tooltip-text';
                        tooltip.textContent = definition;
                        
                        span.appendChild(tooltip);
                        fragment.appendChild(span);
                    }
                }
                
                // Replace the original text node with the new fragment
                element.parentNode.replaceChild(fragment, element);
            }
        } else if (element.nodeType === Node.ELEMENT_NODE) {
            // Don't process script, style, or already processed elements
            if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE' && !element.classList.contains('tooltip-term')) {
                Array.from(element.childNodes).forEach(child => {
                    findAndProcessTextNodes(child, regex, term, definition);
                });
            }
        }
    }
}

// Image zoom effect
function initImageZoom() {
    document.querySelectorAll('.article-image').forEach(image => {
        image.addEventListener('click', function() {
            if (this.classList.contains('zoomed')) {
                this.classList.remove('zoomed');
                document.body.classList.remove('has-zoomed-image');
            } else {
                this.classList.add('zoomed');
                document.body.classList.add('has-zoomed-image');
            }
        });
    });
    
    // Close zoomed image when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('article-image') && document.querySelector('.zoomed')) {
            document.querySelector('.zoomed').classList.remove('zoomed');
            document.body.classList.remove('has-zoomed-image');
        }
    });
}

// Countdown timer to next election (placeholder - would need to be configured)
function initCountdownTimer() {
    // Example: Set the election date (e.g., November 5, 2024)
    const electionDate = new Date('November 5, 2024 00:00:00').getTime();
    
    // Create the timer element if it doesn't exist
    if (!document.querySelector('.election-countdown')) {
        const timerSection = document.createElement('div');
        timerSection.className = 'election-countdown';
        timerSection.innerHTML = `
            <div class="container">
                <h2>Next Election Countdown</h2>
                <div class="countdown-timer">
                    <div class="time-segment">
                        <span class="days">00</span>
                        <span class="time-label">Days</span>
                    </div>
                    <div class="time-segment">
                        <span class="hours">00</span>
                        <span class="time-label">Hours</span>
                    </div>
                    <div class="time-segment">
                        <span class="minutes">00</span>
                        <span class="time-label">Minutes</span>
                    </div>
                    <div class="time-segment">
                        <span class="seconds">00</span>
                        <span class="time-label">Seconds</span>
                    </div>
                </div>
                <p class="countdown-message">Time left to prepare for the next election!</p>
            </div>
        `;
        
        // Insert after the hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.after(timerSection);
        }
        
        // Update the countdown every second
        const countdownTimer = setInterval(function() {
            const now = new Date().getTime();
            const distance = electionDate - now;
            
            // Time calculations
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Update the countdown display
            document.querySelector('.days').textContent = days.toString().padStart(2, '0');
            document.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
            document.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
            document.querySelector('.seconds').textContent = seconds.toString().padStart(2, '0');
            
            // If the countdown is finished
            if (distance < 0) {
                clearInterval(countdownTimer);
                document.querySelector('.countdown-timer').innerHTML = "Election Day is here!";
            }
        }, 1000);
    }
}

// Mobile navigation improvements
function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navToggle || !navMenu) return;
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navToggle.checked && !e.target.closest('nav') && !e.target.closest('label[for="nav-toggle"]')) {
            navToggle.checked = false;
        }
    });
    
    // Add dropdown functionality for nested menus on mobile
    document.querySelectorAll('.nav-menu > li').forEach(item => {
        if (item.querySelector('ul')) {
            const dropdownToggle = document.createElement('span');
            dropdownToggle.className = 'dropdown-toggle';
            dropdownToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
            
            item.classList.add('has-dropdown');
            item.querySelector('a').after(dropdownToggle);
            
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                item.classList.toggle('dropdown-open');
            });
        }
    });
}

// Back to top button
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}