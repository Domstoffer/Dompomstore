console.log("DIESES SERVER.JS LÄUFT JETZT");
const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

let orders = []; // erstmal nur im Speicher

// Bestellung erstellen
app.post("/api/create-order", (req, res) => {
  const { cart, total, shipping } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: "Cart leer" });
  }

  const uniqueAmount = (Number(total) + (orders.length + 1) / 100).toFixed(2);

  const order = {
    id: Date.now().toString(),
    cart,
    shipping: req.body.shipping,
    amount: uniqueAmount,
    wallet: "Cx2TAKyUxVZ3xtWZoTpqmnGcnvkUvoghoKafpsK3KuCp",
    status: "pending"
  };

  orders.push(order);

  res.json({
    orderId: order.id,
    wallet: order.wallet,
    amount: order.amount
  });
});

// Status prüfen
app.get("/api/check-payment/:id", (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Nicht gefunden" });

  res.json({ status: order.status });
});

app.post("/api/mark-paid/:id", async (req, res) => {

  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Nicht gefunden" });

  order.status = "paid";

  try {

    await fetch("http://localhost:8000/panel_9xA3kQ/admin.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cart: order.cart,
        shipping: order.shipping,
        currency: "USDC",
        timestamp: Date.now(),
        status: "Bezahlt",
        website: ""
      })
    });

    console.log("Order an PHP Dashboard gesendet");

  } catch (err) {
    console.log("Fehler beim Senden an PHP:", err);
  }

  res.json({ success: true });
});
app.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});