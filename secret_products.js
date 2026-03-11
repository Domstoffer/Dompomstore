const products = [
    {
        id: "testcyp",
        name: "Testosteron Cypionat",
        price: 80,
        currency: "USDC",
        image: "images/1773198321017-0-test.jpg",
        images: ["images/1773198321017-0-test.jpg"],
        sizes: ["1", "3", "5"],
        stock: 100,
        description: "damit wird man breit"
    }
];

function renderSecretProducts(productsArray) {
    const grid = document.getElementById("main-container");
    if (!grid) return;

    grid.innerHTML = ""; // Clear any existing

    productsArray.forEach(product => {
        const box = document.createElement("div");
        box.className = "product-box";
        box.setAttribute("data-link", "secret_produkt.html?id=" + product.id);
        box.onclick = () => window.location.href = "secret_produkt.html?id=" + product.id;

        box.innerHTML = `
            <div class="image-wrapper"><img loading="lazy" src="${product.image}" alt="${product.name}"></div>
            <div class="product-info-grid">
              <div class="product-name">${product.name}</div>
              <div class="product-price-display" style="display:block; margin-top:8px;">
                <span class="usdc-val" data-price="${product.price}" style="font-size: 13px; color: #777;">${product.price} USDC</span>
              </div>
            </div>
        `;
        grid.appendChild(box);
    });
}

// Automatically render when script is loaded dynamically
renderSecretProducts(products);
