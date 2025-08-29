// ========================================
// グローバル変数
// ========================================
let isScrolling = false;

// ========================================
// DOMContentLoaded
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initLoader();
    initHeader();
    initSmoothScroll();
    initScrollTop();
    initAnimations();
    initMobileMenu();
    initSlideshow();
});

// ========================================
// ローダー初期化
// ========================================
function initLoader() {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loader = document.getElementById('loading');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
        }, 500);
    });
}

// ========================================
// ヘッダー初期化
// ========================================
function initHeader() {
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // スクロール時のヘッダースタイル変更
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // ヘッダーの表示/非表示（モバイル対応）
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
        
        // アクティブなセクションのハイライト
        updateActiveSection();
    });
    
    // アクティブセクション更新
    function updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ========================================
// スムーススクロール
// ========================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // モバイルメニューを閉じる
                const navMenu = document.getElementById('navMenu');
                const menuToggle = document.getElementById('menuToggle');
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });
}

// ========================================
// モバイルメニュー
// ========================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // メニュー表示中はスクロール無効化
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // メニュー外クリックで閉じる
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}


// ========================================
// スクロールトップボタン
// ========================================
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    
    // スクロール量に応じて表示/非表示
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // クリックでトップへスクロール
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// アニメーション初期化
// ========================================
function initAnimations() {
    // Intersection Observer設定
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // 一度アニメーションしたら監視を解除
                if (entry.target.dataset.animateOnce === 'true') {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素を監視
    const animateElements = document.querySelectorAll(
        '.feature-card, .menu-card, .side-menu-item, .special-card, .info-item'
    );
    
    animateElements.forEach((element, index) => {
        // スタイル初期化
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.transitionDelay = `${index * 0.1}s`;
        element.dataset.animateOnce = 'true';
        
        observer.observe(element);
    });
    
    // アニメーション適用時のスタイル
    const style = document.createElement('style');
    style.textContent = `
        .animated {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes zoomIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    // パララックス効果（PCのみ）
    if (window.innerWidth > 768) {
        initParallax();
    }
}

// ========================================
// スライドショー機能
// ========================================
function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showNextSlide() {
        // 現在のスライドを非表示
        slides[currentSlide].classList.remove('active');
        
        // 次のスライドを計算
        currentSlide = (currentSlide + 1) % slides.length;
        
        // 次のスライドを表示
        slides[currentSlide].classList.add('active');
    }
    
    // 5秒ごとにスライドを切り替え
    setInterval(showNextSlide, 5000);
}

// ========================================
// パララックス効果
// ========================================
function initParallax() {
    const heroSection = document.querySelector('.hero');
    const heroOverlay = document.querySelector('.hero-overlay');
    
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(function() {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                
                if (heroOverlay) {
                    heroOverlay.style.transform = `translateY(${rate}px)`;
                }
                
                isScrolling = false;
            });
        }
    });
}

// ========================================
// ユーティリティ関数
// ========================================

// デバウンス関数
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

// スロットル関数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ========================================
// リサイズ処理
// ========================================
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // モバイルメニューリセット
        if (window.innerWidth > 768) {
            const navMenu = document.getElementById('navMenu');
            const menuToggle = document.getElementById('menuToggle');
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // パララックス再初期化
        if (window.innerWidth > 768 && !document.querySelector('.parallax-initialized')) {
            initParallax();
        }
    }, 250);
});

// ========================================
// 画像遅延読み込み
// ========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    // data-src属性を持つ画像を監視
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========================================
// フォーム処理（仮実装）
// ========================================
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // ここに実際のフォーム送信処理を実装
            console.log('Form submitted');
            alert('お問い合わせありがとうございます。後日ご連絡させていただきます。');
            form.reset();
        });
    });
}

// ========================================
// デバッグ用
// ========================================
console.log('%cハーモニー本郷三丁目 Website', 'color: #2E7D32; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to Harmony Hongo-Sanchome!', 'color: #FF6B35; font-size: 14px;');