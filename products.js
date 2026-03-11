const products = [
    {
        id: "DB-01",
        name: "DB-01",
        price: 49,
        currency: "USDC",
        image: "images/DB-01.jpg",
        sizes: ["S", "M", "L"],
        stock: 50,
        description: "High quality Dompom shorts. Premium fabric. Comfortable fit. Limited release."
    },
    {
        id: "PS-01",
        name: "PS-01",
        price: 19,
        currency: "USDC",
        image: "images/pepe-shirt.jpg",
        sizes: ["S", "M", "L"],
        stock: 100,
        description: "Minimal Dompom shirt. Limited release."
    },
    {
        id: "TESTCY",
        name: "Testcy",
        price: 30,
        currency: "USDC",
        image: "images/test.jpg",
        sizes: ["OS"],
        stock: 0,
        description: "Test product."
    },
    {
        id: "ZYN",
        name: "ZYN",
        price: 22,
        currency: "USDC",
        image: "images/zyn.png",
        sizes: ["OS"],
        stock: 0,
        description: "Lifestyle essential."
    },
    {
        id: "PROD-05",
        name: "PRODUKT 05",
        price: 18,
        currency: "USDC",
        image: "https://picsum.photos/seed/p05/400/400",
        sizes: ["OS"],
        stock: 10,
        description: "Classic design. Must have piece."
    }
,
    {
        id: "Fartcoin Shirt",
        name: "FS-01",
        price: 29,
        currency: "USDC",
        image: "images/1773193258736-0-unisex-garment-dyed-heavyweight-t-shirt-black-back-6953cef82cf54.PNG",
        images: ["images/1773193258736-0-unisex-garment-dyed-heavyweight-t-shirt-black-back-6953cef82cf54.PNG"],
        sizes: ["M","L","S"],
        stock: 100,
        description: "Fartcoin shirt das erste DTF print Video seht ihr fit und material unwichtig"
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
