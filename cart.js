let cart = [];

function initCart() {
    const cartCount = document.getElementById("cart-count");
    const cartDrawer = document.getElementById("cart-dropdown");
    const overlay = document.getElementById("cart-overlay");
    const checkoutBtn = document.getElementById("proceedCheckout");
    const cartIconNode = document.getElementById("cart-icon");

    function loadCart() {
        const stored = localStorage.getItem("cart");
        cart = stored ? JSON.parse(stored) : [];
        updateCart(false);
    }

    function updateCart(save = true) {
        const cartItems = document.getElementById("cart-items");
        const totalPriceEl = document.getElementById("cart-total-price");
        if (!cartItems || !totalPriceEl) return;

        cartItems.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = "<p style='font-size:11px;opacity:0.5;'>Cart is empty</p>";
        } else {
            cart.forEach((item, index) => {
                total += item.price;
                const div = document.createElement("div");
                div.classList.add("cart-item");
                div.innerHTML = `
        <div>
          <div style="font-size:12px;margin-bottom:5px;">
          ${item.name} (${item.size || "OS"})
          </div>
          <div style="opacity:0.5;">${item.price} USD</div>
        </div>
        <span onclick="removeItem(${index})">✕</span>
        `;
                cartItems.appendChild(div);
            });
        }

        totalPriceEl.innerText = total + " USD";
        if (cartCount) cartCount.innerText = cart.length;
        if (save) localStorage.setItem("cart", JSON.stringify(cart));
    }

    window.removeItem = function (index) {
        cart.splice(index, 1);
        updateCart();
    };

    if (cartIconNode && cartDrawer && overlay) {
        cartIconNode.onclick = () => {
            cartDrawer.classList.add("show");
            overlay.classList.add("show");
        };

        overlay.onclick = () => {
            cartDrawer.classList.remove("show");
            overlay.classList.remove("show");
        };
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Cart is empty.');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    window.addEventListener("pageshow", loadCart);
    loadCart();

    window.addToCart = function (name, price, size, event) {
        // 1. Chilliger Effekt (Flying Dot)
        if (event) {
            const dot = document.createElement("div");
            dot.style.position = "fixed";
            dot.style.width = "15px";
            dot.style.height = "15px";
            dot.style.borderRadius = "50%";
            dot.style.backgroundColor = "#000";
            dot.style.zIndex = "9999";
            dot.style.pointerEvents = "none";

            // Start at the click position
            const startX = event.clientX;
            const startY = event.clientY;
            dot.style.left = startX + "px";
            dot.style.top = startY + "px";
            dot.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";

            document.body.appendChild(dot);

            // Force reflow
            dot.getBoundingClientRect();

            // Fly to the cart icon
            if (cartIconNode) {
                const cartRect = cartIconNode.getBoundingClientRect();
                dot.style.left = (cartRect.left + cartRect.width / 2) + "px";
                dot.style.top = (cartRect.top + cartRect.height / 2) + "px";
                dot.style.transform = "scale(0.1)";
                dot.style.opacity = "0";
            }

            // Clean up and open drawer after flying finishes
            setTimeout(() => {
                dot.remove();
                executeCartAdd(name, price, size);
            }, 800);
        } else {
            executeCartAdd(name, price, size);
        }
    };

    function executeCartAdd(name, price, size) {
        cart.push({
            name: name,
            price: price,
            size: size
        });
        updateCart();

        if (cartDrawer && overlay) {
            cartDrawer.classList.add("show");
            overlay.classList.add("show");
        }
    }
}

document.addEventListener("DOMContentLoaded", initCart);
