const products = [
    {
        "id": "Fartcoin Shirt",
        "name": "FS-01",
        "price": 29,
        "currency": "USDC",
        "image": "images/1773193258736-0-unisex-garment-dyed-heavyweight-t-shirt-black-back-6953cef82cf54.PNG",
        "images": [
            "images/1773193258736-0-unisex-garment-dyed-heavyweight-t-shirt-black-back-6953cef82cf54.PNG"
        ],
        "sizes": [
            "M",
            "L",
            "S"
        ],
        "stock": 100,
        "description": "Fartcoin shirt das erste DTF print Video seht ihr fit und material unwichtig"
    },
    {
        "id": "01",
        "name": "ZynZynZyn",
        "price": 10,
        "currency": "USDC",
        "image": "images/1773195550399-0-zyn.png",
        "images": [
            "images/1773195550399-0-zyn.png"
        ],
        "sizes": [
            "Slim"
        ],
        "stock": 100,
        "description": "zynzynzynzynzynzynyzyn nikotin snus slim beutel"
    }
];

function renderProducts(productsArray) {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    grid.innerHTML = ""; // Clear any existing

    productsArray.forEach(product => {
        const box = document.createElement("div");
        box.className = "product-box";
        box.setAttribute("data-price", product.price);
        box.onclick = () => window.location.href = "produkt.html?id=" + product.id;

        box.innerHTML = `
            <div class="image-wrapper"><img loading="lazy" src="${product.image}" alt="${product.name}"></div>
            <div class="product-info-grid">
              <div class="product-name">${product.name}</div>\n              <div class="product-price">${product.price} ${product.currency}</div>
            </div>
        `;
        grid.appendChild(box);
    });
}

// Automatically render when script is loaded dynamically
renderProducts(products);
