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
        const cartSubtotal = document.querySelector('.cart-subtotal-value');
        
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
                    <td class="cart-product-name">${item.name}</td>
                    <td>L${item.price.toFixed(2)}</td>
                    <td>
                        <input type="number" class="cart-quantity" value="${item.quantity}" min="1" data-index="${index}">
                    </td>
                    <td>L${subtotal.toFixed(2)}</td>
                    <td>
                        <button class="cart-remove" data-index="${index}">Eliminar</button>
                    </td>
                `;
                
                cartTableBody.appendChild(row);
            });
            
            // Calcular y mostrar el total
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (cartTotal) {
                cartTotal.textContent = `L${total.toFixed(2)}`;
            }
            if (cartSubtotal) {
                cartSubtotal.textContent = `L${total.toFixed(2)}`;
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
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
                return;
            }
            
            // Recolectar información del cliente
            const customerForm = document.getElementById('customer-info-form');
            if (!customerForm.checkValidity()) {
                alert('Por favor completa todos los campos requeridos.');
                customerForm.reportValidity();
                return;
            }
            
            // Obtener datos del formulario
            const customerName = document.getElementById('customer-name').value;
            const customerEmail = document.getElementById('customer-email').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerAddress = document.getElementById('customer-address').value;
            
            // Crear el recibo
            const receipt = createReceipt(customerName, customerEmail, customerPhone, customerAddress);
            
            // Guardar recibo en localStorage para referencia
            localStorage.setItem('lastReceipt', JSON.stringify(receipt));

            // Generar enlace de WhatsApp
            const whatsappLink = generateWhatsAppLink(receipt);
            
            // Mostrar pantalla de recibo con opciones
            showReceiptPage(receipt, whatsappLink);
            
            // Limpiar carrito
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
        });
    }
    
    // Función para crear el recibo
    function createReceipt(name, email, phone, address) {
        const orderId = generateOrderId();
        const date = new Date().toLocaleString();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Crear listado de productos
        let productsList = cart.map(item => {
            return {
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            };
        });
        
        return {
            orderId: orderId,
            date: date,
            customer: {
                name: name,
                email: email,
                phone: phone,
                address: address
            },
            products: productsList,
            total: total
        };
    }
    
    // Generar ID de orden
    function generateOrderId() {
        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `G9-${timestamp.substring(timestamp.length - 6)}-${randomNum}`;
    }
    
    // Función para generar enlace de WhatsApp con mensaje predefinido
    function generateWhatsAppLink(receipt) {
        // Número de teléfono de la tienda (formato internacional sin el +)
        const storePhone = "5212345678901"; // CAMBIAR POR EL NÚMERO REAL DE LA TIENDA
        
        // Formatear mensaje para WhatsApp
        let message = `*Nuevo Pedido desde G9IMPORTS*\n`;
        message += `🛒 Número de Orden: ${receipt.orderId}\n`;
        message += `📅 Fecha: ${receipt.date}\n\n`;
        
        message += `👤 *Datos del Cliente:*\n`;
        message += `- Nombre: ${receipt.customer.name}\n`;
        message += `- Email: ${receipt.customer.email}\n`;
        message += `- Teléfono: ${receipt.customer.phone}\n`;
        message += `- Dirección: ${receipt.customer.address}\n\n`;
        
        message += `🛍️ *Productos:*\n`;
        receipt.products.forEach(product => {
            message += `- ${product.name} x${product.quantity} - L${product.subtotal.toFixed(2)}\n`;
        });
        
        message += `\n💰 *Total a pagar: L${receipt.total.toFixed(2)}*\n\n`;
        message += `He guardado el recibo de mi compra y a continuación te enviaré una imagen del mismo. ¿Cuál sería el siguiente paso para realizar el pago?`;
        
        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Crear enlace de WhatsApp
        return `https://wa.me/${storePhone}?text=${encodedMessage}`;
    }
    
    // Función para mostrar la página de recibo
    function showReceiptPage(receipt, whatsappLink) {
        // Crear contenedor para el recibo
        const receiptContainer = document.createElement('div');
        receiptContainer.className = 'receipt-page';
        
        // Estilos para la página de recibo
        const styles = `
            <style>
                .receipt-page {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .receipt {
                    border: 1px solid #ddd;
                    padding: 20px;
                    margin-bottom: 20px;
                    background-color: white;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #1a3a8f;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1a3a8f;
                    margin-bottom: 5px;
                }
                .info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .info-section {
                    width: 48%;
                    min-width: 250px;
                    margin-bottom: 15px;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #1a3a8f;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                .total {
                    text-align: right;
                    font-weight: bold;
                    font-size: 18px;
                    margin-top: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 14px;
                    color: #666;
                }
                .actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                }
                .btn {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    text-decoration: none;
                    text-align: center;
                    transition: background-color 0.3s;
                }
                .btn-whatsapp {
                    background-color: #25D366;
                    color: white;
                }
                .btn-whatsapp:hover {
                    background-color: #128C7E;
                }
                .btn-pdf {
                    background-color: #FF5722;
                    color: white;
                }
                .btn-pdf:hover {
                    background-color: #E64A19;
                }
                .btn-continue {
                    background-color: #2196F3;
                    color: white;
                }
                .btn-continue:hover {
                    background-color: #0D47A1;
                }
                .thankyou {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .thankyou h2 {
                    color: #1a3a8f;
                    margin-bottom: 10px;
                }
                .thankyou p {
                    font-size: 16px;
                    line-height: 1.5;
                    margin-bottom: 10px;
                }
                @media (max-width: 600px) {
                    .actions {
                        flex-direction: column;
                    }
                    .btn {
                        width: 100%;
                    }
                }
            </style>
        `;
        
        // Contenido de la página de recibo
        receiptContainer.innerHTML = `
            ${styles}
            <div class="thankyou">
                <h2>¡Gracias por tu compra!</h2>
                <p>Tu pedido ha sido registrado con el número: <strong>${receipt.orderId}</strong></p>
                <p>A continuación encontrarás tu recibo. Puedes guardarlo como PDF y enviarlo por WhatsApp.</p>
            </div>
            
            <div class="receipt" id="receipt">
                <div class="header">
                    <div class="logo">G9IMPORTS</div>
                    <div>Av. Principal #123, Colonia Centro, Ciudad</div>
                    <div>Tel: (XX) XXXX-XXXX | Email: ventas@g9imports.com</div>
                </div>
                
                <div class="info">
                    <div class="info-section">
                        <div class="section-title">Información del Pedido</div>
                        <div>Número de Orden: ${receipt.orderId}</div>
                        <div>Fecha: ${receipt.date}</div>
                    </div>
                    
                    <div class="info-section">
                        <div class="section-title">Información del Cliente</div>
                        <div>Nombre: ${receipt.customer.name}</div>
                        <div>Email: ${receipt.customer.email}</div>
                        <div>Teléfono: ${receipt.customer.phone}</div>
                        <div>Dirección: ${receipt.customer.address}</div>
                    </div>
                </div>
                
                <div class="section-title">Detalle de Productos</div>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${receipt.products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>L${product.price.toFixed(2)}</td>
                                <td>${product.quantity}</td>
                                <td>L${product.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total">Total: L${receipt.total.toFixed(2)}</div>
                
                <div class="footer">
                    <p>¡Gracias por tu compra!</p>
                    <p>Nos pondremos en contacto contigo vía WhatsApp para coordinar el pago y la entrega.</p>
                    <p>Si tienes alguna pregunta, contáctanos al (XX) XXXX-XXXX.</p>
                </div>
            </div>
            
            <div class="actions">
                <a href="${whatsappLink}" target="_blank" class="btn btn-whatsapp">Enviar a WhatsApp</a>
                <button class="btn btn-pdf" id="download-pdf">Guardar como PDF</button>
                <a href="index.html" class="btn btn-continue">Seguir Comprando</a>
            </div>
        `;
        
        // Reemplazar el contenido del carrito con la página de recibo
        const cartContainer = document.querySelector('.cart-container');
        cartContainer.innerHTML = '';
        cartContainer.appendChild(receiptContainer);
        
        // Cargar la librería html2pdf
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = function() {
            // Añadir funcionalidad al botón de PDF
            document.getElementById('download-pdf').addEventListener('click', function() {
                const element = document.getElementById('receipt');
                const opt = {
                    margin: 0.5,
                    filename: `Recibo-${receipt.orderId}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                
                html2pdf().set(opt).from(element).save();
            });
        };
        document.head.appendChild(script);
    }
});