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
];

// Provide them to the global scope or export depending on usage, but since this is script src="" they just sit here globally.
