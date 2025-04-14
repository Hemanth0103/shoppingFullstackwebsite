// Enhanced Interactivity for ShopSmart

// Show toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add to cart animation
function animateAddToCart(button) {
    button.classList.add('disabled');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
    
    setTimeout(() => {
        button.classList.remove('disabled');
        button.innerHTML = originalText;
    }, 1500);
}

// Product image zoom effect
function initializeImageZoom() {
    const productImages = document.querySelectorAll('.card-img-top');
    productImages.forEach(img => {
        img.addEventListener('mousemove', (e) => {
            const bounds = img.getBoundingClientRect();
            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;
            
            img.style.transform = `scale(1.1) translate(
                ${(bounds.width / 2 - x) / 10}px,
                ${(bounds.height / 2 - y) / 10}px
            )`;
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1) translate(0, 0)';
        });
    });
}

// Enhanced product filtering
function initializeFilters() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            loadProducts(sortSelect.value);
        });
    }
}

// Add loading animation
function showLoading() {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.classList.add('loading');
    }
}

function hideLoading() {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.classList.remove('loading');
    }
}

// Enhanced cart badge update
function updateCartBadge(count) {
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.animation = 'none';
        badge.offsetHeight; // Trigger reflow
        badge.style.animation = 'cartBadgePulse 1s ease-in-out';
    }
}

// Initialize all interactive features
document.addEventListener('DOMContentLoaded', () => {
    initializeImageZoom();
    initializeFilters();
    
    // Add scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'btn btn-primary position-fixed bottom-0 end-0 m-4 rounded-circle';
    scrollBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    scrollBtn.style.display = 'none';
    scrollBtn.onclick = scrollToTop;
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    
    // Enhanced add to cart functionality
    document.addEventListener('click', (e) => {
        if (e.target.matches('.add-to-cart-btn')) {
            animateAddToCart(e.target);
        }
    });
});
