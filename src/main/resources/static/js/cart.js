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
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const emptyCart = document.getElementById('emptyCart');
    const cartItems = document.getElementById('cartItems');
    const cartItemsList = document.getElementById('cartItemsList');

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
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discountTier').textContent = discountTier;
    document.getElementById('cartDiscount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;

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
                        <p class="card-text text-muted">${item.product.category}</p>
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
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Determine discount tier and percentage
    let discountPercentage = 0;
    let discountTier = "Regular (No discount)";

    if (subtotal >= 5000) {
        discountPercentage = 0.15;
        discountTier = "Platinum (15% discount)";
    } else if (subtotal >= 1000) {
        discountPercentage = 0.1;
        discountTier = "Gold (10% discount)";
    } else if (subtotal >= 500) {
        discountPercentage = 0.05;
        discountTier = "Silver (5% discount)";
    }

    // Calculate discount amount and total
    const discount = subtotal * discountPercentage;
    const total = subtotal - discount;

    return {
        subtotal,
        discount,
        discountTier,
        total
    };
}