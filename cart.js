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

    window.addToCart = function (name, price, size) {
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
    };
}

document.addEventListener("DOMContentLoaded", initCart);
