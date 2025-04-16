document.addEventListener('DOMContentLoaded', function() {
    // Load cart contents
    const cartContents = document.getElementById('cartContents');
    if (cartContents) {
        loadCartContents();
    }

    // Update cart count in header
    updateCartCount();
});

// Load cart contents
function loadCartContents() {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const emptyCart = document.getElementById('emptyCart');
        const cartItems = document.getElementById('cartItems');
        const cartItemsList = document.getElementById('cartItemsList');

        if (!emptyCart || !cartItems || !cartItemsList) {
            console.error('Required cart elements not found');
            return;
        }

        // Ensure cart is an array and has valid items
        if (!Array.isArray(cart)) {
            cart = [];
        }

        // Filter out invalid items and ensure all required fields exist
        cart = cart.filter(item =>
            item &&
            item.product &&
            typeof item.product === 'object' &&
            item.product.id &&
            item.product.name &&
            typeof item.product.price === 'number' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        );

        // Save cleaned cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        if (cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.style.display = 'none';
            return;
        }

        emptyCart.style.display = 'none';
        cartItems.style.display = 'flex';

        // Calculate cart totals
        const { subtotal, discount, discountTier, total } = calculateCartTotals(cart);

        // Update summary section
        const summaryElements = {
            cartSubtotal: subtotal,
            discountTier: discountTier,
            cartDiscount: discount,
            cartTotal: total
        };

        Object.entries(summaryElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof value === 'number') {
                    element.textContent = id === 'cartDiscount'
                        ? `-$${value.toFixed(2)}`
                        : `$${value.toFixed(2)}`;
                } else {
                    element.textContent = value;
                }
            }
        });

        // Render cart items
        cartItemsList.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'card mb-3';
            cartItem.innerHTML = `
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2 col-4 mb-3 mb-md-0">
                            <img src="${item.product.image || '/images/placeholder.jpg'}" class="img-fluid rounded" alt="${item.product.name}">
                        </div>
                        <div class="col-md-4 col-8 mb-3 mb-md-0">
                            <h5 class="card-title">${item.product.name}</h5>
                            <p class="card-text text-muted">${item.product.category || ''}</p>
                            <p class="card-text"><small class="text-muted">Price: $${item.product.price.toFixed(2)}</small></p>
                        </div>
                        <div class="col-md-3 col-6">
                            <div class="input-group">
                                <button class="btn btn-outline-secondary btn-sm decrease-quantity" data-product-id="${item.product.id}">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input type="text" class="form-control form-control-sm text-center item-quantity" value="${item.quantity}" readonly>
                                <button class="btn btn-outline-secondary btn-sm increase-quantity" data-product-id="${item.product.id}">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2 col-4 text-end">
                            <span class="fw-bold">$${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div class="col-md-1 col-2 text-end">
                            <button class="btn btn-outline-danger btn-sm remove-item" data-product-id="${item.product.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(cartItem);
        });

        // Add event listeners to cart item buttons
        addCartItemEventListeners();
    } catch (error) {
        console.error('Error loading cart:', error);
        const emptyCart = document.getElementById('emptyCart');
        const cartItems = document.getElementById('cartItems');
        if (emptyCart && cartItems) {
            emptyCart.style.display = 'block';
            cartItems.style.display = 'none';
        }
        // Reset cart on error
        localStorage.setItem('cart', '[]');
    }
}

// Add event listeners to cart item buttons
function addCartItemEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            updateCartItemQuantity(productId, -1);
        });
    });

    // Increase quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            updateCartItemQuantity(productId, 1);
        });
    });

    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            removeCartItem(productId);
        });
    });
}

// Update cart item quantity
function updateCartItemQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const itemIndex = cart.findIndex(item => item.product.id === productId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += change;

    // Remove item if quantity is 0 or less
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }

    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));

    // Reload cart contents
    loadCartContents();

    // Update cart count in header
    updateCartCount();
}

// Remove cart item
function removeCartItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const updatedCart = cart.filter(item => item.product.id !== productId);

    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Reload cart contents
    loadCartContents();

    // Update cart count in header
    updateCartCount();
}

// Calculate cart totals
function calculateCartTotals(cart) {
    const subtotal = cart.reduce((total, item) =>
        total + (item.product.price * item.quantity), 0);

    let discountTier = 'No Discount';
    let discountPercentage = 0;

    if (subtotal >= 200) {
        discountTier = '20% Off';
        discountPercentage = 0.20;
    } else if (subtotal >= 100) {
        discountTier = '10% Off';
        discountPercentage = 0.10;
    } else if (subtotal >= 50) {
        discountTier = '5% Off';
        discountPercentage = 0.05;
    }

    const discount = subtotal * discountPercentage;
    const total = subtotal - discount;

    return {
        subtotal,
        discount,
        discountTier,
        total
    };
}