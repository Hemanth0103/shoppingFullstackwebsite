document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();

    // Load order summary
    loadOrderSummary();

    // Setup checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

// Load order summary
function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const orderItems = document.getElementById('orderItems');

    if (cart.length === 0) {
        window.location.href = '/cart';
        return;
    }

    // Calculate cart totals
    const { subtotal, discount, discountTier, total } = calculateCartTotals(cart);

    // Update summary section
    document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('orderDiscountTier').textContent = discountTier;
    document.getElementById('orderDiscount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;

    // Render order items
    orderItems.innerHTML = '';
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'd-flex justify-content-between mb-2';

        orderItem.innerHTML = `
            <div>
                <span class="fw-medium">${item.product.name}</span>
                <span class="text-muted"> × ${item.quantity}</span>
            </div>
            <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
        `;

        orderItems.appendChild(orderItem);
    });
}

// Handle checkout form submission
function handleCheckout(e) {
    e.preventDefault();

    // Form validation
    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        window.location.href = '/cart';
        return;
    }

    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';

    // Calculate cart totals
    const { subtotal, discount, discountTier, total } = calculateCartTotals(cart);

    // Prepare order data
    const orderData = {
        items: cart.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price
        })),
        subtotal,
        discount,
        total,
        discountTier,
        shippingDetails: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            country: document.getElementById('country').value
        }
    };

    // Send order to server
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Failed to place order');
    })
    .then(data => {
        // Clear cart
        localStorage.removeItem('cart');

        // Show success message and redirect to home page
        showOrderConfirmation(data.orderId);
    })
    .catch(error => {
        console.error('Order error:', error);

        // Show error message
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger mt-3';
        errorAlert.textContent = 'There was a problem processing your order. Please try again.';

        document.getElementById('checkoutForm').prepend(errorAlert);

        // Re-enable button
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = 'Place Order';
    });
}

// Show order confirmation
function showOrderConfirmation(orderId) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'orderConfirmationModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'orderConfirmationModalLabel');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="orderConfirmationModalLabel">Order Confirmed!</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="mb-4">
                        <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                    </div>
                    <h4>Thank you for your purchase!</h4>
                    <p>Your order #${orderId} has been placed successfully.</p>
                    <p>A confirmation email has been sent to your email address.</p>
                </div>
                <div class="modal-footer">
                    <a href="/" class="btn btn-primary">Continue Shopping</a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Redirect to home page when modal is closed
    modal.addEventListener('hidden.bs.modal', function() {
        window.location.href = '/';
    });
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