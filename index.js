// index.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });

    // Cart Sidebar Toggle
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        cartSidebar.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
        updateCartDisplay();
    });
    
    closeCart.addEventListener('click', function() {
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
    });
    
    cartOverlay.addEventListener('click', function() {
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
    });

    // Initialize cart and wishlist if they don't exist in localStorage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('wishlist')) {
        localStorage.setItem('wishlist', JSON.stringify([]));
    }

    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productElement = this.closest('.group');
            const product = {
                id: productElement.dataset.productId || generateProductId(productElement),
                name: productElement.querySelector('h3').textContent,
                category: productElement.querySelector('p.text-gray-500').textContent,
                price: parseFloat(productElement.querySelector('p.text-pink-600').textContent.replace('$', '')),
                image: productElement.querySelector('img').src,
                quantity: 1
            };
            
            addToCart(product);
            updateCartDisplay();
            
            // Show a quick confirmation
            const confirmation = document.createElement('div');
            confirmation.textContent = `${product.name} added to cart!`;
            confirmation.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            document.body.appendChild(confirmation);
            
            setTimeout(() => {
                confirmation.remove();
            }, 3000);
        });
    });

    // Wishlist functionality
    const wishlistButtons = document.querySelectorAll('.fa-heart');
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productElement = this.closest('.group') || this.closest('.relative');
            const product = {
                id: productElement.dataset.productId || generateProductId(productElement),
                name: productElement.querySelector('h3').textContent,
                category: productElement.querySelector('p.text-gray-500').textContent,
                price: parseFloat(productElement.querySelector('p.text-pink-600').textContent.replace('$', '')),
                image: productElement.querySelector('img').src
            };
            
            toggleWishlist(product, this);
        });
    });

    // Helper function to generate a product ID if not present
    function generateProductId(element) {
        const name = element.querySelector('h3').textContent;
        return name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Cart functions
    function addToCart(product) {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex >= 0) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    function updateCartDisplay() {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartSubtotal = document.querySelector('.cart-subtotal');
        const cartTotal = document.querySelector('.cart-total');
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-shopping-bag text-4xl mb-2"></i>
                    <p>Your bag is empty</p>
                </div>
            `;
            cartSubtotal.textContent = '$0.00';
            cartTotal.textContent = '$0.00';
            return;
        }
        
        let itemsHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            
            itemsHTML += `
                <div class="flex border-b border-gray-200 pb-4" data-product-id="${item.id}">
                    <div class="w-20 h-20 flex-shrink-0">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded">
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="flex justify-between">
                            <h4 class="text-gray-800 font-medium">${item.name}</h4>
                            <button class="remove-from-cart text-gray-400 hover:text-pink-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <p class="text-gray-500 text-sm">${item.category}</p>
                        <div class="flex justify-between items-center mt-2">
                            <div class="flex items-center border border-gray-300 rounded">
                                <button class="decrease-quantity px-2 py-1 text-gray-600 hover:bg-gray-100">
                                    -
                                </button>
                                <span class="quantity px-2">${item.quantity}</span>
                                <button class="increase-quantity px-2 py-1 text-gray-600 hover:bg-gray-100">
                                    +
                                </button>
                            </div>
                            <span class="text-pink-600 font-medium">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = itemsHTML;
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTotal.textContent = `$${subtotal.toFixed(2)}`;
        
        // Add event listeners to the new cart item buttons
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.closest('[data-product-id]').dataset.productId;
                removeFromCart(productId);
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.closest('[data-product-id]').dataset.productId;
                updateQuantity(productId, 1);
            });
        });
        
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.closest('[data-product-id]').dataset.productId;
                updateQuantity(productId, -1);
            });
        });
    }

    function updateQuantity(productId, change) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        const productIndex = cart.findIndex(item => item.id === productId);
        
        if (productIndex >= 0) {
            cart[productIndex].quantity += change;
            
            if (cart[productIndex].quantity <= 0) {
                cart.splice(productIndex, 1);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCount();
        }
    }

    // Wishlist functions
    function toggleWishlist(product, button) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist'));
        const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
        
        if (existingProductIndex >= 0) {
            wishlist.splice(existingProductIndex, 1);
            button.classList.remove('text-pink-600');
            button.classList.add('text-gray-600');
        } else {
            wishlist.push(product);
            button.classList.remove('text-gray-600');
            button.classList.add('text-pink-600');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    // Initialize the cart count on page load
    updateCartCount();
});