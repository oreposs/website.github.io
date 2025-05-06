document.addEventListener('DOMContentLoaded', function() {

    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartShippingEl = document.getElementById('cart-shipping');
    const cartTotalEl = document.getElementById('cart-total');

    let cart = []; 

    function getProductId(cardElement) {
        if (cardElement.dataset.productId) {
            return cardElement.dataset.productId;
        }
        console.warn("Product card is missing data-product-id. Falling back to name.", cardElement);
        return cardElement.querySelector('h3').textContent.trim();
    }

    function addToCart(productId, name, price, image, quantity) {
        const existingItemIndex = cart.findIndex(item => item.id === productId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = quantity;
        } else {
            cart.push({ id: productId, name, price, quantity, image });
        }
        renderCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    }

    function updateCartItemQuantityInCart(productId, newQuantityInput) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            let newQty = parseInt(newQuantityInput, 10);
            if (isNaN(newQty) || newQty < 1) newQty = 1;
            else if (newQty > 99) newQty = 99;
            cart[itemIndex].quantity = newQty;
        }
        renderCart();
    }

    function renderCart() {
        const fragment = document.createDocumentFragment();
        if (cart.length === 0) {
            const p = document.createElement('p');
            p.style.textAlign = 'center';
            p.style.padding = '20px';
            p.textContent = 'Your cart is empty';
            fragment.appendChild(p);
        } else {
            cart.forEach(item => {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.dataset.id = item.id;
                div.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>
                            Quantity:
                            <input type="number" class="cart-item-quantity-input" value="${item.quantity}" min="1" max="99" data-product-id="${item.id}" aria-label="Item quantity for ${item.name}">
                        </p>
                        <p>$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="remove-item" data-product-id="${item.id}" aria-label="Remove ${item.name} from cart">&times;</button>
                `;
                fragment.appendChild(div);
            });
        }
        cartItemsContainer.innerHTML = ''; 
        cartItemsContainer.appendChild(fragment); 
        updateCartTotals();
        updateCartIconCount();
    }

    function updateCartTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 && subtotal <= 50 ? 10 : 0;
        const total = subtotal + shipping;

        cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        cartShippingEl.textContent = `$${shipping.toFixed(2)}`;
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
    }

    function updateCartIconCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    function clearCart() {
        cart = [];
        renderCart();
    }


    document.querySelectorAll('.product-card').forEach(card => {
        const productId = getProductId(card);
        const quantityInput = card.querySelector('.quantity-input');
        const minusBtn = card.querySelector('.quantity-controls .minus');
        const plusBtn = card.querySelector('.quantity-controls .plus');
        const addToCartBtn = card.querySelector('.add-to-cart');

        if (plusBtn && quantityInput) {
            plusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value, 10) || 0;
                if (value < 99) quantityInput.value = value + 1;
            });
        }
        if (minusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value, 10) || 1;
                if (value > 1) quantityInput.value = value - 1;
            });
        }
        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
                let value = quantityInput.value.replace(/[^0-9]/g, ''); 
                if (value === '') { 
                    return;
                }
                value = parseInt(value, 10);
                if (isNaN(value) || value < 1) value = 1;
                else if (value > 99) value = 99;
                quantityInput.value = value;
            });
            quantityInput.addEventListener('blur', () => { 
                let value = parseInt(quantityInput.value, 10);
                if (isNaN(value) || value < 1) quantityInput.value = 1;
                else if (value > 99) quantityInput.value = 99;
            });
        }
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const name = card.querySelector('h3').textContent;
                const quantity = parseInt(quantityInput.value, 10);
                const price = parseFloat(card.querySelector('.price').textContent.replace('$', ''));
                const image = card.querySelector('img').src;

                if (quantity < 1) {
                    alert("Please enter a quantity of at least 1.");
                    quantityInput.value = 1;
                    return;
                }
                addToCart(productId, name, price, image, quantity);
            });
        }
    });

    cartItemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            const productIdToRemove = e.target.dataset.productId;
            if (productIdToRemove) removeFromCart(productIdToRemove);
        }
    });

    cartItemsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('cart-item-quantity-input')) {
            const productIdToUpdate = e.target.dataset.productId;
            if (productIdToUpdate) updateCartItemQuantityInCart(productIdToUpdate, e.target.value);
        }
    });
    cartItemsContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('cart-item-quantity-input')) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value !== '') { 
                const numValue = parseInt(value, 10);
                if (numValue > 99) value = '99';
            }
            e.target.value = value;
        }
    });

    const clearCartBtn = document.querySelector('.clear-cart');
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

    const sections = document.querySelectorAll('section');
    const observerOptions = { threshold: 0.1, rootMargin: "0px" };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));

    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            productCards.forEach(card => {
                const cardCategory = card.dataset.category;
                const matchesFilter = (filter === 'all' || cardCategory === filter);
                const currentlyVisible = card.style.display !== 'none';

                if (matchesFilter) {
                    card.style.display = 'flex'; 
                    if (!currentlyVisible) { 
                        card.style.animation = 'none';
                        void card.offsetHeight; 
                        card.style.animation = 'fadeInUp 0.6s ease forwards';
                    }
                } else {
                    if (currentlyVisible) {
                        card.style.display = 'none';
                        card.style.animation = 'none';
                    }
                }
            });
        });
    });

    const cartBtn = document.querySelector('.cart-btn');
    const closeCart = document.querySelector('.close-cart');
    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); cartSidebar.classList.add('active'); });
    if (closeCart) closeCart.addEventListener('click', () => cartSidebar.classList.remove('active'));

    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    function openModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            requestAnimationFrame(() => { 
                 modal.classList.add('active');
            });
        }
    }
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            modal.addEventListener('transitionend', () => {
                modal.style.display = 'none';
            }, { once: true });
        }
    }

    if (loginBtn && loginModal) loginBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(loginModal); });
    if (signupBtn && signupModal) signupBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(signupModal); });
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalToClose = button.closest('.modal');
            closeModal(modalToClose);
        });
    });
    if (showSignup && loginModal && signupModal) showSignup.addEventListener('click', (e) => { e.preventDefault(); closeModal(loginModal); openModal(signupModal); });
    if (showLogin && loginModal && signupModal) showLogin.addEventListener('click', (e) => { e.preventDefault(); closeModal(signupModal); openModal(loginModal); });
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === signupModal) closeModal(signupModal);
    });

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm) loginForm.addEventListener('submit', (e) => e.preventDefault());
    if (signupForm) signupForm.addEventListener('submit', (e) => e.preventDefault());

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    renderCart(); 
});

