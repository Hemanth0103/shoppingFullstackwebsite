document.addEventListener('DOMContentLoaded', function() {
    // Load products on home page
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        loadProducts();

        // Setup sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                loadProducts(this.value);
            });
        }
    }

    // Load product details on product detail page
    const productDetail = document.getElementById('productDetail');
    if (productDetail) {
        const productId = new URLSearchParams(window.location.search).get('id');
        if (productId) {
            loadProductDetails(productId);
        } else {
            window.location.href = '/';
        }
    }
});

// Load all products
function loadProducts(sortBy = 'featured') {
    const productGrid = document.getElementById('productGrid');

    // Show loading state
    productGrid.innerHTML = getLoadingPlaceholders();

    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            // Sort products
            const sortedProducts = sortProducts(products, sortBy);

            // Render products
            productGrid.innerHTML = '';
            sortedProducts.forEach(product => {
                productGrid.appendChild(createProductCard(product));
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            productGrid.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load products. Please try again later.</div></div>';
        });
}

// Sort products based on selected option
function sortProducts(products, sortBy) {
    const sortedProducts = [...products];

    switch (sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // 'featured' - no sorting
            break;
    }

    return sortedProducts;
}

// Create product card element
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
        <div class="card h-100 product-card">
            <img src="${product.image || '/images/placeholder.jpg'}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-muted">${product.category}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold fs-5">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-primary btn-sm add-to-cart" data-product-id="${product.id}">
                        <i class="bi bi-cart me-1"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listener to "Add to Cart" button
    const addToCartBtn = col.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addToCart(product, 1);
    });

    // Add event listener to product card for navigation
    const productCard = col.querySelector('.product-card');
    productCard.addEventListener('click', function(e) {
        // Don't navigate if clicking the "Add to Cart" button
        if (!e.target.closest('.add-to-cart')) {
            window.location.href = `/product-detail?id=${product.id}`;
        }
    });

    return col;
}

// Load product details
function loadProductDetails(productId) {
    const productDetail = document.getElementById('productDetail');

    fetch(`/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Product not found');
            }
            return response.json();
        })
        .then(product => {
            productDetail.innerHTML = `
                <div class="col-md-6 mb-4 mb-md-0">
                    <img src="${product.image || '/images/placeholder.jpg'}" class="img-fluid rounded" alt="${product.name}">
                </div>
                <div class="col-md-6">
                    <h1 class="mb-2">${product.name}</h1>
                    <p class="text-muted mb-3">${product.category}</p>
                    <p class="fs-3 fw-bold mb-4">$${product.price.toFixed(2)}</p>
                    <p class="mb-4">${product.description}</p>

                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="input-group" style="width: 120px;">
                            <button class="btn btn-outline-secondary" id="decreaseQuantity">-</button>
                            <input type="text" class="form-control text-center" id="quantity" value="1" readonly>
                            <button class="btn btn-outline-secondary" id="increaseQuantity">+</button>
                        </div>
                        <button class="btn btn-primary" id="addToCartBtn">
                            <i class="bi bi-cart me-2"></i>Add to Cart
                        </button>
                    </div>
                </div>
            `;

            // Setup quantity buttons
            const quantity = document.getElementById('quantity');
            const decreaseBtn = document.getElementById('decreaseQuantity');
            const increaseBtn = document.getElementById('increaseQuantity');

            decreaseBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantity.value);
                if (currentValue > 1) {
                    quantity.value = currentValue - 1;
                }
            });

            increaseBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantity.value);
                quantity.value = currentValue + 1;
            });

            // Setup add to cart button
            const addToCartBtn = document.getElementById('addToCartBtn');
            addToCartBtn.addEventListener('click', function() {
                const quantityValue = parseInt(quantity.value);
                addToCart(product, quantityValue);
            });
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            productDetail.innerHTML = '<div class="col-12"><div class="alert alert-danger">Product not found or failed to load. <a href="/">Return to home page</a></div></div>';
        });
}

// Add product to cart
function addToCart(product, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingItemIndex !== -1) {
        // Update quantity if product already in cart
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            product: product,
            quantity: quantity
        });
    }

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count in header
    updateCartCount();

    // Show toast notification
    showToast(`${product.name} added to cart`);
}

// Show toast notification
function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">ShopSmart</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Auto-hide toast after 3 seconds
    setTimeout(() => {
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            toastElement.remove();
        }
    }, 3000);

    // Add event listener to close button
    const closeBtn = toast.querySelector('.btn-close');
    closeBtn.addEventListener('click', function() {
        toast.remove();
    });
}

// Generate loading placeholders
function getLoadingPlaceholders() {
    let placeholders = '';
    for (let i = 0; i < 8; i++) {
        placeholders += `
            <div class="col">
                <div class="card h-100 product-loading">
                    <div class="card-img-top bg-light" style="height: 200px;"></div>
                    <div class="card-body">
                        <div class="bg-light mb-2" style="height: 24px; width: 70%;"></div>
                        <div class="bg-light mb-3" style="height: 18px; width: 50%;"></div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="bg-light" style="height: 24px; width: 40%;"></div>
                            <div class="bg-light" style="height: 38px; width: 120px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    return placeholders;
}