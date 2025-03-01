// JavaScript para la funcionalidad del carrito
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrito desde localStorage si existe
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Actualizar contador de items del carrito
    updateCartCount();
    
    // Añadir event listeners a los botones "Añadir al Carrito"
    const addToCartButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-detail');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtener datos del producto
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            
            // Si estamos en la página de detalle del producto, obtener la cantidad
            let quantity = 1;
            const quantityInput = document.getElementById('quantity');
            if (quantityInput) {
                quantity = parseInt(quantityInput.value);
            }
            
            // Buscar si el producto ya está en el carrito
            const existingProductIndex = cart.findIndex(item => item.id === productId);
            
            if (existingProductIndex !== -1) {
                // Si ya existe, incrementar la cantidad
                cart[existingProductIndex].quantity += quantity;
            } else {
                // Si no existe, añadir nuevo item
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: quantity
                });
            }
            
            // Guardar carrito en localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Actualizar contador
            updateCartCount();
            
            // Mostrar mensaje de confirmación
            alert(`Se ha añadido ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${productName} al carrito`);
        });
    });
    
    // Si estamos en la página del carrito, mostrar los items
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
    
    // Función para actualizar el contador de items
    function updateCartCount() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        // Aquí podrías actualizar un elemento en el DOM que muestre el número de items
        // Por ejemplo, si tienes un span con id "cart-count"
        // document.getElementById('cart-count').textContent = cartCount;
    }
    
    // Función para mostrar los items en el carrito
    function displayCartItems() {
        const cartTableBody = document.querySelector('.cart-items');
        const cartEmpty = document.querySelector('.cart-empty');
        const cartContent = document.querySelector('.cart-content');
        const cartTotal = document.querySelector('.cart-total-value');
        
        if (cart.length === 0) {
            // Si el carrito está vacío
            if (cartEmpty && cartContent) {
                cartEmpty.style.display = 'block';
                cartContent.style.display = 'none';
            }
            return;
        }
        
        // Si hay items en el carrito
        if (cartEmpty && cartContent) {
            cartEmpty.style.display = 'none';
            cartContent.style.display = 'block';
        }
        
        // Limpiar tabla
        if (cartTableBody) {
            cartTableBody.innerHTML = '';
            
            // Añadir cada item a la tabla
            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="cart-product-image">
                            <img src="../img/productos/${item.id}.jpg" alt="${item.name}" onerror="this.src='../img/placeholder.jpg'">
                        </div>
                    </td>
                    <td class="cart-product-name">${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <input type="number" class="cart-quantity" value="${item.quantity}" min="1" data-index="${index}">
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td>
                        <button class="cart-remove" data-index="${index}">Eliminar</button>
                    </td>
                `;
                
                cartTableBody.appendChild(row);
            });
            
            // Calcular y mostrar el total
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (cartTotal) {
                cartTotal.textContent = `$${total.toFixed(2)}`;
            }
            
            // Event listeners para actualizar cantidades
            const quantityInputs = document.querySelectorAll('.cart-quantity');
            quantityInputs.forEach(input => {
                input.addEventListener('change', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    const newQuantity = parseInt(this.value);
                    
                    if (newQuantity > 0) {
                        cart[index].quantity = newQuantity;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        displayCartItems();
                        updateCartCount();
                    }
                });
            });
            
            // Event listeners para eliminar items
            const removeButtons = document.querySelectorAll('.cart-remove');
            removeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    cart.splice(index, 1);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    displayCartItems();
                    updateCartCount();
                });
            });
        }
    }
    
    // Event listener para vaciar carrito
    const emptyCartButton = document.querySelector('.cart-empty-button');
    if (emptyCartButton) {
        emptyCartButton.addEventListener('click', function() {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
            updateCartCount();
        });
    }
    
    // Event listener para el botón de finalizar compra
    const checkoutButton = document.querySelector('.cart-checkout');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            alert('¡Gracias por tu compra! En breve recibirás un correo con los detalles.');
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
            updateCartCount();
        });
    }
});