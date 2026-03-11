const products = [
    {
        "id": "1",
        "name": "EXCLUSIVE 01",
        "price": 120,
        "currency": "USDC",
        "image": "https://picsum.photos/seed/prv01/800/800",
        "images": ["https://picsum.photos/seed/prv01/800/800"],
        "sizes": ["OS"],
        "stock": 10,
        "description": "Exclusive item from the Secret Vault."
    },
    {
        "id": "2",
        "name": "EXCLUSIVE 02",
        "price": 90,
        "currency": "USDC",
        "image": "https://picsum.photos/seed/prv02/800/800",
        "images": ["https://picsum.photos/seed/prv02/800/800"],
        "sizes": ["OS"],
        "stock": 10,
        "description": "Exclusive item from the Secret Vault."
    },
    {
        "id": "3",
        "name": "EXCLUSIVE 03",
        "price": 75,
        "currency": "USDC",
        "image": "https://picsum.photos/seed/prv03/800/800",
        "images": ["https://picsum.photos/seed/prv03/800/800"],
        "sizes": ["OS"],
        "stock": 10,
        "description": "Exclusive item from the Secret Vault."
    },
    {
        "id": "4",
        "name": "EXCLUSIVE 04",
        "price": 200,
        "currency": "USDC",
        "image": "https://picsum.photos/seed/prv04/800/800",
        "images": ["https://picsum.photos/seed/prv04/800/800"],
        "sizes": ["OS"],
        "stock": 10,
        "description": "Exclusive item from the Secret Vault."
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
